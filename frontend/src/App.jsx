import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import PozosDashboardPage from './pages/PozosDashboardPage';
import { getAuth, logout } from './services/authService';

const DEFAULT_POZOS_SECTION = 'dashboard';
const POZOS_HOME = `/pozos/${DEFAULT_POZOS_SECTION}`;

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
      { key: 'fuentes', label: 'Fuentes', iconKey: 'pozos-fuentes' },
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

function Shell({ user, onLogout, sidebarProps, children, headerMeta, shellClass = '' }) {
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
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function PozosShell({ user, onLogout }) {
  const { section = DEFAULT_POZOS_SECTION } = useParams();
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
      shellClass="pozos-shell single-domain-shell"
      sidebarProps={{
        collapsed,
        onToggle: () => setCollapsed((value) => !value),
        sections: POZOS_MENU,
        basePath: '/pozos',
        brandTitle: 'POZOS',
        brandSubtitle: 'MONITOREO HÍDRICO',
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

function LegacyPozosRedirect() {
  const { legacySection } = useParams();
  return <Navigate to={`/pozos/${legacySection || DEFAULT_POZOS_SECTION}`} replace />;
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
        element={auth?.token ? <Navigate to={POZOS_HOME} replace /> : <LoginPage onSuccess={handleLoginSuccess} />}
      />

      <Route path="/" element={<Navigate to={auth?.token ? POZOS_HOME : '/login'} replace />} />
      <Route path="/domains" element={<Navigate to={auth?.token ? POZOS_HOME : '/login'} replace />} />
      <Route path="/electric" element={<Navigate to={auth?.token ? POZOS_HOME : '/login'} replace />} />
      <Route path="/electric/:section" element={<Navigate to={auth?.token ? POZOS_HOME : '/login'} replace />} />

      <Route path="/pozos" element={<Navigate to={POZOS_HOME} replace />} />
      <Route
        path="/pozos/:section"
        element={
          <ProtectedRoute auth={auth}>
            <PozosShell user={auth?.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      <Route path="/:legacySection" element={<ProtectedRoute auth={auth}><LegacyPozosRedirect /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={auth?.token ? POZOS_HOME : '/login'} replace />} />
    </Routes>
  );
}
