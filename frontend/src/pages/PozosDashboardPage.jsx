import { useEffect, useMemo, useState } from 'react';
import { downloadWaterReport } from '../services/waterExportService';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Database, FileUp, ShieldCheck, Zap } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import {
  activateWaterSource,
  fetchWaterDashboard,
  fetchWaterSources,
  uploadWaterSource,
  validateWaterSource,
} from '../services/waterService';

const pieColors = ['#14b8ff', '#0ea5e9', '#38bdf8', '#0284c7', '#7dd3fc', '#22d3ee', '#0369a1'];
const axisColor = '#b9e7ff';
const gridColor = 'rgba(56,189,248,0.14)';

function formatNumber(value) {
  return Number(value || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip solid-tooltip pozos-tooltip">
      {label ? <div className="chart-tooltip-label">{label}</div> : null}
      <div className="chart-tooltip-list">
        {payload.map((entry, index) => (
          <div className="chart-tooltip-row" key={`${entry.dataKey || entry.name}-${index}`}>
            <span className="chart-tooltip-dot" style={{ background: entry.color || entry.fill || '#fff' }} />
            <span className="chart-tooltip-name">{entry.name || entry.dataKey}</span>
            <span className="chart-tooltip-value">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelHeader({ title, subtitle }) {
  return (
    <div className="panel-header compact">
      <div>
        <div className="panel-title">{title}</div>
        {subtitle ? <div className="panel-subtitle">{subtitle}</div> : null}
      </div>
    </div>
  );
}

function EmptyWaterState({ payload }) {
  return (
    <section className="panel water-empty-state fade-up">
      <Database size={34} />
      <div>
        <div className="panel-title">Sin fuente de pozos activa</div>
        <div className="panel-subtitle">
          {payload?.subtitle || 'Carga una fuente JSON desde Pozos · Fuentes para alimentar el dashboard hidráulico.'}
        </div>
      </div>
    </section>
  );
}

function DashboardBaseSection({ payload }) {
  const wells = payload.water_entry_by_well || [];
  const hourlyFlow = payload.hourly_flow || [];
  const filters = payload.filters_vs_treated || [];
  return (
    <>
      <section className="cards-grid stagger-grid pozos-kpi-grid">
        {(payload.cards || []).map((card, index) => (
          <KpiCard key={card.label} {...card} style={{ animationDelay: `${index * 70}ms` }} />
        ))}
      </section>

      <section className="content-grid pozos-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Entrada y consumo por hora" subtitle="Flujo horario cargado desde la fuente activa" />
          {hourlyFlow.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={hourlyFlow}>
                <defs>
                  <linearGradient id="pozosEntrada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8ff" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#14b8ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Area type="monotone" dataKey="entrada" name="Entrada total" stroke="#14b8ff" fill="url(#pozosEntrada)" strokeWidth={3} />
                <Line type="monotone" dataKey="tratada" name="Tratada" stroke="#7dd3fc" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="suave" name="Suave" stroke="#22d3ee" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="cruda" name="Cruda" stroke="#0284c7" strokeWidth={2.2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="empty-panel-note">La fuente activa no incluye flujo horario.</div>}
        </div>

        <div className="panel chart-panel fade-up">
          <PanelHeader title="Participación por pozo" subtitle="Distribución del volumen diario de entrada por pozo" />
          {wells.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={wells} dataKey="value" nameKey="name" innerRadius={70} outerRadius={118} paddingAngle={3}>
                  {wells.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-panel-note">No hay pozos en la fuente activa.</div>}
        </div>
      </section>

      <section className="stack-grid pozos-stack-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Agua de filtros vs agua tratada" subtitle="Comparativo cargado desde la fuente activa" />
          {filters.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filters}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke={axisColor} />
                <YAxis stroke={axisColor} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar dataKey="filtros" name="Agua filtros" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                <Bar dataKey="tratada" name="Agua tratada" fill="#7dd3fc" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-panel-note">Sin datos de filtros vs tratada.</div>}
        </div>

        <div className="panel summary-panel fade-up concesiones-panel">
          <PanelHeader title="Fuente activa" subtitle="Dataset hidráulico usado actualmente" />
          <div className="summary-stack">
            <article className="summary-item">
              <div className="summary-label">Nombre</div>
              <div className="summary-value-row"><div className="summary-value small-value">{payload.source?.name || 'Sin fuente'}</div></div>
              <div className="summary-trend">{payload.source?.description || 'Carga una fuente para reemplazar los mocks.'}</div>
              <div className={`status-pill ${payload.source_status === 'active' ? 'normal' : 'alert'} concesion-status`}>
                {payload.source_status === 'active' ? 'Activa' : 'Sin datos'}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

function ConsumosSection({ payload }) {
  const hourlyFlow = payload.hourly_flow || [];
  const consumption = payload.water_consumption || [];
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Consumo de agua por tipo" subtitle="Seguimiento horario de agua tratada, suave y cruda" />
        {hourlyFlow.length ? (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={hourlyFlow}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Line type="monotone" dataKey="tratada" name="Tratada" stroke="#7dd3fc" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="suave" name="Suave" stroke="#38bdf8" strokeWidth={2.3} dot={false} />
              <Line type="monotone" dataKey="cruda" name="Cruda" stroke="#0284c7" strokeWidth={2.3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="empty-panel-note">La fuente no incluye serie horaria.</div>}
      </div>
      <div className="panel summary-panel fade-up">
        <PanelHeader title="Totales diarios" subtitle="Consumos agregados desde la fuente activa" />
        <div className="summary-stack">
          {consumption.length ? consumption.map((item) => (
            <article className="summary-item" key={item.name}>
              <div className="summary-label">{item.name}</div>
              <div className="summary-value-row"><div className="summary-value">{formatNumber(item.value)}</div><div className="summary-unit">{item.unit}</div></div>
              <div className="summary-trend">{item.detail}</div>
            </article>
          )) : <div className="empty-panel-note">Sin consumos agregados.</div>}
        </div>
      </div>
    </section>
  );
}

function TanquesSection({ payload }) {
  const tanks = payload.tank_levels || [];
  return (
    <>
      <section className="cards-grid stagger-grid pozos-kpi-grid">
        {tanks.map((tank, index) => (
          <KpiCard
            key={tank.name}
            label={tank.name}
            value={formatNumber(tank.volume_m3)}
            unit="m³"
            trend={`${formatNumber(tank.height_m)} m de altura · ${formatNumber(tank.fill_pct)}% de llenado`}
            accent={index % 2 === 0 ? 'red' : 'crimson'}
            style={{ animationDelay: `${index * 70}ms` }}
          />
        ))}
      </section>
      <section className="content-grid pozos-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Niveles de tanques" subtitle="Comparativo entre volumen actual, capacidad y porcentaje de llenado" />
          {tanks.length ? (
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={tanks}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={axisColor} angle={-8} textAnchor="end" height={72} interval={0} />
                <YAxis yAxisId="left" stroke={axisColor} />
                <YAxis yAxisId="right" orientation="right" stroke="#22d3ee" domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="volume_m3" name="Volumen actual (m³)" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                <Bar yAxisId="left" dataKey="capacity_m3" name="Capacidad (m³)" fill="#0369a1" radius={[10, 10, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="fill_pct" name="% llenado" stroke="#38bdf8" strokeWidth={2.6} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : <div className="empty-panel-note">Sin tanques registrados.</div>}
        </div>
        <div className="panel summary-panel fade-up">
          <PanelHeader title="Lecturas de referencia" subtitle="Resumen operativo por tanque" />
          <div className="summary-stack">
            {tanks.length ? tanks.map((tank) => (
              <article className="summary-item" key={tank.name}>
                <div className="summary-label">{tank.name}</div>
                <div className="summary-value-row"><div className="summary-value">{formatNumber(tank.height_m)} m</div><div className="summary-unit">altura</div></div>
                <div className="summary-trend">{formatNumber(tank.volume_m3)} m³ actuales de {formatNumber(tank.capacity_m3)} m³</div>
              </article>
            )) : <div className="empty-panel-note">Sin lecturas de tanques.</div>}
          </div>
        </div>
      </section>
    </>
  );
}

function BalanceSection({ payload }) {
  const monthly = payload.monthly_averages || [];
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Entradas vs salidas" subtitle="Balance comparativo mensual entre entrada total y agua tratada" />
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={monthly}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar dataKey="entrada" name="Entrada" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Line type="monotone" dataKey="tratada" name="Tratada" stroke="#7dd3fc" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cruda" name="Cruda" stroke="#0284c7" strokeWidth={2.3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : <div className="empty-panel-note">Sin promedios mensuales.</div>}
      </div>
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Promedios mensuales" subtitle="Indicadores mensuales por tipo de agua" />
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={monthly}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Line type="monotone" dataKey="entrada" name="Entrada" stroke="#e9082c" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="tratada" name="Tratada" stroke="#7dd3fc" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="cruda" name="Cruda" stroke="#0284c7" strokeWidth={2.3} dot={false} />
              <Line type="monotone" dataKey="suave" name="Suave" stroke="#38bdf8" strokeWidth={2.3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="empty-panel-note">Sin series mensuales.</div>}
      </div>
    </section>
  );
}

function CipSection({ payload }) {
  const cip = payload.cip_weekly || [];
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Consumo hora CIP" subtitle="Gráfica semanal de limpieza CIP" />
        {cip.length ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={cip}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="hours" name="Consumo CIP (h)" fill="#14b8ff" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="empty-panel-note">Sin datos CIP.</div>}
      </div>
    </section>
  );
}

function UvSection() {
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel summary-panel fade-up">
        <PanelHeader title="Lámparas UV" subtitle="Base preparada para disponibilidad, horas acumuladas y alertas por reemplazo." />
        <div className="uv-placeholder-wrap">
          <div className="report-card-icon large"><Zap size={22} /></div>
          <div className="summary-value">Módulo preparado</div>
          <div className="summary-trend">Esta fase mantiene la estructura visual para integrar métricas UV reales después.</div>
          <div className="status-pill alert report-status-pill">Pendiente de integración operativa</div>
        </div>
      </div>
    </section>
  );
}

function ReportesSection({ payload }) {
  const reports = payload.report_modules || [];
  return (
    <section className="cards-grid reports-grid fade-up">
      {reports.map((title) => (
        <article key={title} className="panel report-card-clean">
          <div className="report-card-head">
            <div>
              <div className="panel-title small">{title}</div>
              <div className="panel-subtitle">Reporte disponible para la fuente activa.</div>
            </div>
            <div className="report-card-icon"><ShieldCheck size={18} /></div>
          </div>
          <div className="status-pill normal report-status-pill">Preparado</div>
        </article>
      ))}
      <article className="panel report-card-clean uv-card-placeholder">
        <div className="report-card-head">
          <div>
            <div className="panel-title small">Lámparas UV</div>
            <div className="panel-subtitle">Estructura lista para integrar disponibilidad y alertas.</div>
          </div>
          <div className="report-card-icon"><Zap size={18} /></div>
        </div>
        <div className="status-pill alert report-status-pill">Fase siguiente</div>
      </article>
    </section>
  );
}

function SourcesSection({ onSourceChanged }) {
  const [sources, setSources] = useState([]);
  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadSources = async () => {
    const data = await fetchWaterSources();
    setSources(data);
  };

  useEffect(() => {
    loadSources().catch(() => setMessage('No fue posible cargar las fuentes registradas.'));
  }, []);

  const handleFile = async (event) => {
    const nextFile = event.target.files?.[0];
    setFile(nextFile || null);
    setValidation(null);
    setMessage('');
    if (!nextFile) return;
    try {
      setBusy(true);
      const result = await validateWaterSource(nextFile);
      setValidation(result);
    } catch (error) {
      setValidation(null);
      setMessage(error.response?.data?.detail || 'No fue posible validar la fuente.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setBusy(true);
      await uploadWaterSource(file, true);
      setFile(null);
      setValidation(null);
      setMessage('Fuente cargada y activada correctamente.');
      await loadSources();
      onSourceChanged?.();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'No fue posible cargar la fuente.');
    } finally {
      setBusy(false);
    }
  };

  const handleActivate = async (sourceId) => {
    try {
      setBusy(true);
      await activateWaterSource(sourceId);
      setMessage('Fuente activada correctamente.');
      await loadSources();
      onSourceChanged?.();
    } catch (error) {
      setMessage(error.response?.data?.detail || 'No fue posible activar la fuente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel source-admin-panel fade-up">
        <PanelHeader title="Cargar fuente de datos de pozos" subtitle="v1 acepta JSON controlado. No se ejecuta SQL enviado desde el navegador." />
        <div className="source-upload-box">
          <label className="source-file-label">
            <FileUp size={18} />
            <span>{file ? file.name : 'Seleccionar fuente JSON'}</span>
            <input type="file" accept="application/json,.json" onChange={handleFile} />
          </label>
          <button className="source-action-button" disabled={!file || !validation?.valid || busy} onClick={handleUpload}>
            Subir y activar
          </button>
        </div>
        {validation ? (
          <div className={`source-validation ${validation.valid ? 'ok' : 'bad'}`}>
            <strong>{validation.valid ? 'Fuente válida' : 'Fuente inválida'}</strong>
            <span>{validation.wells_count} pozos · {validation.sensors_count} sensores</span>
            {validation.errors?.map((item) => <small key={item}>Error: {item}</small>)}
            {validation.warnings?.map((item) => <small key={item}>Aviso: {item}</small>)}
          </div>
        ) : null}
        {message ? <div className="source-message">{typeof message === 'string' ? message : JSON.stringify(message)}</div> : null}
      </div>

      <div className="panel source-admin-panel fade-up">
        <PanelHeader title="Fuentes cargadas" subtitle="Solo una fuente de pozos puede estar activa a la vez" />
        <div className="source-list">
          {sources.length ? sources.map((source) => (
            <article className="source-item" key={source.id}>
              <div>
                <div className="source-item-title">{source.name}</div>
                <div className="source-item-meta">{source.wells_count} pozos · {source.sensors_count} sensores · {source.file_name || 'JSON'}</div>
                {source.description ? <div className="source-item-description">{source.description}</div> : null}
              </div>
              <div className="source-item-actions">
                <span className={`status-pill ${source.active ? 'normal' : 'alert'}`}>{source.active ? 'Activa' : source.status}</span>
                {!source.active ? (
                  <button className="source-action-button small" disabled={busy} onClick={() => handleActivate(source.id)}>Activar</button>
                ) : null}
              </div>
            </article>
          )) : <div className="empty-panel-note">Todavía no hay fuentes cargadas.</div>}
        </div>
      </div>
    </section>
  );
}

const sectionMap = {
  dashboard: { title: 'Pozos · Dashboard base', render: (payload) => <DashboardBaseSection payload={payload} /> },
  consumos: { title: 'Pozos · Consumos', render: (payload) => <ConsumosSection payload={payload} /> },
  tanques: { title: 'Pozos · Tanques', render: (payload) => <TanquesSection payload={payload} /> },
  balance: { title: 'Pozos · Entradas vs salidas', render: (payload) => <BalanceSection payload={payload} /> },
  cip: { title: 'Pozos · CIP', render: (payload) => <CipSection payload={payload} /> },
  uv: { title: 'Pozos · Lámparas UV', render: () => <UvSection /> },
  reportes: { title: 'Pozos · Reportes', render: (payload) => <ReportesSection payload={payload} /> },
  fuentes: { title: 'Pozos · Fuentes', render: (_payload, refresh) => <SourcesSection onSourceChanged={refresh} /> },
};

export default function PozosDashboardPage({ section = 'dashboard', setHeaderMeta }) {
  const current = sectionMap[section] || sectionMap.dashboard;
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchWaterDashboard(section)
      .then((data) => {
        if (active) setPayload(data);
      })
      .catch(() => {
        if (active) setError('No fue posible cargar datos de pozos desde el backend.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [section, reloadKey]);

  useEffect(() => {
    setHeaderMeta({
      title: current.title,
      subtitle: payload?.source?.name ? `Fuente activa: ${payload.source.name}` : '',
      onExport: async (format) => {
        try {
          await downloadWaterReport(section, format);
        } catch (err) {
          console.error('No fue posible exportar el reporte de Pozos', err);
          window.alert('No fue posible exportar el reporte de Pozos. Intenta nuevamente.');
        }
      },
      onEmail: null,
    });
  }, [current, payload, section, setHeaderMeta]);

  const refresh = () => setReloadKey((value) => value + 1);
  const content = useMemo(() => {
    if (loading) return <section className="panel water-empty-state fade-up">Cargando datos de pozos...</section>;
    if (error) return <section className="panel water-empty-state fade-up">{error}</section>;
    if (section !== 'fuentes' && payload?.source_status !== 'active') return <EmptyWaterState payload={payload} />;
    return current.render(payload || {}, refresh);
  }, [current, error, loading, payload, section]);

  return <div className="page-grid pozos-page">{content}</div>;
}
