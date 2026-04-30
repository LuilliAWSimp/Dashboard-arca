import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Activity, AlertTriangle, ArrowLeft, ClipboardCheck, Droplets, Gauge, ShieldCheck, Waves, Wrench, Zap } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import {
  cipHourly,
  concesiones,
  filtrosVsTratada,
  inspectionPriorities,
  monthlyAverages,
  pozosBreakdown,
  pozosHourlyFlow,
  pozosKpis,
  productionEnergyToday,
  reportCards,
  resumenKpis,
  tanques,
  tankLevelTrend,
  tankAlerts,
  tankSummary,
  waterBalanceMini,
  waterBalanceKpis,
  waterBalanceByType,
  waterBalanceTrend,
  waterBalanceDailySummary,
  concessionSummary,
  concessionProjection,
  concessionHistory,
  concessionAlerts,
  dailyReviewSummary,
  dailyReviewPriorities,
  dailyReviewRanking,
  dailyReviewDiagnostics,
  dailyReviewExportChecklist,
  wellsStatusSummary,
  wellsOperationalStatus,
  wellDetailProfiles,
  wellDetailTimeline,
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

function StatusBadge({ type, children }) {
  return <span className={`status-pill ${type || 'normal'} resumen-status-pill`}>{children}</span>;
}

function DashboardBaseSection() {
  return (
    <>
      <section className="resumen-hero-panel panel fade-up">
        <div>
          <div className="eyebrow">Operación de pozos · Hoy</div>
          <h2>Resumen operativo de agua</h2>
          <p>
            Vista ejecutiva para revisar producción, consumo energético, eficiencia, concesión y prioridades de inspección antes de entrar al detalle por pozo.
          </p>
        </div>
        <div className="resumen-hero-status">
          <div className="resumen-hero-icon"><Droplets size={24} /></div>
          <div>
            <span>Estado general</span>
            <strong>Operación estable con 2 revisiones</strong>
          </div>
        </div>
      </section>

      <section className="cards-grid stagger-grid resumen-kpi-grid">
        {resumenKpis.map((card, index) => (
          <KpiCard key={card.label} {...card} style={{ animationDelay: `${index * 60}ms` }} />
        ))}
      </section>

      <section className="content-grid resumen-top-grid">
        <div className="panel chart-panel fade-up resumen-primary-chart">
          <PanelHeader
            title="Producción de agua vs consumo energético"
            subtitle="Comparativo horario del día actual para detectar desviaciones de eficiencia"
          />
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={productionEnergyToday}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke={axisColor} />
              <YAxis yAxisId="left" stroke={axisColor} />
              <YAxis yAxisId="right" orientation="right" stroke="#7dd3fc" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="agua" name="Agua bombeada (m³)" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="energia" name="Consumo (kWh)" stroke="#7dd3fc" strokeWidth={2.8} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up resumen-alert-panel">
          <PanelHeader title="Alertas y prioridades" subtitle="Elementos que requieren revisión operativa" />
          <div className="priority-list">
            {inspectionPriorities.map((item) => (
              <article className="priority-item" key={`${item.title}-${item.type}`}>
                <div className="priority-icon"><AlertTriangle size={16} /></div>
                <div className="priority-copy">
                  <div className="priority-head">
                    <strong>{item.title}</strong>
                    <span>{item.priority}</span>
                  </div>
                  <div className="priority-type">{item.type}</div>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel table-wrapper fade-up resumen-wells-panel">
        <PanelHeader
          title="Estado general de pozos"
          subtitle="Lectura resumida de flujo, amperaje, eficiencia y diagnóstico sugerido"
        />
        <div className="resumen-table-scroll">
          <table className="resumen-wells-table">
            <thead>
              <tr>
                <th>Pozo</th>
                <th>Estado</th>
                <th>Flujo actual</th>
                <th>Amperaje</th>
                <th>kWh/m³</th>
                <th>Diagnóstico sugerido</th>
                <th>Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {wellsStatusSummary.map((well) => (
                <tr key={well.name}>
                  <td>
                    <div className="well-name-cell">
                      <span className="well-dot" />
                      {well.name}
                    </div>
                  </td>
                  <td><StatusBadge type={well.statusType}>{well.status}</StatusBadge></td>
                  <td>{well.flow.toLocaleString('es-MX')} m³/h</td>
                  <td>{well.amps.toLocaleString('es-MX')} A</td>
                  <td>{well.efficiency ? well.efficiency.toFixed(2) : '—'}</td>
                  <td>{well.diagnosis}</td>
                  <td>{well.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="content-grid resumen-bottom-grid">
        <div className="panel summary-panel fade-up resumen-tanks-panel">
          <PanelHeader title="Resumen de tanques" subtitle="Nivel actual y capacidad operativa" />
          <div className="tank-summary-grid">
            {tankSummary.map((tank) => (
              <article className="tank-summary-card" key={tank.name}>
                <div className="tank-summary-head">
                  <strong>{tank.name}</strong>
                  <StatusBadge type={tank.status === 'Bajo' ? 'warning' : 'normal'}>{tank.status}</StatusBadge>
                </div>
                <div className="tank-level-track">
                  <span style={{ width: `${tank.level}%` }} />
                </div>
                <div className="tank-summary-foot">
                  <span>{tank.level}%</span>
                  <span>{tank.volume} / {tank.capacity} m³</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel summary-panel fade-up resumen-balance-panel">
          <PanelHeader title="Mini balance de agua" subtitle="Corte consolidado por tipo de agua" />
          <div className="balance-mini-grid">
            {waterBalanceMini.map((item, index) => (
              <article className="balance-mini-card" key={item.label}>
                <div className="balance-mini-icon">{index === 0 ? <Waves size={18} /> : index === 1 ? <Gauge size={18} /> : <Droplets size={18} />}</div>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.value.toLocaleString('es-MX')} <small>{item.unit}</small></strong>
                  <p>{item.trend}</p>
                </div>
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
  const tanksAtRisk = tanques.filter((tank) => ['warning', 'critical'].includes(tank.statusType)).length;
  const averageLevel = Math.round(tanques.reduce((sum, tank) => sum + tank.llenado, 0) / Math.max(tanques.length, 1));
  const totalVolume = tanques.reduce((sum, tank) => sum + tank.m3, 0);
  const totalCapacity = tanques.reduce((sum, tank) => sum + tank.capacidad, 0);

  return (
    <>
      <section className="tanques-hero panel fade-up">
        <div>
          <div className="eyebrow">Almacenamiento de agua · Estado actual</div>
          <h2>Tanques de operación</h2>
          <p>
            Seguimiento operativo de niveles, capacidad disponible y riesgos por tanque para anticipar bajas de suministro o comportamientos anormales.
          </p>
        </div>
        <div className="tanques-hero-metrics">
          <article>
            <span>Nivel promedio</span>
            <strong>{averageLevel}%</strong>
          </article>
          <article>
            <span>Volumen total</span>
            <strong>{totalVolume.toLocaleString('es-MX')} <small>m³</small></strong>
          </article>
          <article>
            <span>Capacidad</span>
            <strong>{totalCapacity.toLocaleString('es-MX')} <small>m³</small></strong>
          </article>
          <article>
            <span>Alertas</span>
            <strong>{tanksAtRisk}</strong>
          </article>
        </div>
      </section>

      <section className="tanques-card-grid fade-up">
        {tanques.map((tank) => (
          <article className={`panel tanque-card ${tank.statusType || 'normal'}`} key={tank.name}>
            <div className="tanque-card-head">
              <div>
                <span>{tank.type}</span>
                <strong>{tank.name}</strong>
              </div>
              <StatusBadge type={tank.statusType}>{tank.estado}</StatusBadge>
            </div>

            <div className="tanque-level-visual">
              <div className="tanque-level-track-large">
                <span style={{ height: `${tank.llenado}%` }} />
              </div>
              <div className="tanque-level-copy">
                <strong>{tank.llenado}%</strong>
                <span>{tank.m3.toLocaleString('es-MX')} de {tank.capacidad.toLocaleString('es-MX')} m³</span>
                <small>{tank.metros} m de altura</small>
              </div>
            </div>

            <div className="tanque-card-footer">
              <div>
                <span>Tendencia</span>
                <strong>{tank.tendencia}</strong>
              </div>
              <div>
                <span>Riesgo</span>
                <strong>{tank.riesgo}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="content-grid tanques-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Comparativo entre tanques" subtitle="Volumen actual contra capacidad y porcentaje de llenado" />
          <ResponsiveContainer width="100%" height={330}>
            <ComposedChart data={tanques}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="shortName" stroke={axisColor} interval={0} />
              <YAxis yAxisId="left" stroke={axisColor} />
              <YAxis yAxisId="right" orientation="right" stroke="#22d3ee" domain={[0, 100]} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="m3" name="Volumen actual (m³)" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Bar yAxisId="left" dataKey="capacidad" name="Capacidad (m³)" fill="#064e7a" radius={[10, 10, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="llenado" name="Nivel (%)" stroke="#7dd3fc" strokeWidth={2.8} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up tanques-alert-panel">
          <PanelHeader title="Alertas de tanques" subtitle="Prioridades visuales para revisión operativa" />
          <div className="priority-list compact-priority-list">
            {tankAlerts.map((alert) => (
              <article className="priority-item" key={`${alert.tank}-${alert.type}`}>
                <div className={`priority-icon ${alert.statusType || 'normal'}`}><AlertTriangle size={16} /></div>
                <div className="priority-copy">
                  <div className="priority-head">
                    <strong>{alert.tank}</strong>
                    <span>{alert.priority}</span>
                  </div>
                  <div className="priority-type">{alert.type}</div>
                  <p>{alert.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel chart-panel fade-up">
        <PanelHeader title="Tendencia de nivel" subtitle="Últimas horas por tanque para detectar caídas o recuperación" />
        <ResponsiveContainer width="100%" height={330}>
          <LineChart data={tankLevelTrend}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="hour" stroke={axisColor} />
            <YAxis stroke={axisColor} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend />
            <Line type="monotone" dataKey="tratadaNorte" name="Tratada norte" stroke="#7dd3fc" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="suaveProceso" name="Suave proceso" stroke="#22d3ee" strokeWidth={2.4} dot={false} />
            <Line type="monotone" dataKey="crudaReserva" name="Cruda reserva" stroke="#0ea5e9" strokeWidth={2.4} dot={false} />
            <Line type="monotone" dataKey="recuperada" name="Recuperada" stroke="#38bdf8" strokeWidth={2.4} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </>
  );
}

function BalanceSection() {
  const produced = waterBalanceDailySummary.produced;
  const output = waterBalanceDailySummary.output;
  const difference = produced - output;
  const differencePct = produced ? (difference / produced) * 100 : 0;

  return (
    <>
      <section className="water-balance-hero panel fade-up">
        <div>
          <div className="eyebrow">Balance de agua · Corte operativo del día</div>
          <h2>Entradas, salidas y diferencia neta</h2>
          <p>
            Vista rápida para entender si el agua producida, enviada y clasificada por tipo mantiene un balance operativo sano durante el turno.
          </p>
        </div>
        <div className="water-balance-hero-grid">
          <article>
            <span>Agua producida</span>
            <strong>{produced.toLocaleString('es-MX')} <small>m³</small></strong>
          </article>
          <article>
            <span>Agua enviada</span>
            <strong>{output.toLocaleString('es-MX')} <small>m³</small></strong>
          </article>
          <article className={difference >= 0 ? 'positive' : 'warning'}>
            <span>Diferencia</span>
            <strong>{difference >= 0 ? '+' : ''}{difference.toLocaleString('es-MX')} <small>m³</small></strong>
          </article>
          <article>
            <span>Variación</span>
            <strong>{differencePct >= 0 ? '+' : ''}{differencePct.toFixed(1)}<small>%</small></strong>
          </article>
        </div>
      </section>

      <section className="cards-grid water-balance-kpi-grid">
        {waterBalanceKpis.map((card, index) => (
          <KpiCard key={card.label} {...card} style={{ animationDelay: `${index * 60}ms` }} />
        ))}
      </section>

      <section className="content-grid water-balance-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Producción vs salidas" subtitle="Comportamiento horario del día actual" />
          <ResponsiveContainer width="100%" height={330}>
            <ComposedChart data={waterBalanceTrend}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar dataKey="producida" name="Agua producida (m³)" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Line type="monotone" dataKey="salida" name="Agua enviada (m³)" stroke="#7dd3fc" strokeWidth={2.7} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diferencia" name="Diferencia neta (m³)" stroke="#38bdf8" strokeWidth={2.4} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up water-balance-summary-panel">
          <PanelHeader title="Resumen del día" subtitle="Lectura ejecutiva de entradas y salidas" />
          <div className="water-balance-summary-stack">
            <article>
              <span>Estado del balance</span>
              <strong>{waterBalanceDailySummary.status}</strong>
              <p>{waterBalanceDailySummary.note}</p>
            </article>
            <article>
              <span>Mayor variación horaria</span>
              <strong>{waterBalanceDailySummary.peakVariation}</strong>
              <p>{waterBalanceDailySummary.peakNote}</p>
            </article>
            <article>
              <span>Lectura operativa</span>
              <strong>{waterBalanceDailySummary.recommendation}</strong>
              <p>{waterBalanceDailySummary.recommendationNote}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="panel fade-up water-type-panel">
        <PanelHeader title="Balance por tipo de agua" subtitle="Separación por agua cruda, recuperada y suave" />
        <div className="water-type-grid">
          {waterBalanceByType.map((item) => {
            const gap = item.producida - item.salida;
            return (
              <article className={`water-type-card ${item.statusType || 'normal'}`} key={item.type}>
                <div className="water-type-head">
                  <div>
                    <span>{item.tag}</span>
                    <strong>{item.type}</strong>
                  </div>
                  <StatusBadge type={item.statusType}>{item.status}</StatusBadge>
                </div>
                <div className="water-type-bars">
                  <div>
                    <span>Producida</span>
                    <div className="water-type-track"><em style={{ width: `${item.producedPct}%` }} /></div>
                    <strong>{item.producida.toLocaleString('es-MX')} m³</strong>
                  </div>
                  <div>
                    <span>Salida</span>
                    <div className="water-type-track secondary"><em style={{ width: `${item.outputPct}%` }} /></div>
                    <strong>{item.salida.toLocaleString('es-MX')} m³</strong>
                  </div>
                </div>
                <div className="water-type-foot">
                  <span>Diferencia neta</span>
                  <strong>{gap >= 0 ? '+' : ''}{gap.toLocaleString('es-MX')} m³</strong>
                  <p>{item.note}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel chart-panel fade-up">
        <PanelHeader title="Tendencia por tipo de agua" subtitle="Producción horaria de cruda, recuperada y suave" />
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={waterBalanceTrend}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="hour" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend />
            <Area type="monotone" dataKey="cruda" name="Agua cruda" stroke="#0ea5e9" fill="rgba(14,165,233,.28)" strokeWidth={2.2} />
            <Area type="monotone" dataKey="recuperada" name="Agua recuperada" stroke="#38bdf8" fill="rgba(56,189,248,.20)" strokeWidth={2.2} />
            <Area type="monotone" dataKey="suave" name="Agua suave" stroke="#7dd3fc" fill="rgba(125,211,252,.18)" strokeWidth={2.2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </>
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

function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function filterWellsByStatus(wells, filter) {
  if (filter === 'activos') return wells.filter((well) => well.statusType === 'normal');
  if (filter === 'inactivos') return wells.filter((well) => well.statusType === 'idle');
  if (filter === 'alertas') return wells.filter((well) => ['warning', 'critical'].includes(well.statusType));
  if (filter === 'sin-datos') return wells.filter((well) => well.statusType === 'nodata');
  return wells;
}

function PozosSection() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('todos');
  const filterOptions = [
    { key: 'todos', label: 'Todos' },
    { key: 'activos', label: 'Activos' },
    { key: 'inactivos', label: 'Inactivos' },
    { key: 'alertas', label: 'Con alertas' },
    { key: 'sin-datos', label: 'Sin datos' },
  ];

  const filteredWells = useMemo(
    () => filterWellsByStatus(wellsOperationalStatus, activeFilter),
    [activeFilter]
  );

  const summary = useMemo(() => {
    const active = wellsOperationalStatus.filter((well) => well.statusType === 'normal').length;
    const alerts = wellsOperationalStatus.filter((well) => ['warning', 'critical'].includes(well.statusType)).length;
    const idle = wellsOperationalStatus.filter((well) => well.statusType === 'idle').length;
    const noData = wellsOperationalStatus.filter((well) => well.statusType === 'nodata').length;
    return { active, alerts, idle, noData, total: wellsOperationalStatus.length };
  }, []);

  return (
    <>
      <section className="pozos-operacion-hero panel fade-up">
        <div>
          <div className="eyebrow">Monitoreo operativo · Pozos 1-10</div>
          <h2>Estado operativo de pozos</h2>
          <p>
            Vista técnica para identificar qué pozos están bombeando, cuáles requieren revisión y cuáles no reportan datos recientes.
          </p>
        </div>
        <div className="pozos-operacion-summary">
          <article>
            <span>Activos</span>
            <strong>{summary.active}/{summary.total}</strong>
          </article>
          <article>
            <span>Con alertas</span>
            <strong>{summary.alerts}</strong>
          </article>
          <article>
            <span>Inactivos</span>
            <strong>{summary.idle}</strong>
          </article>
          <article>
            <span>Sin datos</span>
            <strong>{summary.noData}</strong>
          </article>
        </div>
      </section>

      <section className="pozos-filter-panel panel fade-up">
        <div className="pozos-filter-head">
          <div>
            <div className="panel-title">Filtros de operación</div>
            <div className="panel-subtitle">Filtra por estado sin asumir que todos los pozos tienen datos disponibles.</div>
          </div>
          <div className="pozos-filter-count">{filteredWells.length} de {wellsOperationalStatus.length} pozos</div>
        </div>
        <div className="pozos-filter-row" role="tablist" aria-label="Filtros de pozos">
          {filterOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              className={`pozos-filter-chip ${activeFilter === option.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="pozos-cards-grid fade-up">
        {wellsOperationalStatus.map((well) => (
          <article
            key={well.id}
            className={`pozo-mini-card ${well.statusType}`}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/pozos/pozos/${well.id}`)}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate(`/pozos/pozos/${well.id}`); }}
            title="Abrir detalle técnico del pozo"
          >
            <div className="pozo-mini-head">
              <strong>{well.name}</strong>
              <StatusBadge type={well.statusType}>{well.status}</StatusBadge>
            </div>
            <div className="pozo-mini-main">
              <span>Flujo actual</span>
              <strong>{formatNumber(well.flow)} <small>m3/h</small></strong>
            </div>
            <div className="pozo-mini-meta">
              <span>{formatNumber(well.amps, 0)} A</span>
              <span>{well.efficiency ? well.efficiency.toFixed(2) : '—'} kWh/m3</span>
            </div>
          </article>
        ))}
      </section>

      <section className="panel table-wrapper fade-up pozos-operacion-table-panel">
        <PanelHeader
          title="Vista comparativa de pozos"
          subtitle="Lecturas mock preparadas para reemplazarse por datos reales del backend más adelante"
        />
        <div className="pozos-table-scroll">
          <table className="pozos-operacion-table">
            <thead>
              <tr>
                <th>Pozo</th>
                <th>Estado</th>
                <th>Flujo actual</th>
                <th>Consumo diario</th>
                <th>Amperaje</th>
                <th>kWh/m3</th>
                <th>Factor carga</th>
                <th>Relación A / m3/h</th>
                <th>Diagnóstico</th>
                <th>Última lectura</th>
              </tr>
            </thead>
            <tbody>
              {filteredWells.map((well) => (
                <tr
                  key={well.id}
                  className={`pozo-row ${well.statusType}`}
                  onClick={() => navigate(`/pozos/pozos/${well.id}`)}
                  title="Abrir detalle técnico del pozo"
                >
                  <td>
                    <div className="well-name-cell">
                      <span className={`well-dot ${well.statusType}`} />
                      <span>{well.name}</span>
                    </div>
                  </td>
                  <td><StatusBadge type={well.statusType}>{well.status}</StatusBadge></td>
                  <td>{formatNumber(well.flow)} m3/h</td>
                  <td>{well.dailyKwh === null || well.dailyKwh === undefined ? '—' : `${well.dailyKwh.toLocaleString('es-MX')} kWh`}</td>
                  <td>{formatNumber(well.amps, 0)} A</td>
                  <td>{well.efficiency ? well.efficiency.toFixed(2) : '—'}</td>
                  <td>{well.loadFactor === null || well.loadFactor === undefined ? '—' : `${well.loadFactor}%`}</td>
                  <td>{well.ampFlowRatio ? well.ampFlowRatio.toFixed(2) : '—'}</td>
                  <td>{well.diagnosis}</td>
                  <td>{well.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pozos-table-note">
          Haz click en una tarjeta o fila para abrir el detalle técnico mock del pozo.
        </div>
      </section>
    </>
  );
}


function getWellDetail(wellId) {
  const well = wellsOperationalStatus.find((item) => item.id === wellId) || wellsOperationalStatus[0];
  const profile = wellDetailProfiles[well.id] || {};
  const timeline = wellDetailTimeline[well.id] || [];
  return { well, profile, timeline };
}

function WellDetailSection({ wellId }) {
  const navigate = useNavigate();
  const { well, profile, timeline } = getWellDetail(wellId);
  const efficiencyGap = well.efficiency && profile.averageEfficiency
    ? Number((well.efficiency - profile.averageEfficiency).toFixed(2))
    : null;
  const historicalRows = timeline.slice(-5).reverse();

  return (
    <>
      <section className={`well-detail-hero panel fade-up ${well.statusType}`}>
        <div className="well-detail-main-head">
          <button type="button" className="back-inline-button" onClick={() => navigate('/pozos/pozos')}>
            <ArrowLeft size={16} /> Volver a Pozos
          </button>
          <div className="eyebrow">Detalle técnico · Monitoreo de pozo</div>
          <div className="well-detail-title-row">
            <h2>{well.name}</h2>
            <StatusBadge type={well.statusType}>{well.status}</StatusBadge>
          </div>
          <p>{well.diagnosis}</p>
        </div>
        <div className="well-detail-hero-metrics">
          <article>
            <span>Última actualización</span>
            <strong>{well.updated}</strong>
          </article>
          <article>
            <span>Flujo actual</span>
            <strong>{formatNumber(well.flow)} <small>m³/h</small></strong>
          </article>
          <article>
            <span>Amperaje actual</span>
            <strong>{formatNumber(well.amps, 0)} <small>A</small></strong>
          </article>
          <article>
            <span>Consumo diario</span>
            <strong>{well.dailyKwh === null || well.dailyKwh === undefined ? '—' : well.dailyKwh.toLocaleString('es-MX')} <small>kWh</small></strong>
          </article>
        </div>
      </section>

      <section className="content-grid well-detail-grid-main">
        <div className="panel chart-panel fade-up well-detail-flow-chart">
          <PanelHeader
            title="Flujo y amperaje"
            subtitle="Misma línea temporal para revisar relación hidráulica y carga eléctrica"
          />
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={timeline}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke={axisColor} />
              <YAxis yAxisId="flow" stroke={axisColor} />
              <YAxis yAxisId="amps" orientation="right" stroke="#7dd3fc" />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Line yAxisId="flow" type="monotone" dataKey="flow" name="Flujo (m³/h)" stroke="#14b8ff" strokeWidth={2.8} dot={{ r: 3 }} connectNulls={false} />
              <Line yAxisId="amps" type="monotone" dataKey="amps" name="Amperaje (A)" stroke="#7dd3fc" strokeWidth={2.6} dot={{ r: 3 }} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up well-diagnostic-panel">
          <PanelHeader title="Diagnóstico sugerido" subtitle="Lectura rápida para mantenimiento" />
          <div className="diagnostic-stack">
            <article>
              <div className="diagnostic-icon"><Activity size={16} /></div>
              <div>
                <span>Síntoma</span>
                <strong>{profile.diagnostic?.symptom}</strong>
              </div>
            </article>
            <article>
              <div className="diagnostic-icon"><Wrench size={16} /></div>
              <div>
                <span>Posible causa</span>
                <strong>{profile.diagnostic?.cause}</strong>
              </div>
            </article>
            <article>
              <div className="diagnostic-icon"><ClipboardCheck size={16} /></div>
              <div>
                <span>Prioridad de revisión</span>
                <strong>{profile.diagnostic?.priority}</strong>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="content-grid well-detail-secondary-grid">
        <div className="panel summary-panel fade-up">
          <PanelHeader title="Eficiencia energética" subtitle="kWh/m³ contra promedio esperado" />
          <div className="well-efficiency-card">
            <div>
              <span>Actual</span>
              <strong>{well.efficiency ? well.efficiency.toFixed(2) : '—'} <small>kWh/m³</small></strong>
            </div>
            <div>
              <span>Promedio referencia</span>
              <strong>{profile.averageEfficiency?.toFixed(2) || '—'} <small>kWh/m³</small></strong>
            </div>
            <div className={efficiencyGap && efficiencyGap > 0.12 ? 'efficiency-gap warning' : 'efficiency-gap'}>
              <span>Diferencia</span>
              <strong>{efficiencyGap === null ? '—' : `${efficiencyGap > 0 ? '+' : ''}${efficiencyGap.toFixed(2)}`}</strong>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={timeline}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke={axisColor} />
              <YAxis stroke={axisColor} domain={[0, 'auto']} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Line type="monotone" dataKey="efficiency" name="kWh/m³" stroke="#38bdf8" strokeWidth={2.4} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up">
          <PanelHeader title="Factor de carga" subtitle="Carga actual contra banda operativa" />
          <div className="load-factor-box">
            <div className="load-factor-value">
              <span>Actual</span>
              <strong>{well.loadFactor === null || well.loadFactor === undefined ? '—' : `${well.loadFactor}%`}</strong>
            </div>
            <div className="load-factor-track">
              <span style={{ width: `${well.loadFactor || 0}%` }} />
            </div>
            <p>Banda esperada: {profile.loadFactorTarget || '—'}</p>
          </div>
        </div>

        <div className="panel summary-panel fade-up">
          <PanelHeader title="Metadata técnica" subtitle="Base temporal para futura lectura desde SQL Server" />
          <div className="metadata-list">
            <div><span>Amperaje nominal</span><strong>{profile.nominalAmps || '—'} A</strong></div>
            <div><span>Tipo de bomba</span><strong>{profile.pumpType || '—'}</strong></div>
            <div><span>Línea asociada</span><strong>{profile.line || '—'}</strong></div>
            <div><span>Tanque asociado</span><strong>{profile.tank || '—'}</strong></div>
          </div>
        </div>
      </section>

      <section className="panel table-wrapper fade-up well-history-panel">
        <PanelHeader title="Histórico corto" subtitle="Últimas horas disponibles en datos mock" />
        <div className="pozos-table-scroll">
          <table className="pozos-operacion-table well-history-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Flujo</th>
                <th>Amperaje</th>
                <th>kWh/m³</th>
                <th>Factor de carga</th>
              </tr>
            </thead>
            <tbody>
              {historicalRows.map((row) => (
                <tr key={row.time}>
                  <td>{row.time}</td>
                  <td>{formatNumber(row.flow)} m³/h</td>
                  <td>{formatNumber(row.amps, 0)} A</td>
                  <td>{row.efficiency ? row.efficiency.toFixed(2) : '—'}</td>
                  <td>{row.loadFactor === null || row.loadFactor === undefined ? '—' : `${row.loadFactor}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}


function LineasSection() {
  return (
    <section className="content-grid pozos-main-grid single-wide-grid">
      <div className="panel chart-panel fade-up">
        <PanelHeader title="Líneas de conducción" subtitle="Vista operativa de flujo por línea y comportamiento mensual." />
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={monthlyAverages}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke={axisColor} />
            <YAxis stroke={axisColor} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend />
            <Bar dataKey="entrada" name="Entrada" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
            <Line type="monotone" dataKey="tratada" name="Tratada" stroke="#7dd3fc" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="suave" name="Suave" stroke="#38bdf8" strokeWidth={2.3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="panel summary-panel fade-up">
        <PanelHeader title="Estado de líneas" subtitle="Base visual para líneas principales y retorno operativo." />
        <div className="summary-stack">
          {filtrosVsTratada.map((item) => (
            <article className="summary-item" key={item.day}>
              <div className="summary-label">{item.day}</div>
              <div className="summary-value-row">
                <div className="summary-value">{item.filtros.toLocaleString('es-MX')}</div>
                <div className="summary-unit">m³ filtros</div>
              </div>
              <div className="summary-trend">{item.tratada.toLocaleString('es-MX')} m³ de agua tratada</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConcesionSection() {
  const usedPct = concessionSummary.usedPct;
  const remainingPct = Math.max(0, 100 - usedPct);
  const projectedPct = concessionProjection.projectedPct;

  return (
    <>
      <section className="concession-hero panel fade-up">
        <div className="concession-hero-copy">
          <div className="eyebrow">Concesión de agua · Periodo vigente</div>
          <h2>Uso acumulado de concesión</h2>
          <p>
            Seguimiento ejecutivo del volumen autorizado, consumo acumulado, remanente y proyección de cierre para anticipar riesgo de excedente.
          </p>
        </div>
        <div className="concession-gauge-wrap">
          <div className="concession-gauge" style={{ '--used': `${usedPct}%`, '--remaining': `${remainingPct}%` }}>
            <div>
              <strong>{usedPct.toFixed(1)}%</strong>
              <span>usado</span>
            </div>
          </div>
          <div className="concession-gauge-caption">
            <span>{concessionSummary.period}</span>
            <strong>{concessionSummary.status}</strong>
          </div>
        </div>
      </section>

      <section className="cards-grid concession-kpi-grid">
        <KpiCard label="Concesión autorizada" value={concessionSummary.authorized.toLocaleString('es-MX')} unit="m³" trend={concessionSummary.validity} accent="red" />
        <KpiCard label="Consumo acumulado" value={concessionSummary.used.toLocaleString('es-MX')} unit="m³" trend="Volumen ejercido en el periodo actual" accent="crimson" />
        <KpiCard label="Remanente" value={concessionSummary.remaining.toLocaleString('es-MX')} unit="m³" trend={`${remainingPct.toFixed(1)}% disponible`} accent="wine" />
        <KpiCard label="Porcentaje usado" value={usedPct.toFixed(1)} unit="%" trend={concessionSummary.cutoff} accent="brown" />
      </section>

      <section className="content-grid concession-main-grid">
        <div className="panel chart-panel fade-up">
          <PanelHeader title="Histórico y proyección de consumo" subtitle="Consumo acumulado contra tendencia proyectada de cierre" />
          <ResponsiveContainer width="100%" height={330}>
            <ComposedChart data={concessionHistory}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend />
              <Bar dataKey="consumo" name="Consumo mensual (m³)" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              <Line type="monotone" dataKey="acumulado" name="Acumulado (m³)" stroke="#7dd3fc" strokeWidth={2.6} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="proyeccion" name="Proyección (m³)" stroke="#f59e0b" strokeWidth={2.4} strokeDasharray="6 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="panel summary-panel fade-up concession-projection-panel">
          <PanelHeader title="Proyección de cierre" subtitle="Lectura ejecutiva con el ritmo actual" />
          <div className="concession-projection-stack">
            <article>
              <span>Tendencia de consumo</span>
              <strong>{concessionProjection.trend}</strong>
              <p>{concessionProjection.trendNote}</p>
            </article>
            <article className={projectedPct >= 90 ? 'warning' : ''}>
              <span>Cierre proyectado</span>
              <strong>{concessionProjection.projectedUsed.toLocaleString('es-MX')} m³</strong>
              <p>{projectedPct.toFixed(1)}% de la concesión autorizada.</p>
            </article>
            <article>
              <span>Margen estimado</span>
              <strong>{concessionProjection.projectedRemaining.toLocaleString('es-MX')} m³</strong>
              <p>{concessionProjection.recommendation}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="content-grid concession-bottom-grid">
        <div className="panel fade-up concession-breakdown-panel">
          <PanelHeader title="Concesiones activas" subtitle="Contratos y vigencias considerados en el uso acumulado" />
          <div className="concession-contract-list">
            {concesiones.map((item) => (
              <article key={item.name}>
                <div>
                  <span>{item.name}</span>
                  <strong>{item.volumen}</strong>
                  <p>{item.vigencia}</p>
                </div>
                <StatusBadge type="normal">{item.status}</StatusBadge>
              </article>
            ))}
          </div>
        </div>

        <div className="panel fade-up concession-alert-panel">
          <PanelHeader title="Alertas de concesión" subtitle="Riesgos que conviene vigilar antes del cierre" />
          <div className="concession-alert-list">
            {concessionAlerts.map((alert) => (
              <article className={alert.level} key={alert.title}>
                <div className="alert-icon"><AlertTriangle size={16} /></div>
                <div>
                  <strong>{alert.title}</strong>
                  <span>{alert.detail}</span>
                </div>
                <em>{alert.priority}</em>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RevisionDiariaSection() {
  const criticalCount = dailyReviewPriorities.filter((item) => item.level === 'critical').length;
  const highCount = dailyReviewPriorities.filter((item) => item.priority === 'Alta' || item.priority === 'Crítica').length;

  return (
    <>
      <section className="daily-review-hero panel fade-up">
        <div>
          <div className="eyebrow">Revisión operativa diaria · Sistemas de bombeo</div>
          <h2>Prioridades de inspección para hoy</h2>
          <p>
            Resumen accionable para mantenimiento: pozos con desviaciones, eficiencia fuera de objetivo, amperaje anómalo, tanques críticos y riesgos de concesión.
          </p>
        </div>
        <div className="daily-review-status-card">
          <div className="daily-review-icon"><ClipboardCheck size={24} /></div>
          <div>
            <span>Atención requerida</span>
            <strong>{criticalCount} críticas · {highCount} altas</strong>
          </div>
        </div>
      </section>

      <section className="cards-grid stagger-grid daily-review-kpi-grid">
        {dailyReviewSummary.map((card, index) => (
          <KpiCard key={card.label} {...card} style={{ animationDelay: `${index * 60}ms` }} />
        ))}
      </section>

      <section className="content-grid daily-review-main-grid">
        <div className="panel fade-up daily-priority-panel">
          <PanelHeader title="Prioridades del día" subtitle="Ordenadas por impacto operativo y urgencia de revisión" />
          <div className="daily-priority-list">
            {dailyReviewPriorities.map((item, index) => (
              <article className={item.level} key={`${item.type}-${item.target}`}>
                <div className="priority-rank">{index + 1}</div>
                <div className="priority-body">
                  <div className="priority-topline">
                    <strong>{item.target}</strong>
                    <span>{item.type}</span>
                  </div>
                  <p>{item.description}</p>
                  <div className="priority-meta-row">
                    <em>{item.metric}</em>
                    <b>{item.owner}</b>
                  </div>
                </div>
                <StatusBadge type={item.level === 'critical' ? 'critical' : item.level === 'warning' ? 'warning' : 'normal'}>{item.priority}</StatusBadge>
              </article>
            ))}
          </div>
        </div>

        <div className="panel chart-panel fade-up daily-ranking-panel">
          <PanelHeader title="Ranking de elementos a revisar" subtitle="Mayor puntuación = mayor prioridad operativa" />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyReviewRanking} layout="vertical" margin={{ left: 12, right: 24 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis type="number" stroke={axisColor} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" stroke={axisColor} width={86} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="score" name="Prioridad" radius={[0, 10, 10, 0]}>
                {dailyReviewRanking.map((item) => (
                  <Cell key={item.name} fill={item.score >= 85 ? '#f87171' : item.score >= 70 ? '#f59e0b' : '#38bdf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="daily-ranking-table-wrap">
            <table className="pozos-table daily-ranking-table">
              <thead>
                <tr>
                  <th>Elemento</th>
                  <th>Motivo</th>
                  <th>Puntaje</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {dailyReviewRanking.map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.reason}</td>
                    <td>{item.score}</td>
                    <td>{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel fade-up daily-diagnostics-panel">
        <PanelHeader title="Diagnósticos resumidos por pozo" subtitle="Síntoma, causa probable y prioridad para el equipo de mantenimiento" />
        <div className="daily-diagnostics-grid">
          {dailyReviewDiagnostics.map((item) => (
            <article className={item.level} key={item.well}>
              <div className="diagnostic-card-head">
                <strong>{item.well}</strong>
                <StatusBadge type={item.level}>{item.priority}</StatusBadge>
              </div>
              <div className="diagnostic-mini-row">
                <span>Síntoma</span>
                <p>{item.symptom}</p>
              </div>
              <div className="diagnostic-mini-row">
                <span>Posible causa</span>
                <p>{item.cause}</p>
              </div>
              <div className="diagnostic-mini-row">
                <span>Acción sugerida</span>
                <p>{item.action}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-grid daily-review-bottom-grid">
        <div className="panel summary-panel fade-up daily-export-panel">
          <PanelHeader title="Resumen diario preparado" subtitle="Checklist base para reporte o exportación de turno" />
          <div className="daily-export-list">
            {dailyReviewExportChecklist.map((item) => (
              <article key={item.title}>
                <div className="export-check-icon"><ClipboardCheck size={15} /></div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel summary-panel fade-up daily-review-note-panel">
          <PanelHeader title="Criterio de priorización mock" subtitle="Reglas temporales para simular operación diaria" />
          <div className="review-rule-stack">
            <article><span>Crítico</span><p>kWh/m³ alto, flujo bajo con amperaje elevado o tanque por debajo de banda segura.</p></article>
            <article><span>Revisar</span><p>Desvío mayor a 10%, factor de carga fuera de rango o lectura incompleta.</p></article>
            <article><span>Normal</span><p>Operación dentro de banda, sin alertas y con última lectura reciente.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}

const sectionMap = {
  dashboard: {
    title: 'Resumen de Pozos',
    render: () => <DashboardBaseSection />,
  },
  pozos: {
    title: 'Pozos',
    render: ({ itemId } = {}) => itemId ? <WellDetailSection wellId={itemId} /> : <PozosSection />,
  },
  tanques: {
    title: 'Tanques',
    render: () => <TanquesSection />,
  },
  lineas: {
    title: 'Líneas',
    render: () => <LineasSection />,
  },
  balance: {
    title: 'Balance de Agua',
    render: () => <BalanceSection />,
  },
  concesion: {
    title: 'Concesión',
    render: () => <ConcesionSection />,
  },
  revision: {
    title: 'Revisión Diaria',
    render: () => <RevisionDiariaSection />,
  },
  consumos: {
    title: 'Pozos',
    render: () => <PozosSection />,
  },
  cip: {
    title: 'Revisión Diaria',
    render: () => <RevisionDiariaSection />,
  },
  uv: {
    title: 'Revisión Diaria',
    render: () => <RevisionDiariaSection />,
  },
  reportes: {
    title: 'Revisión Diaria',
    render: () => <RevisionDiariaSection />,
  },
};

export default function PozosDashboardPage({ section = 'dashboard', itemId, setHeaderMeta }) {
  const current = sectionMap[section] || sectionMap.dashboard;

  useEffect(() => {
    setHeaderMeta({
      title: section === 'pozos' && itemId ? (wellsOperationalStatus.find((well) => well.id === itemId)?.name || current.title) : current.title,
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
  }, [current, section, itemId, setHeaderMeta]);

  const content = useMemo(() => current.render({ itemId }), [current, itemId]);

  return <div className="page-grid pozos-page">{content}</div>;
}
