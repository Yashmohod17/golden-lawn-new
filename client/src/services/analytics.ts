const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function getAnalyticsHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
      }
    }
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }
  return response.json();
}

export const analyticsService = {
  async getOverview(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/overview?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },
  
  async getRevenue(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/revenue?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getBookings(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/bookings?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getCustomers(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/customers?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getPayments(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/payments?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },


  async getOccupancy(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/occupancy?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getLeads(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/leads?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getPackages(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/packages?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getEvents(params?: { filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/events?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getReports(params?: { category?: string; filter?: string; startDate?: string; endDate?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    const res = await fetch(`${API_URL}/api/analytics/reports?${query}`, {
      headers: getAnalyticsHeaders(),
    });
    return handleResponse(res);
  },

  async getExportUrl(params?: { category?: string; filter?: string; startDate?: string; endDate?: string }) {
    const stringParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, val]) => {
      if (val !== undefined) stringParams[key] = String(val);
    });
    const query = new URLSearchParams(stringParams).toString();
    return `${API_URL}/api/analytics/export?${query}`;
  }
};
