import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import bwipjs from 'bwip-js';
import db from '../Database/db';
import { uploadFile } from './s3';

export const generateShippingLabel = async (shipmentId: string): Promise<string | null> => {
  try {
    // 1. Fetch Shipment
    const { rows } = await db.query(
      `SELECT 
         s.awb, s.weight_grams, s.dimensions_cm as dimensions, c.name as courier_id,
         pa.name as pa_name, pa.phone as pa_phone, pa.flat as pa_flat, pa.area as pa_area, pa.city as pa_city, pa.state as pa_state, pa.pincode as pa_pincode,
         da.name as da_name, da.phone as da_phone, da.flat as da_flat, da.area as da_area, da.city as da_city, da.state as da_state, da.pincode as da_pincode
       FROM shipments s
       LEFT JOIN couriers c ON s.courier_id = c.id
       LEFT JOIN addresses pa ON s.pickup_address_id = pa.id
       LEFT JOIN addresses da ON s.delivery_address_id = da.id
       WHERE s.id = $1`,
      [shipmentId]
    );

    if (rows.length === 0 || !rows[0].awb) {
      throw new Error('Shipment not found or AWB not generated');
    }

    const s = rows[0];
    const pickupFullAddress = `${s.pa_flat ? s.pa_flat + ', ' : ''}${s.pa_area}`;
    const deliveryFullAddress = `${s.da_flat ? s.da_flat + ', ' : ''}${s.da_area}`;

    s.pickup_address = { name: s.pa_name, phone: s.pa_phone, full_address: pickupFullAddress, city: s.pa_city, state: s.pa_state, pincode: s.pa_pincode };
    s.delivery_address = { name: s.da_name, phone: s.da_phone, full_address: deliveryFullAddress, city: s.da_city, state: s.da_state, pincode: s.da_pincode };

    // 2. Generate Barcode buffer (Code128 format)
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: s.awb,
      scale: 3,
      height: 10,
      includetext: false,
    });

    // 3. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]); 
    const { width, height } = page.getSize();

    // Embed fonts and images
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
    const barcodeDims = barcodeImage.scale(0.5);

    // Draw header
    page.drawText('SWIFTROUTE', { x: 20, y: height - 40, size: 22, font: fontBold, color: rgb(0, 0.4, 0.8) });
    page.drawText('SHIPPING LABEL', { x: 170, y: height - 40, size: 18, font: fontBold });
    
    page.drawText(`Courier: ${s.courier_id?.toUpperCase() || 'STANDARD'}`, { x: 20, y: height - 65, size: 12, font });
    page.drawText(`Weight: ${s.weight_grams / 1000} KG`, { x: 180, y: height - 65, size: 12, font });
    
    if (s.dimensions) {
        const d = s.dimensions;
        page.drawText(`Dim: ${d.l}x${d.w}x${d.h} cm`, { x: 280, y: height - 65, size: 12, font });
    }

    // Draw From Box (Sender)
    page.drawRectangle({ x: 15, y: height - 200, width: 370, height: 110, borderColor: rgb(0, 0, 0), borderWidth: 1 });
    page.drawText('FROM:', { x: 20, y: height - 110, size: 12, font: fontBold });
    page.drawText(s.pickup_address.name, { x: 20, y: height - 130, size: 11, font });
    page.drawText(s.pickup_address.full_address.substring(0, 55), { x: 20, y: height - 145, size: 10, font });
    page.drawText(`${s.pickup_address.city}, ${s.pickup_address.state} - ${s.pickup_address.pincode}`, { x: 20, y: height - 160, size: 10, font });
    page.drawText(`Phone: +91 ${s.pickup_address.phone}`, { x: 20, y: height - 180, size: 10, font: fontBold });

    // Draw To Box (Receiver) - HIGHLIGHTED
    page.drawRectangle({ x: 15, y: height - 340, width: 370, height: 120, borderColor: rgb(0, 0, 0), borderWidth: 2 });
    page.drawText('TO:', { x: 20, y: height - 240, size: 14, font: fontBold });
    page.drawText(s.delivery_address.name.toUpperCase(), { x: 20, y: height - 265, size: 14, font: fontBold });
    page.drawText(s.delivery_address.full_address.substring(0, 55), { x: 20, y: height - 285, size: 12, font });
    page.drawText(`${s.delivery_address.city}, ${s.delivery_address.state} - ${s.delivery_address.pincode}`, { x: 20, y: height - 305, size: 12, font: fontBold });
    page.drawText(`Phone: +91 ${s.delivery_address.phone}`, { x: 20, y: height - 325, size: 12, font: fontBold });

    // Draw Barcode Center bottom
    const bx = (width / 2) - (barcodeDims.width / 2);
    page.drawImage(barcodeImage, {
      x: bx,
      y: 100,
      width: barcodeDims.width,
      height: barcodeDims.height,
    });
    
    // Draw AWB Text under barcode
    page.drawText(`AWB: ${s.awb}`, { x: bx + 10, y: 70, size: 16, font: fontBold });

    // Footer
    page.drawText('Computer Generated Label. No Signature Required.', { x: 80, y: 30, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

    // 4. Save and Upload via S3 Client
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    const key = `labels/${shipmentId}.pdf`;

    await uploadFile(key, buffer, 'application/pdf');

    return key;

  } catch (error) {
    console.error('❌ Label Generation Error:', error);
    return null;
  }
};

export const generateTaxInvoice = async (shipmentId: string): Promise<string | null> => {
  try {
    // 1. Fetch Shipment and Payment Details
    const { rows } = await db.query(
      `SELECT 
         s.awb, s.charge, s.weight_grams, s.created_at,
         u.name as user_name, u.email as user_email,
         pa.name as pa_name, pa.area as pa_area, pa.city as pa_city, pa.pincode as pa_pincode,
         da.name as da_name, da.area as da_area, da.city as da_city, da.pincode as da_pincode
       FROM shipments s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN addresses pa ON s.pickup_address_id = pa.id
       LEFT JOIN addresses da ON s.delivery_address_id = da.id
       WHERE s.id = $1`,
      [shipmentId]
    );

    if (rows.length === 0) throw new Error('Shipment not found');
    const s = rows[0];

    const amount = parseFloat(s.charge);
    const gstPct = 0.18;
    const baseAmount = amount / (1 + gstPct);
    const gstAmount = amount - baseAmount;

    // 2. Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 Size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText('TAX INVOICE', { x: 50, y: height - 60, size: 24, font: fontBold });
    page.drawText('SwiftRoute Logistics Pvt Ltd', { x: 50, y: height - 90, size: 12, font: fontBold });
    page.drawText('123 Logistics Park, Gurgaon, Haryana - 122001', { x: 50, y: height - 105, size: 10, font });
    page.drawText('GSTIN: 07AAACS1234F1Z5', { x: 50, y: height - 120, size: 10, font });

    // Invoice Info
    page.drawText(`Invoice No: INV-${shipmentId.split('-')[0].toUpperCase()}`, { x: 400, y: height - 90, size: 10, font });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 400, y: height - 105, size: 10, font });
    page.drawText(`AWB: ${s.awb || 'N/A'}`, { x: 400, y: height - 120, size: 10, font });

    // Bill To
    page.drawText('BILL TO:', { x: 50, y: height - 170, size: 12, font: fontBold });
    page.drawText(s.user_name || 'Customer', { x: 50, y: height - 190, size: 12, font });
    page.drawText(s.user_email || '', { x: 50, y: height - 205, size: 10, font });

    // Table Header
    page.drawRectangle({ x: 50, y: height - 280, width: 495, height: 30, color: rgb(0.95, 0.95, 0.95) });
    page.drawText('Description', { x: 60, y: height - 262, size: 10, font: fontBold });
    page.drawText('HSN', { x: 300, y: height - 262, size: 10, font: fontBold });
    page.drawText('Base Amount', { x: 380, y: height - 262, size: 10, font: fontBold });
    page.drawText('Total', { x: 480, y: height - 262, size: 10, font: fontBold });

    // Table Content
    page.drawText(`Shipping Services (${s.weight_grams}g)`, { x: 60, y: height - 300, size: 10, font });
    page.drawText('996812', { x: 300, y: height - 300, size: 10, font });
    page.drawText(`INR ${baseAmount.toFixed(2)}`, { x: 380, y: height - 300, size: 10, font });
    page.drawText(`INR ${amount.toFixed(2)}`, { x: 480, y: height - 300, size: 10, font });

    // Draw Totals section
    page.drawText(`Base Amount: INR ${baseAmount.toFixed(2)}`, { x: 350, y: 150, size: 12, font: fontBold });
    page.drawText(`GST (18%): INR ${gstAmount.toFixed(2)}`, { x: 350, y: 130, size: 12, font: fontBold });
    page.drawRectangle({ x: 345, y: 105, width: 230, height: 2, color: rgb(0, 0, 0) });
    page.drawText(`TOTAL PAID: INR ${amount.toFixed(2)}`, { x: 350, y: 85, size: 14, font: fontBold });

    // Footer
    page.drawText('Note: This is a computer generated invoice and does not require a physical signature.', { x: 50, y: 50, size: 10, font });
    page.drawText('Thank you for choosing SwiftRoute!', { x: 50, y: 35, size: 10, font: fontBold, color: rgb(0, 0.4, 0.8) });

    // 4. Save and Upload via S3 Client
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);
    const key = `invoices/${shipmentId}.pdf`;

    await uploadFile(key, buffer, 'application/pdf');

    return key;
  } catch (error) {
    console.error('❌ Tax Invoice Generation Error:', error);
    return null;
  }
};

/**
 * Generates a Manifest PDF (Courier Handover Document) 
 * for a list of shipments.
 */
export const generateManifest = async (shipmentIds: string[], courierId: string): Promise<string | null> => {
    try {
        const { rows } = await db.query(
            `SELECT s.awb, s.weight_grams, a.city, a.pincode, s.id
             FROM shipments s
             LEFT JOIN addresses a ON s.delivery_address_id = a.id
             WHERE s.id = ANY($1)`,
            [shipmentIds]
        );

        if (rows.length === 0) throw new Error('No shipments found for manifest');

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Header
        page.drawText('SHIPMENT MANIFEST (HANDOVER)', { x: 50, y: height - 50, size: 20, font: fontBold });
        page.drawText(`Courier Partner: ${courierId.toUpperCase()}`, { x: 50, y: height - 80, size: 12, font });
        page.drawText(`Date: ${new Date().toLocaleString()}`, { x: 50, y: height - 95, size: 10, font });
        page.drawText(`Total Shipments: ${rows.length}`, { x: 400, y: height - 80, size: 12, font: fontBold });

        // Table Header
        let y = height - 140;
        page.drawRectangle({ x: 50, y: y - 5, width: 500, height: 25, color: rgb(0.9, 0.9, 0.9) });
        page.drawText('S.No', { x: 60, y: y + 5, size: 10, font: fontBold });
        page.drawText('AWB Number', { x: 100, y: y + 5, size: 10, font: fontBold });
        page.drawText('Destination', { x: 250, y: y + 5, size: 10, font: fontBold });
        page.drawText('Weight', { x: 450, y: y + 5, size: 10, font: fontBold });

        // Table Rows
        rows.forEach((row: any, i: number) => {
            y -= 25;
            page.drawText(`${i + 1}`, { x: 60, y: y, size: 10, font });
            page.drawText(row.awb || 'N/A', { x: 100, y: y, size: 10, font });
            page.drawText(`${row.city} (${row.pincode})`, { x: 250, y: y, size: 10, font });
            page.drawText(`${row.weight_grams}g`, { x: 450, y: y, size: 10, font });
        });

        // Signature Sections
        y -= 100;
        if (y < 100) {
            // Add new page if space is low
            const newPage = pdfDoc.addPage([595, 842]);
            y = 700;
        }

        page.drawRectangle({ x: 50, y: y - 60, width: 200, height: 1, color: rgb(0, 0, 0) });
        page.drawText('Warehouse Dispatcher Sign', { x: 50, y: y - 80, size: 10, font });

        page.drawRectangle({ x: 350, y: y - 60, width: 200, height: 1, color: rgb(0, 0, 0) });
        page.drawText(`${courierId.toUpperCase()} Pickup Agent Sign`, { x: 350, y: y - 80, size: 10, font });

        const pdfBytes = await pdfDoc.save();
        const manifestId = `MF-${Date.now()}`;
        const key = `manifests/${manifestId}.pdf`;
        await uploadFile(key, Buffer.from(pdfBytes), 'application/pdf');

        return key;

    } catch (error) {
        console.error('❌ Manifest Generation Error:', error);
        return null;
    }
};

/**
 * Generates a high-level System Revenue & Performance Report for Admins.
 */
export const generateAdminReport = async (data: {
    gmv: number;
    shipmentCount: number;
    walletLiability: number;
    activeDisputes: number;
    couriers: any[];
}): Promise<Buffer | null> => {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const primaryColor = rgb(0, 0.4, 0.8);

        // Header
        page.drawRectangle({ x: 0, y: height - 100, width, height: 100, color: primaryColor });
        page.drawText('SWIFTROUTE SYSTEM PERFORMANCE', { x: 50, y: height - 60, size: 24, font: fontBold, color: rgb(1, 1, 1) });
        page.drawText(`Report Generated: ${new Date().toLocaleString()}`, { x: 50, y: height - 85, size: 10, font, color: rgb(1, 1, 1) });

        // Executive Summary Metrics
        let y = height - 150;
        page.drawText('EXECUTIVE SUMMARY', { x: 50, y, size: 16, font: fontBold, color: primaryColor });
        
        const metricsY = y - 40;
        const boxWidth = 110;
        const drawMetricBox = (label: string, value: string, x: number) => {
            page.drawRectangle({ x, y: metricsY - 50, width: boxWidth, height: 60, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 1 });
            page.drawText(label, { x: x + 10, y: metricsY, size: 10, font: fontBold });
            page.drawText(value, { x: x + 10, y: metricsY - 30, size: 12, font: fontBold, color: primaryColor });
        };

        drawMetricBox('Total GMV', `INR ${data.gmv.toLocaleString()}`, 50);
        drawMetricBox('Shipments', data.shipmentCount.toString(), 180);
        drawMetricBox('Wallet Liability', `INR ${data.walletLiability.toLocaleString()}`, 310);
        drawMetricBox('Disputes', data.activeDisputes.toString(), 440);

        // Courier Performance Table
        y = metricsY - 100;
        page.drawText('COURIER PERFORMANCE (LAST 30 DAYS)', { x: 50, y, size: 16, font: fontBold, color: primaryColor });
        
        y -= 30;
        page.drawRectangle({ x: 50, y: y - 5, width: 500, height: 25, color: rgb(0.9, 0.9, 0.9) });
        page.drawText('Courier Name', { x: 60, y: y + 5, size: 10, font: fontBold });
        page.drawText('Total bookings', { x: 200, y: y + 5, size: 10, font: fontBold });
        page.drawText('RTO Rate', { x: 330, y: y + 5, size: 10, font: fontBold });
        page.drawText('NDR Rate', { x: 450, y: y + 5, size: 10, font: fontBold });

        data.couriers.forEach((c) => {
            y -= 25;
            page.drawText(c.courier_name, { x: 60, y, size: 10, font });
            page.drawText(c.total_shipments.toString(), { x: 200, y, size: 10, font });
            page.drawText(`${c.rto_percentage}%`, { x: 330, y, size: 10, font, color: parseFloat(c.rto_percentage) > 10 ? rgb(0.8, 0, 0) : rgb(0, 0.5, 0) });
            page.drawText(`${c.ndr_percentage}%`, { x: 450, y, size: 10, font });
        });

        // Footer
        page.drawText('SwiftRoute Logistics Dashboard Export - Confidential', { x: width / 2 - 140, y: 30, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);

    } catch (error) {
        console.error('❌ Admin Report Generation Error:', error);
        return null;
    }
};

