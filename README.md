# ARCA CONTINENTAL Energy Dashboard

Proyecto full-stack para monitoreo eléctrico industrial conectado a SQL Server.

## Qué incluye
- Login con branding **ARCA CONTINENTAL**
- Logout con redirección forzada a `/login`
- Dashboard por planta usando rutas `/dashboard/plant/{plant_id}/{section}`
- Transformadores, subestación y agrupaciones
- Exportación a Excel, PDF, HTML e imagen
- Backend FastAPI listo para SQL Server
- Script SQL para crear las vistas canónicas

## Credenciales incluidas
- `admin / demo123`
- `operacion / operacion123`

## Puesta en marcha
### 1) SQL Server
Ejecuta:

```sql
:r database/sqlserver/create_dashboard_views_arca.sql
```

O abre y ejecuta directamente el archivo `database/sqlserver/create_dashboard_views_arca.sql`.

### 2) Backend
Configura `backend/.env` con tus datos reales. Ya viene preparado para SQL Server:

```env
APP_NAME=ARCA CONTINENTAL Energy API
DB_MODE=sqlserver
SQLSERVER_SOURCE_MODE=table
SQLSERVER_SOURCE_TABLE=dbo.v_dashboard_measurements
SQLSERVER_HOST=TU_HOST
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=ION_Network
SQLSERVER_USERNAME=TU_USUARIO
SQLSERVER_PASSWORD=TU_PASSWORD
SQLSERVER_DRIVER=ODBC Driver 18 for SQL Server
SQLSERVER_TRUST_CERT=true
SQLSERVER_ENCRYPT=optional
```

Luego:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```

## URLs
- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

## Archivos clave
- `database/sqlserver/create_dashboard_views_arca.sql`
- `frontend/src/App.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/services/exportService.js`
- `backend/app/repositories/measurement_repository.py`

## Nota
La sección PTAR sigue necesitando mapeo real si quieres datos propios y no fallback.
