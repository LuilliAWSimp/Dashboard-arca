import api from './api';

const extensionMap = {
  excel: 'xlsx',
  csv: 'csv',
  html: 'html',
  pdf: 'pdf',
  png: 'png',
  jpg: 'jpg',
};

export const downloadWaterReport = async (section, format) => {
  const response = await api.get(`/water/export/${section}/${format}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const disposition = response.headers['content-disposition'];
  const filenameMatch = disposition?.match(/filename\*?=(?:UTF-8''|\"?)([^\";]+)/i);
  const fallbackExtension = extensionMap[format] || format;
  const fallbackName = `pozos_${section}.${fallbackExtension}`;
  const resolvedName = filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1].replace(/\"/g, '')) : fallbackName;
  link.setAttribute('download', resolvedName.endsWith(`.${fallbackExtension}`) ? resolvedName : `${resolvedName}.${fallbackExtension}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
