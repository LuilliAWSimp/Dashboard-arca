import { useEffect, useMemo } from 'react';
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
import { Droplets, FileBarChart2, FlaskConical, ShieldCheck, Waves, Zap } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import {
  cipHourly,
  concesiones,
  filtrosVsTratada,
  monthlyAverages,
  pozosBreakdown,
  pozosHourlyFlow,
  pozosKpis,
  reportCards,
  tanques,
} from '../data/pozosMock';

const pieColors = ['#14b8ff', '#0ea5e9', '#38bdf8'];
const axisColor = '#b9e7ff';
const gridColor = 'rgba(56,189,248,0.14)';

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
            <span className="chart-tooltip-value">{Number(entry.value || 0).toLocaleString('es-MX')}</span>
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

function DashboardBaseSection() {
  return (
    <>
      <section className="cards-grid stagger-grid pozos-kpi-grid">
        {pozosKpis.map((card, index) => (
          <KpiCard key={card.label} {...card} style={{ animationDelay: `${index * 70}ms` }} />
        ))}
      </section>

      <section className="content-grid pozos-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Entrada y consumo por hora" subtitle="Agua de entrada, tratada, suave y cruda durante el día actual" />
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={pozosHourlyFlow}>
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
        </div>

        <div className="panel chart-panel fade-up">
          <PanelHeader title="Participación por pozo" subtitle="Distribución del volumen diario de entrada por pozo" />
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={pozosBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={118} paddingAngle={3}>
                {pozosBreakdown.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="stack-grid pozos-stack-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Agua de filtros vs agua tratada" subtitle="Seguimiento semanal entre salida de filtros y volumen tratado" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filtrosVsTratada}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar dataKey="filtros" name="Agua filtros" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Bar dataKey="tratada" name="Agua tratada" fill="#7dd3fc" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up concesiones-panel">
          <PanelHeader title="Concesiones activas" subtitle="Volumen autorizado y vigencia contractual por concesión" />
          <div className="summary-stack">
            {concesiones.map((item) => (
              <article className="summary-item" key={item.name}>
                <div className="summary-label">{item.name}</div>
                <div className="summary-value-row">
                  <div className="summary-value">{item.volumen}</div>
                </div>
                <div className="summary-trend">{item.vigencia}</div>
                <div className="status-pill normal concesion-status">{item.status}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ConsumosSection() {
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Consumo de agua por tipo" subtitle="Seguimiento horario de agua tratada, suave y cruda" />
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={pozosHourlyFlow}>
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
      </div>
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Filtros vs tratada" subtitle="Comparativo semanal para detectar variaciones de rendimiento" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={filtrosVsTratada}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend />
            <Bar dataKey="filtros" name="Agua filtros" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
            <Bar dataKey="tratada" name="Agua tratada" fill="#7dd3fc" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function TanquesSection() {
  return (
    <>
      <section className="cards-grid stagger-grid pozos-kpi-grid">
        {tanques.map((tank, index) => (
          <KpiCard
            key={tank.name}
            label={tank.name}
            value={tank.m3.toLocaleString('es-MX')}
            unit="m³"
            trend={`${tank.metros} m de altura · ${tank.llenado}% de llenado`}
            accent={index % 2 === 0 ? 'red' : 'crimson'}
            style={{ animationDelay: `${index * 70}ms` }}
          />
        ))}
      </section>
      <section className="content-grid pozos-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Niveles de tanques" subtitle="Comparativo entre volumen actual, capacidad y porcentaje de llenado" />
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={tanques}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={axisColor} angle={-8} textAnchor="end" height={72} interval={0} />
              <YAxis yAxisId="left" stroke={axisColor} />
              <YAxis yAxisId="right" orientation="right" stroke="#22d3ee" domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="m3" name="Volumen actual (m³)" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Bar yAxisId="left" dataKey="capacidad" name="Capacidad (m³)" fill="#0369a1" radius={[10, 10, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="llenado" name="% llenado" stroke="#38bdf8" strokeWidth={2.6} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="panel summary-panel fade-up">
          <PanelHeader title="Lecturas de referencia" subtitle="Resumen operativo por tanque con altura y capacidad" />
          <div className="summary-stack">
            {tanques.map((tank) => (
              <article className="summary-item" key={tank.name}>
                <div className="summary-label">{tank.name}</div>
                <div className="summary-value-row">
                  <div className="summary-value">{tank.metros} m</div>
                  <div className="summary-unit">altura</div>
                </div>
                <div className="summary-trend">{tank.m3} m³ actuales de {tank.capacidad} m³</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function BalanceSection() {
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Entradas vs salidas" subtitle="Balance comparativo mensual entre entrada total y agua tratada" />
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={monthlyAverages}>
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
      </div>
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Promedios mensuales" subtitle="Base comparativa para indicadores diarios, tratada, cruda y suave" />
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={monthlyAverages}>
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
      </div>
    </section>
  );
}

function CipSection() {
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Consumo hora CIP" subtitle="Gráfica semanal base para seguimiento de limpieza CIP" />
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={cipHourly}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="consumo" name="Consumo CIP (m³/h)" fill="#14b8ff" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
          <div className="summary-trend">Esta primera fase conserva la estructura visual y de navegación para integrar métricas UV reales en la siguiente iteración.</div>
          <div className="status-pill alert report-status-pill">Pendiente de integración operativa</div>
        </div>
      </div>
    </section>
  );
}

function ReportesSection() {
  return (
    <section className="cards-grid reports-grid fade-up">
      {reportCards.map((card) => (
        <article key={card.title} className="panel report-card-clean">
          <div className="report-card-head">
            <div>
              <div className="panel-title small">{card.title}</div>
              <div className="panel-subtitle">{card.description}</div>
            </div>
            <div className="report-card-icon"><ShieldCheck size={18} /></div>
          </div>
          <div className="status-pill normal report-status-pill">{card.status}</div>
        </article>
      ))}
      <article className="panel report-card-clean uv-card-placeholder">
        <div className="report-card-head">
          <div>
            <div className="panel-title small">Lámparas UV</div>
            <div className="panel-subtitle">Estructura lista para agregar disponibilidad, horas acumuladas y alertas por reemplazo.</div>
          </div>
          <div className="report-card-icon"><Zap size={18} /></div>
        </div>
        <div className="status-pill alert report-status-pill">Preparado para fase siguiente</div>
      </article>
    </section>
  );
}

const sectionMap = {
  dashboard: {
    title: 'Pozos · Dashboard base',
    render: () => <DashboardBaseSection />,
  },
  consumos: {
    title: 'Pozos · Consumos',
    render: () => <ConsumosSection />,
  },
  tanques: {
    title: 'Pozos · Tanques',
    render: () => <TanquesSection />,
  },
  balance: {
    title: 'Pozos · Entradas vs salidas',
    render: () => <BalanceSection />,
  },
  cip: {
    title: 'Pozos · CIP',
    render: () => <CipSection />,
  },
  uv: {
    title: 'Pozos · Lámparas UV',
    render: () => <UvSection />,
  },
  reportes: {
    title: 'Pozos · Reportes',
    render: () => <ReportesSection />,
  },
};

export default function PozosDashboardPage({ section = 'dashboard', setHeaderMeta }) {
  const current = sectionMap[section] || sectionMap.dashboard;

  useEffect(() => {
    setHeaderMeta({
      title: current.title,
      subtitle: '',
      onExport: async (format) => {
        try {
          await downloadWaterReport(section, format);
        } catch (error) {
          console.error('No fue posible exportar el reporte de Pozos', error);
          window.alert('No fue posible exportar el reporte de Pozos. Intenta nuevamente.');
        }
      },
      onEmail: null,
    });
  }, [current, section, setHeaderMeta]);

  const content = useMemo(() => current.render(), [current]);

  return <div className="page-grid pozos-page">{content}</div>;
}
