from datetime import datetime
from typing import List

from pydantic import BaseModel

from app.schemas.dashboard import KpiCard


class WaterMetricItem(BaseModel):
    name: str
    value: float
    unit: str = ''
    detail: str = ''


class TankLevelItem(BaseModel):
    name: str
    volume_m3: float
    height_m: float
    capacity_m3: float
    fill_pct: float
    status: str


class CipPoint(BaseModel):
    day: str
    hours: float


class BalancePoint(BaseModel):
    label: str
    entrada: float
    salida: float


class MonthlyAveragePoint(BaseModel):
    month: str
    tratada: float
    cruda: float
    suave: float


class WaterDashboardPayload(BaseModel):
    title: str
    subtitle: str
    cards: List[KpiCard]
    water_entry_by_well: List[WaterMetricItem]
    water_consumption: List[WaterMetricItem]
    tank_levels: List[TankLevelItem]
    supply_hours: List[WaterMetricItem]
    filters_vs_treated: List[WaterMetricItem]
    cip_weekly: List[CipPoint]
    entry_vs_exit: List[BalancePoint]
    monthly_averages: List[MonthlyAveragePoint]
    daily_indicators: List[WaterMetricItem]
    report_modules: List[str]
    updated_at: datetime
