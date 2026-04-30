export const pozosKpis = [
  {
    label: 'Entrada total de agua',
    value: '1,248',
    unit: 'm³/día',
    trend: 'Promedio de ingreso consolidado por pozo en las últimas 24 h',
    accent: 'red',
  },
  {
    label: 'Agua tratada disponible',
    value: '812',
    unit: 'm³/día',
    trend: 'Producción neta posterior a filtración y tratamiento',
    accent: 'crimson',
  },
  {
    label: 'Concesiones activas',
    value: '3',
    unit: 'vigentes',
    trend: '1.25 Mm³/año autorizados · vigencia 2025–2027',
    accent: 'wine',
  },
  {
    label: 'Balance entradas / salidas',
    value: '+6.4',
    unit: '%',
    trend: 'Margen positivo del día entre agua de entrada y suministro total',
    accent: 'brown',
  },
];

export const pozosHourlyFlow = [
  { hour: '00:00', entrada: 42, tratada: 28, suave: 9, cruda: 5 },
  { hour: '04:00', entrada: 45, tratada: 29, suave: 10, cruda: 6 },
  { hour: '08:00', entrada: 56, tratada: 36, suave: 12, cruda: 8 },
  { hour: '12:00', entrada: 61, tratada: 39, suave: 14, cruda: 8 },
  { hour: '16:00', entrada: 58, tratada: 37, suave: 13, cruda: 8 },
  { hour: '20:00', entrada: 50, tratada: 31, suave: 11, cruda: 8 },
];

export const pozosBreakdown = [
  { name: 'Pozo 1', value: 418 },
  { name: 'Pozo 2', value: 392 },
  { name: 'Pozo 3', value: 438 },
];

export const tanques = [
  { name: 'Tanque tratada norte', metros: 7.4, m3: 318, capacidad: 420, llenado: 75.7 },
  { name: 'Tanque suave proceso', metros: 5.9, m3: 214, capacidad: 300, llenado: 71.3 },
  { name: 'Tanque cruda reserva', metros: 6.8, m3: 289, capacidad: 390, llenado: 74.1 },
];

export const filtrosVsTratada = [
  { day: 'Lun', filtros: 182, tratada: 174 },
  { day: 'Mar', filtros: 191, tratada: 186 },
  { day: 'Mié', filtros: 187, tratada: 181 },
  { day: 'Jue', filtros: 194, tratada: 188 },
  { day: 'Vie', filtros: 199, tratada: 192 },
  { day: 'Sáb', filtros: 183, tratada: 176 },
  { day: 'Dom', filtros: 176, tratada: 171 },
];

export const cipHourly = [
  { day: 'Lun', consumo: 12.4 },
  { day: 'Mar', consumo: 13.2 },
  { day: 'Mié', consumo: 11.8 },
  { day: 'Jue', consumo: 14.1 },
  { day: 'Vie', consumo: 13.5 },
  { day: 'Sáb', consumo: 10.7 },
  { day: 'Dom', consumo: 9.9 },
];

export const monthlyAverages = [
  { month: 'Ene', entrada: 1180, tratada: 760, cruda: 245, suave: 175 },
  { month: 'Feb', entrada: 1210, tratada: 778, cruda: 252, suave: 180 },
  { month: 'Mar', entrada: 1248, tratada: 812, cruda: 257, suave: 179 },
  { month: 'Abr', entrada: 1233, tratada: 801, cruda: 251, suave: 181 },
  { month: 'May', entrada: 1261, tratada: 823, cruda: 259, suave: 179 },
  { month: 'Jun', entrada: 1276, tratada: 838, cruda: 261, suave: 177 },
];

export const reportCards = [
  {
    title: 'Resumen diario de agua',
    description: 'Base preparada para exportar entradas, salidas, tanques y balance del día.',
    status: 'Listo para exportación posterior',
  },
  {
    title: 'Promedios mensuales',
    description: 'Estructura preparada para consolidar comparativos mensuales por tipo de agua.',
    status: 'Demo configurado',
  },
  {
    title: 'Lámparas UV',
    description: 'Sección reservada para disponibilidad, horas de uso y recambio de lámparas UV.',
    status: 'Pendiente de siguiente fase',
  },
];

export const concesiones = [
  { name: 'Concesión pozo norte', volumen: '420,000 m³/año', vigencia: 'ene 2025 - dic 2027', status: 'Activa' },
  { name: 'Concesión pozo sur', volumen: '380,000 m³/año', vigencia: 'mar 2025 - feb 2027', status: 'Activa' },
  { name: 'Concesión pozo respaldo', volumen: '450,000 m³/año', vigencia: 'jul 2025 - jun 2027', status: 'Activa' },
];
