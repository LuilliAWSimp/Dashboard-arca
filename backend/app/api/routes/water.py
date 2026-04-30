from fastapi import APIRouter, HTTPException

from app.schemas.water import WaterDashboardPayload
from app.services.water_service import WATER_SECTION_META, get_water_dashboard_payload

router = APIRouter(prefix='/water', tags=['water'])


@router.get('/dashboard/{section}', response_model=WaterDashboardPayload)
def read_water_dashboard(section: str):
    if section not in WATER_SECTION_META:
        raise HTTPException(status_code=404, detail='Sección de pozos no encontrada')
    return get_water_dashboard_payload(section)


@router.get('/reports/catalog', response_model=list[str])
def read_water_report_catalog():
    return get_water_dashboard_payload('reportes').report_modules
