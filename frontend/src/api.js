const BASE = '/api';

function getToken() {
  return localStorage.getItem('transitops_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),

  getVehicles: (status) => request(`/vehicles${status ? `?status=${status}` : ''}`),
  createVehicle: (payload) => request('/vehicles', { method: 'POST', body: payload }),

  getDrivers: (status) => request(`/drivers${status ? `?status=${status}` : ''}`),
  createDriver: (payload) => request('/drivers', { method: 'POST', body: payload }),

  getTrips: (status) => request(`/trips${status ? `?status=${status}` : ''}`),
  dispatchTrip: (payload) => request('/trips/dispatch', { method: 'POST', body: payload }),
  finishTrip: (id, outcome) => request(`/trips/${id}/finish`, { method: 'PATCH', body: { outcome } }),

  getMaintenance: () => request('/maintenance'),
  startMaintenance: (payload) => request('/maintenance/start', { method: 'POST', body: payload }),
  completeMaintenance: (id, cost) => request(`/maintenance/${id}/complete`, { method: 'PATCH', body: { cost } }),

  getExpenses: (tripId) => request(`/expenses${tripId ? `?tripId=${tripId}` : ''}`),
  createExpense: (payload) => request('/expenses', { method: 'POST', body: payload }),

  getDashboard: () => request('/reports/dashboard'),
  getUtilization: () => request('/reports/utilization'),
  getCost: () => request('/reports/cost'),
};

export { getToken };
