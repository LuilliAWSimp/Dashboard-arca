import api from './api';

const cache = new Map();
const TTL_MS = 60 * 1000;

export function clearWaterCache() {
  cache.clear();
}

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

export async function fetchWaterSources() {
  const { data } = await api.get('/water/sources');
  return data;
}

export async function validateWaterSource(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/water/sources/validate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function uploadWaterSource(file, activate = true) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/water/sources/upload?activate=${activate}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  clearWaterCache();
  return data;
}

export async function activateWaterSource(sourceId) {
  const { data } = await api.post(`/water/sources/${sourceId}/activate`);
  clearWaterCache();
  return data;
}
