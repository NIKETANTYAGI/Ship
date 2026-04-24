import { Response } from 'express';
import db from '../../../Database/db';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { generateAdminReport } from '../../../lib/pdf-generator';

/**
 * GET /admin/revenue/dashboard
 * Aggregates core system logic from PostgreSQL to surface high-level performance metrics.
 */
export const getRevenueDashboard = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { days } = req.query;
        const limitDays = parseInt(days as string) || 30;

        // 1. Refresh Materialized View to ensure courier stats are live
        await db.query('REFRESH MATERIALIZED VIEW mv_courier_performance');

        // 2. Calculate GMV (Gross Merchandise Value) over the desired window
        const gmvRes = await db.query(
            `SELECT SUM(charge * 100) as total_paise, COUNT(*) as count 
             FROM shipments 
             WHERE status != 'cancelled' 
             AND created_at >= NOW() - INTERVAL '1 day' * $1`,
            [limitDays]
        );
        const totalGmvPaise = gmvRes.rows[0].total_paise || 0;
        const totalShipments = parseInt(gmvRes.rows[0].count) || 0;

        // 3. Average Revenue Per Shipment (ARPS)
        const arpsPaise = totalShipments > 0 ? (totalGmvPaise / totalShipments) : 0;

        // 4. Wallet Capitalization (Total liabilities system holds for users)
        // BUG FIX: wallet_balance is already in paise, remove * 100
        const walletRes = await db.query(`SELECT SUM(wallet_balance) as total_liability FROM users`);
        const totalWalletLiability = walletRes.rows[0].total_liability || 0;

        // 5. Pending COD (Money collected by couriers but not yet remitted to users)
        const codRes = await db.query(`SELECT SUM(amount * 100) as total_pending FROM cod_collections WHERE status = 'COLLECTED'`);
        const totalPendingCod = codRes.rows[0].total_pending || 0;

        // 6. Active Disputes (PENDING)
        const disputeRes = await db.query(`SELECT COUNT(*) FROM disputes WHERE status = 'PENDING'`);
        const activeDisputes = parseInt(disputeRes.rows[0].count) || 0;

        // 7. Time series points (Daily GMV) for frontend charting
        const trendRes = await db.query(
            `SELECT DATE(created_at) as date, SUM(charge * 100) as daily_gmv, COUNT(*) as daily_shipments
             FROM shipments
             WHERE status != 'cancelled' AND created_at >= NOW() - INTERVAL '1 day' * $1
             GROUP BY DATE(created_at)
             ORDER BY date ASC`,
            [limitDays]
        );

        // 8. Courier Performance (from Fresh Materialized View)
        const perfRes = await db.query(`SELECT * FROM mv_courier_performance ORDER BY total_shipments DESC`);

        return res.status(200).json({
            success: true,
            data: {
                timeframe_days: limitDays,
                metrics: {
                    total_gmv_paise: parseInt(totalGmvPaise),
                    total_gmv_rupees: parseInt(totalGmvPaise) / 100,
                    arps_paise: Math.round(arpsPaise),
                    arps_rupees: Math.round(arpsPaise) / 100,
                    total_shipments: totalShipments,
                    wallet_liabilities_paise: parseInt(totalWalletLiability),
                    wallet_liabilities_rupees: parseInt(totalWalletLiability) / 100,
                    pending_cod_paise: parseInt(totalPendingCod),
                    pending_cod_rupees: parseInt(totalPendingCod) / 100,
                    active_disputes: activeDisputes
                },
                chart_data: trendRes.rows.map((r: any) => ({
                    date: r.date,
                    gmv_paise: parseInt(r.daily_gmv),
                    gmv_rupees: parseInt(r.daily_gmv) / 100,
                    volume: parseInt(r.daily_shipments)
                })),
                courier_performance: perfRes.rows.map((r: any) => ({
                    courier_name: r.courier_name,
                    total: parseInt(r.total_shipments),
                    rto_rate: parseFloat(r.rto_percentage),
                    ndr_rate: parseFloat(r.ndr_percentage)
                }))
            }
        });
    } catch (error) {
        console.error('getRevenueDashboard error:', error);
        return res.status(500).json({ success: false, error: { code: 'SERVER_001', message: 'Internal server error' } });
    }
};

/**
 * GET /admin/revenue/download-report
 * Generates and streams a PDF report for system performance.
 */
export const downloadRevenueReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Gathering data (Similar to dashboard but optimized for PDF)
        await db.query('REFRESH MATERIALIZED VIEW mv_courier_performance');
        
        const metrics = await db.query(`
            SELECT 
                (SELECT SUM(charge) FROM shipments WHERE status != 'cancelled') as gmv,
                (SELECT COUNT(*) FROM shipments WHERE status != 'cancelled') as count,
                (SELECT SUM(wallet_balance) FROM users) as wallet,
                (SELECT COUNT(*) FROM disputes WHERE status = 'PENDING') as disputes
        `);
        
        const performance = await db.query(`SELECT * FROM mv_courier_performance ORDER BY total_shipments DESC LIMIT 10`);

        const reportData = {
            gmv: parseFloat(metrics.rows[0].gmv || 0),
            shipmentCount: parseInt(metrics.rows[0].count || 0),
            walletLiability: parseInt(metrics.rows[0].wallet || 0) / 100,
            activeDisputes: parseInt(metrics.rows[0].disputes || 0),
            couriers: performance.rows
        };

        const pdfBuffer = await generateAdminReport(reportData);
        
        if (!pdfBuffer) {
            return res.status(500).json({ success: false, message: 'PDF Generation failed' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SwiftRoute_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        return res.send(pdfBuffer);

    } catch (error) {
        console.error('downloadRevenueReport error:', error);
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
};
