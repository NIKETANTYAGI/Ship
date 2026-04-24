/**
 * BE3 — Day 5: ULIP (Unified Logistics Interface Platform) Mock Client
 *
 * ULIP is a DPIIT government API for vehicle tracking and logistics data.
 * Real credentials take 7–14 business days from ulip.dpiit.gov.in.
 * This stub returns realistic mock data so BE2 can build against the interface
 * without being blocked.
 *
 * Replace MOCK_MODE with real HTTP calls once credentials arrive.
 */

import dotenv from 'dotenv';
dotenv.config();

const MOCK_MODE = !process.env.ULIP_TOKEN || process.env.NODE_ENV !== 'production';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VehicleInfo {
  vehicle_number: string;
  owner_name: string;
  vehicle_type: string;         // e.g., "LIGHT_COMMERCIAL_VEHICLE"
  fuel_type: string;            // DIESEL | PETROL | CNG | ELECTRIC
  registration_date: string;    // ISO date
  is_valid: boolean;
  fitness_upto: string;         // ISO date
  insurance_valid_upto: string; // ISO date
  state: string;
}

export interface DriverInfo {
  license_number: string;
  name: string;
  dob: string;
  license_type: string;        // LMV | LMV-TR | TRANS
  valid_upto: string;          // ISO date
  issuing_rto: string;
  is_valid: boolean;
}

export interface VehicleLocation {
  vehicle_number: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  timestamp: string;
  source: 'VAHAN' | 'FASTAG' | 'GPS';
}

// ─── Client ───────────────────────────────────────────────────────────────────

/**
 * Fetch vehicle registration details from ULIP/Vahan API
 */
export async function getVehicleInfo(vehicleNumber: string): Promise<VehicleInfo | null> {
  if (MOCK_MODE) {
    console.log(`[ULIP] MOCK — getVehicleInfo(${vehicleNumber})`);
    return {
      vehicle_number: vehicleNumber.toUpperCase(),
      owner_name: 'SWIFT LOGISTICS PVT LTD',
      vehicle_type: 'LIGHT_COMMERCIAL_VEHICLE',
      fuel_type: 'DIESEL',
      registration_date: '2021-03-15',
      is_valid: true,
      fitness_upto: '2027-03-14',
      insurance_valid_upto: '2025-12-31',
      state: 'Delhi',
    };
  }

  try {
    const resp = await fetch('https://api.ulip.dpiit.gov.in/api/v1/vahan/vehicleinfo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ULIP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vehicleNumber }),
    });

    if (!resp.ok) throw new Error(`ULIP HTTP ${resp.status}`);
    const data = await resp.json();
    return data as VehicleInfo;
  } catch (err) {
    console.error('[ULIP] getVehicleInfo failed:', err);
    return null;
  }
}

/**
 * Fetch driver license details from ULIP/Sarathi API
 */
export async function getDriverInfo(licenseNumber: string): Promise<DriverInfo | null> {
  if (MOCK_MODE) {
    console.log(`[ULIP] MOCK — getDriverInfo(${licenseNumber})`);
    return {
      license_number: licenseNumber.toUpperCase(),
      name: 'RAMESH KUMAR',
      dob: '1988-06-22',
      license_type: 'LMV-TR',
      valid_upto: '2030-06-21',
      issuing_rto: 'RTO DELHI WEST',
      is_valid: true,
    };
  }

  try {
    const resp = await fetch('https://api.ulip.dpiit.gov.in/api/v1/sarathi/driverlicense', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ULIP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dlNumber: licenseNumber }),
    });
    if (!resp.ok) throw new Error(`ULIP HTTP ${resp.status}`);
    const data = await resp.json();
    return data as DriverInfo;
  } catch (err) {
    console.error('[ULIP] getDriverInfo failed:', err);
    return null;
  }
}

/**
 * Get real-time GPS/FASTag location of a vehicle (ULIP/GPS API)
 */
export async function getVehicleLocation(vehicleNumber: string): Promise<VehicleLocation | null> {
  if (MOCK_MODE) {
    console.log(`[ULIP] MOCK — getVehicleLocation(${vehicleNumber})`);
    return {
      vehicle_number: vehicleNumber.toUpperCase(),
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
      speed_kmh: Math.floor(Math.random() * 80),
      timestamp: new Date().toISOString(),
      source: 'GPS',
    };
  }

  try {
    const resp = await fetch('https://api.ulip.dpiit.gov.in/api/v1/gps/vehicletrack', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ULIP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vehicleNumber }),
    });
    if (!resp.ok) throw new Error(`ULIP HTTP ${resp.status}`);
    const data = await resp.json();
    return data as VehicleLocation;
  } catch (err) {
    console.error('[ULIP] getVehicleLocation failed:', err);
    return null;
  }
}
