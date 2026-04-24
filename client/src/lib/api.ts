import { MOCK_USER, MOCK_COURIERS, MOCK_SHIPMENTS, MOCK_TRACKING, MOCK_ADDRESSES } from './mockData';

/// <reference types="vite/client" />
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

// Environment configuration
const ENV = (import.meta as any).env?.VITE_ENV || 'development';
const IS_PROD = ENV === 'production';
const USE_MOCK = !IS_PROD && (import.meta as any).env?.VITE_USE_MOCK === 'true';

// Clear and professional logging
if (USE_MOCK) {
  console.log("%c[API MODE]: MOCK", "color: #ff5722; font-weight: bold;");
} else {
  console.log("%c[API MODE]: REAL", "color: #2196f3; font-weight: bold;");
}

// In-memory mock address store for add/delete in mock mode
let mockAddressStore = [...MOCK_ADDRESSES];
let mockAddrIdCounter = MOCK_ADDRESSES.length + 1;

// Helper for dynamic mock tokens to avoid hardcoded secrets
const generateMockToken = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2)}_${Date.now()}`;

function getMockResponse(endpoint: string, options?: RequestInit) {
  const method = options?.method?.toUpperCase() || 'GET';

  if (endpoint.includes('/auth/send-otp')) return { data: { success: true } };
  if (endpoint.includes('/auth/verify-otp')) return { data: { access_token: generateMockToken('mock_otp'), user: MOCK_USER } };
  if (endpoint.includes('/auth/google')) return { data: { access_token: generateMockToken('mock_google'), user: MOCK_USER } };
  if (endpoint.includes('/users/profile')) return { data: MOCK_USER };
  if (endpoint.includes('/users/shipments')) {
    const urlParams = new URL(endpoint.startsWith('http') ? endpoint : `http://localhost${endpoint}`).searchParams;
    const status = urlParams.get('status');
    let filtered = MOCK_SHIPMENTS;
    if (status) {
      filtered = MOCK_SHIPMENTS.filter((s: any) => s.status === status);
    }
    return { data: { shipments: filtered, pagination: { total: filtered.length } } };
  }

  // Address CRUD
  if (endpoint.includes('/users/addresses')) {
    if (method === 'POST') {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      const newAddr = { id: String(mockAddrIdCounter++), ...body };
      mockAddressStore.unshift(newAddr);
      return { data: newAddr };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/').pop();
      mockAddressStore = mockAddressStore.filter(a => a.id !== id);
      return { data: { success: true } };
    }
    return { data: mockAddressStore };
  }

  if (endpoint.includes('/couriers/rates')) return { data: MOCK_COURIERS };
  if (endpoint.includes('/tracking')) {
     const awb = endpoint.split('/').pop() || "";
     const found = MOCK_TRACKING[awb];
     return { data: found || Object.values(MOCK_TRACKING)[0] };
  }
  if (endpoint.includes('/shipments/')) return { data: MOCK_SHIPMENTS[0] };
  
  return { data: null };
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  if (USE_MOCK) {
    return getMockResponse(endpoint, options);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = localStorage.getItem('access_token');
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    const errorMsg = data?.error?.message || 'Something went wrong. Please try again.';
    // Only log errors in development
    if (!IS_PROD) console.error(`[API Error] ${response.status} ${url}: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  return data;
}

export interface CourierRatePayload {
  pickup: string;
  delivery: string;
  weight: number; // in grams
  length?: number;
  width?: number;
  height?: number;
  is_cod?: boolean;
}

export async function getCourierRates(payload: CourierRatePayload) {
  const queryParams = new URLSearchParams();
  queryParams.append('pickup', payload.pickup);
  queryParams.append('delivery', payload.delivery);
  queryParams.append('weight', payload.weight.toString()); 
  
  if (payload.length !== undefined) queryParams.append('length', payload.length.toString());
  if (payload.width !== undefined) queryParams.append('width', payload.width.toString());
  if (payload.height !== undefined) queryParams.append('height', payload.height.toString());
  if (payload.is_cod !== undefined) queryParams.append('is_cod', payload.is_cod.toString());

  const data = await fetchAPI(`/couriers/rates?${queryParams.toString()}`);
  return data.data;
}

export async function getTracking(awb: string) {
  const data = await fetchAPI(`/tracking/${awb}`);
  return data.data;
}

export async function getDashboardData(page = 1, limit = 20, status?: string) {
  const queryParams = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  
  // Convert frontend status format to API format if needed
  let apiStatus = status;
  if (status === 'Delivered') apiStatus = 'delivered';
  else if (status === 'In Transit') apiStatus = 'in_transit';
  else if (status === 'Out for Delivery') apiStatus = 'out_for_delivery';
  else if (status === 'Pending') apiStatus = 'pending';
  else if (status === 'Draft') apiStatus = 'draft';
  else if (status === 'Failed' || status === 'Cancelled') apiStatus = 'cancelled';
  
  if (apiStatus && apiStatus !== 'All') {
    queryParams.append('status', apiStatus.toLowerCase());
  }
  
  const data = await fetchAPI(`/users/shipments?${queryParams.toString()}`);
  return data.data; 
}

export async function registerUser(payload: { name: string, email: string, phone: string, password?: string, username: string }) {
  const data = await fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function loginUser(email: string) {
  const data = await fetchAPI('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  return data.data;
}

export async function verifyOtp(email: string, otp: string) {
  const data = await fetchAPI('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
  return data.data;
}

export async function verifyFirebaseToken(idToken: string) {
  const data = await fetchAPI('/auth/firebase-verify', {
    method: 'POST',
    body: JSON.stringify({ idToken })
  });
  return data.data;
}

export async function loginWithGoogle() {
  const data = await fetchAPI('/auth/google', {
    method: 'POST'
  });
  return data.data;
}

export async function getUserProfile() {
  const data = await fetchAPI('/users/profile');
  return data.data;
}

export async function updateUserProfile(payload: { name?: string, email?: string }) {
  const data = await fetchAPI('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function getAddresses() {
  const data = await fetchAPI('/users/addresses');
  return data.data;
}

export async function addAddress(payload: any) {
  const data = await fetchAPI('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function updateAddress(id: string, payload: any) {
  const data = await fetchAPI(`/users/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function deleteAddress(id: string) {
  const data = await fetchAPI(`/users/addresses/${id}`, {
    method: 'DELETE'
  });
  return data.data;
}

export async function getShipmentDetail(id: string) {
  const data = await fetchAPI(`/shipments/${id}`);
  return data.data;
}

export async function searchAddresses(query: string) {
  const data = await fetchAPI('/address/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
  return data.data;
}

export async function bulkBookShipments(shipments: any[]) {
  const data = await fetchAPI('/shipments/bulk-book', {
    method: 'POST',
    body: JSON.stringify({ shipments })
  });
  return data.data;
}

export async function getAdminRevenueStats(days = 30) {
  const data = await fetchAPI(`/admin/revenue/dashboard?days=${days}`);
  return data.data;
}

export async function getCourierConfigs() {
  const data = await fetchAPI('/admin/couriers');
  return data.data;
}

export async function updateCourierConfig(id: string, payload: { is_active?: boolean, markup_percentage?: number }) {
  const data = await fetchAPI(`/admin/couriers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function initiateKYC(aadhaarNumber: string) {
  const data = await fetchAPI('/users/kyc/initiate', {
    method: 'POST',
    body: JSON.stringify({ aadhaar_number: aadhaarNumber })
  });
  return data.data;
}

export async function verifyKYC(sessionId: string, otp: string) {
  const data = await fetchAPI('/users/kyc/verify', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, otp })
  });
  return data.data;
}

export async function downloadShipmentLabel(shipmentId: string) {
  const data = await fetchAPI(`/shipments/${shipmentId}/label`);
  return data.data;
}

export async function downloadAdminReport() {
  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/admin/revenue/report/pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) throw new Error('Failed to download report');
  return response.blob();
}
