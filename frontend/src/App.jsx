import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MultiPlantDashboardPage from './pages/MultiPlantDashboardPage';
import LinesOverviewPage from './pages/LinesOverviewPage';
import PozosDashboardPage from './pages/PozosDashboardPage';
import DomainSelectionPage from './pages/DomainSelectionPage';
import { getAuth, logout } from './services/authService';
import { fetchPlantCatalog } from './services/plantService';

const DEFAULT_ELECTRIC_SECTION = 'dashboard';
const DEFAULT_POZOS_SECTION = 'dashboard';
const DEFAULT_PLANT_ID = 'gdl-demo';

const POZOS_MENU = [
  {
    group: 'Pozos',
    items: [
      { key: 'dashboard', label: 'Dashboard base', iconKey: 'pozos-dashboard' },
      { key: 'consumos', label: 'Consumos', iconKey: 'pozos-consumos' },
      { key: 'tanques', label: 'Tanques', iconKey: 'pozos-tanques' },
      { key: 'balance', label: 'Entradas vs salidas', iconKey: 'pozos-balance' },
      { key: 'cip', label: 'CIP', iconKey: 'pozos-cip' },
      { key: 'uv', label: 'Lámparas UV', iconKey: 'pozos-uv' },
      { key: 'reportes', label: 'Reportes', iconKey: 'pozos-reportes' },
    ],
  },
];

function nowText() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function buildElectricCatalog(catalog) {
  if (!catalog?.menu) return null;
  return {
    ...catalog,
    menu: catalog.menu
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.key !== 'pozos'),
      }))
      .filter((group) => group.items.length > 0),
  };
}

function Shell({ user, onLogout, sidebarProps, children, headerMeta, shellClass = '', onDomainSwitch }) {
  const [clock, setClock] = useState(nowText());

  useEffect(() => {
    const interval = setInterval(() => setClock(nowText()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`app-shell ${shellClass}`.trim()}>
      <Sidebar {...sidebarProps} />
      <div className="main-shell">
        <Header
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          now={clock}
          onExport={headerMeta.onExport}
          onEmail={headerMeta.onEmail}
          user={user}
          onLogout={onLogout}
          onDomainSwitch={onDomainSwitch}
          domainSwitchLabel={sidebarProps?.domainSwitchLabel}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function ElectricShell({ user, onLogout }) {
  const { section = DEFAULT_ELECTRIC_SECTION } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const [headerMeta, setHeaderMeta] = useState({
    title: 'Dashboard General',
    subtitle: 'Monitoreo en tiempo real',
    onExport: () => {},
    onEmail: () => {},
  });

  useEffect(() => {
    fetchPlantCatalog(DEFAULT_PLANT_ID).then(setCatalog).catch(() => setCatalog(null));
  }, []);

  const electricCatalog = useMemo(() => buildElectricCatalog(catalog), [catalog]);

  const sectionContent = section === 'multi-plant-dashboard'
    ? <MultiPlantDashboardPage setHeaderMeta={setHeaderMeta} />
    : section === 'lineas'
      ? <LinesOverviewPage setHeaderMeta={setHeaderMeta} />
      : <DashboardPage plantId={DEFAULT_PLANT_ID} section={section} setHeaderMeta={setHeaderMeta} catalog={electricCatalog} />;

  return (
    <Shell
      user={user}
      onLogout={onLogout}
      headerMeta={headerMeta}
      onDomainSwitch={() => navigate('/domains')}
      sidebarProps={{
        collapsed,
        onToggle: () => setCollapsed((value) => !value),
        sections: electricCatalog?.menu || [],
        basePath: '/electric',
        brandTitle: 'CONSUMO ELÉCTRICO',
        brandSubtitle: 'PLANTA ZAPOPAN',
        domainSwitchPath: '/domains',
        domainSwitchLabel: 'Cambiar dominio',
      }}
    >
      {sectionContent}
    </Shell>
  );
}

function PozosShell({ user, onLogout }) {
  const { section = DEFAULT_POZOS_SECTION } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [headerMeta, setHeaderMeta] = useState({
    title: 'Pozos · Dashboard base',
    subtitle: '',
    onExport: () => {},
    onEmail: () => {},
  });

  return (
    <Shell
      user={user}
      onLogout={onLogout}
      headerMeta={headerMeta}
      shellClass="pozos-shell"
      onDomainSwitch={() => navigate('/domains')}
      sidebarProps={{
        collapsed,
        onToggle: () => setCollapsed((value) => !value),
        sections: POZOS_MENU,
        basePath: '/pozos',
        brandTitle: 'Prueba',
        brandSubtitle: 'Monitoreo hidrico',
        domainSwitchPath: '/domains',
        domainSwitchLabel: 'Cambiar dominio',
      }}
    >
      <PozosDashboardPage section={section} setHeaderMeta={setHeaderMeta} />
    </Shell>
  );
}

function ProtectedRoute({ auth, children }) {
  if (!auth?.token) return <Navigate to="/login" replace />;
  return children;
}

function LegacyElectricRedirect() {
  const { legacySection } = useParams();
  return <Navigate to={`/electric/${legacySection || DEFAULT_ELECTRIC_SECTION}`} replace />;
}

export default function App() {
  const [auth, setAuth] = useState(getAuth());
  const handleLoginSuccess = () => setAuth(getAuth());
  const handleLogout = () => {
    logout();
    setAuth(null);
  };

  useEffect(() => {
    const syncAuth = () => setAuth(getAuth());
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={auth?.token ? <Navigate to="/domains" replace /> : <LoginPage onSuccess={handleLoginSuccess} />}
      />

      <Route
        path="/domains"
        element={
          <ProtectedRoute auth={auth}>
            <DomainSelectionPage />
          </ProtectedRoute>
        }
      />

      <Route path="/electric" element={<Navigate to={`/electric/${DEFAULT_ELECTRIC_SECTION}`} replace />} />
      <Route
        path="/electric/:section"
        element={
          <ProtectedRoute auth={auth}>
            <ElectricShell user={auth?.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route path="/pozos" element={<Navigate to={`/pozos/${DEFAULT_POZOS_SECTION}`} replace />} />
      <Route
        path="/pozos/:section"
        element={
          <ProtectedRoute auth={auth}>
            <PozosShell user={auth?.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={auth?.token ? '/domains' : '/login'} replace />} />
      <Route path="/:legacySection" element={<ProtectedRoute auth={auth}><LegacyElectricRedirect /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={auth?.token ? '/domains' : '/login'} replace />} />
    </Routes>
  );
}
