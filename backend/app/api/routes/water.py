from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.water import (
    WaterDashboardPayload,
    WaterSourceActivateResponse,
    WaterSourceInfo,
    WaterSourceValidation,
)
from app.services.water_service import WATER_SECTION_META, get_water_dashboard_payload
from app.services.water_source_service import (
    activate_source,
    list_sources,
    read_upload_json,
    register_upload,
    validate_source_data,
)

router = APIRouter(prefix='/water', tags=['water'])


@router.get('/dashboard/{section}', response_model=WaterDashboardPayload)
def read_water_dashboard(section: str):
    if section not in WATER_SECTION_META:
        raise HTTPException(status_code=404, detail='Sección de pozos no encontrada')
    return get_water_dashboard_payload(section)


@router.get('/reports/catalog', response_model=list[str])
def read_water_report_catalog():
    return get_water_dashboard_payload('reportes').report_modules


@router.get('/sources', response_model=list[WaterSourceInfo])
def read_water_sources():
    return list_sources()


@router.post('/sources/validate', response_model=WaterSourceValidation)
async def validate_water_source(file: UploadFile = File(...)):
    data = await read_upload_json(file)
    return validate_source_data(data)


@router.post('/sources/upload', response_model=WaterSourceInfo)
async def upload_water_source(file: UploadFile = File(...), activate: bool = True):
    return await register_upload(file, activate=activate)


@router.post('/sources/{source_id}/activate', response_model=WaterSourceActivateResponse)
def activate_water_source(source_id: str):
    source = activate_source(source_id)
    return WaterSourceActivateResponse(active_source=source, message='Fuente de pozos activada')
