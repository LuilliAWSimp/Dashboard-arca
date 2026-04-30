export default function KpiCard({ label, value, unit, trend, accent, style }) {
  return (
    <div className={`panel kpi-card accent-${accent || 'red'} fade-up`} style={style}>
      <div className="kpi-glow" />
      <div className="kpi-label">{label}</div>
      <div className="kpi-value-row">
        <div className="kpi-value">{value}</div>
        <div className="kpi-unit">{unit}</div>
      </div>
      <div className="kpi-trend">{trend}</div>
    </div>
  );
}
