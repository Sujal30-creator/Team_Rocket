const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const BASE = `${API_BASE}/api`;

function getToken() {
  return localStorage.getItem('fleetforge_token') || localStorage.getItem('transitops_token');
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
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Auth
  login: (email, password, rememberMe) => request('/auth/login', { method: 'POST', body: { email, password, rememberMe }, auth: false }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PATCH', body: payload }),
  changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'PATCH', body: { currentPassword, newPassword } }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (token, password) => request(`/auth/reset-password/${token}`, { method: 'POST', body: { password }, auth: false }),

  // Vehicles
  getVehicles: (status) => request(`/vehicles${status ? `?status=${status}` : ''}`),
  createVehicle: (payload) => request('/vehicles', { method: 'POST', body: payload }),

  // Drivers
  getDrivers: (status) => request(`/drivers${status ? `?status=${status}` : ''}`),
  createDriver: (payload) => request('/drivers', { method: 'POST', body: payload }),
  updateDriver: (id, payload) => request(`/drivers/${id}`, { method: 'PUT', body: payload }),
  deleteDriver: (id) => request(`/drivers/${id}`, { method: 'DELETE' }),
  searchDrivers: (query) => request('/drivers/search', { method: 'POST', body: { query } }),

  // Trips
  getTrips: (status) => request(`/trips${status ? `?status=${status}` : ''}`),
  getTrip: (id) => request(`/trips/${id}`),
  dispatchTrip: (payload) => request('/trips/dispatch', { method: 'POST', body: payload }),
  finishTrip: (id, outcome) => request(`/trips/${id}/finish`, { method: 'PATCH', body: { outcome } }),
  updateTrip: (id, payload) => request(`/trips/${id}`, { method: 'PUT', body: payload }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' }),

  // Maintenance
  getMaintenance: () => request('/maintenance'),
  startMaintenance: (payload) => request('/maintenance/start', { method: 'POST', body: payload }),
  completeMaintenance: (id) => request(`/maintenance/${id}/complete`, { method: 'PATCH' }),

  // Expenses
  getExpenses: (tripId) => request(`/expenses${tripId ? `?tripId=${tripId}` : ''}`),
  createExpense: (payload) => request('/expenses', { method: 'POST', body: payload }),

  // Reports
  getDashboard: () => request('/reports/dashboard'),
  getUtilization: () => request('/reports/utilization'),
  getCost: () => request('/reports/cost'),

  // Chat
  sendChatMessage: (message) => request('/chat', { method: 'POST', body: { message } })
};

export { getToken };
