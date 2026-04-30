import api from './api';

const cache = new Map();
const TTL_MS = 60 * 1000;

export async function fetchWaterDashboard(section = 'dashboard') {
  const key = section;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.ts < TTL_MS) return cached.data;
  const { data } = await api.get(`/water/dashboard/${section}`);
  cache.set(key, { ts: now, data });
  return data;
}

export async function fetchWaterReportCatalog() {
  const { data } = await api.get('/water/reports/catalog');
  return data;
}
