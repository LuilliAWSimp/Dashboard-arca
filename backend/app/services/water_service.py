from __future__ import annotations

from datetime import datetime

from app.schemas.dashboard import KpiCard
from app.schemas.water import (
    BalancePoint,
    CipPoint,
    MonthlyAveragePoint,
    TankLevelItem,
    WaterDashboardPayload,
    WaterMetricItem,
)


WATER_SECTION_META = {
    'dashboard': ('Pozos', 'Monitoreo base de agua y balance hidráulico'),
    'consumos': ('Consumos', 'Agua tratada, suave y cruda'),
    'tanques': ('Tanques', 'Niveles por volumen y altura'),
    'balance': ('Entradas vs salidas', 'Comparativo operativo de agua'),
    'reportes': ('Reportes', 'Base preparada para exportaciones y seguimiento'),
    'cip': ('CIP', 'Consumo horario CIP y referencia semanal'),
    'uv': ('Lámparas UV', 'Preparado para fase siguiente'),
}


def _base_cards() -> list[KpiCard]:
    return [
        KpiCard(label='Entrada total de agua', value='1,284', unit='m³/día', trend='Suma diaria de pozos', accent='red'),
        KpiCard(label='Agua tratada', value='742', unit='m³/día', trend='Consumo principal', accent='crimson'),
        KpiCard(label='Balance neto', value='118', unit='m³', trend='Entrada - salida', accent='wine'),
        KpiCard(label='Pozos operando 24 h', value='3/4', unit='pozos', trend='Disponibilidad', accent='brown'),
    ]


def get_water_dashboard_payload(section: str = 'dashboard') -> WaterDashboardPayload:
    title, subtitle = WATER_SECTION_META.get(section, WATER_SECTION_META['dashboard'])

    water_entry_by_well = [
        WaterMetricItem(name='Pozo 1', value=312, unit='m³', detail='Entrada diaria'),
        WaterMetricItem(name='Pozo 2', value=284, unit='m³', detail='Entrada diaria'),
        WaterMetricItem(name='Pozo 3', value=356, unit='m³', detail='Entrada diaria'),
        WaterMetricItem(name='Pozo 4', value=332, unit='m³', detail='Entrada diaria'),
    ]
    water_consumption = [
        WaterMetricItem(name='Tratada', value=742, unit='m³', detail='Consumo diario'),
        WaterMetricItem(name='Suave', value=198, unit='m³', detail='Consumo diario'),
        WaterMetricItem(name='Cruda', value=226, unit='m³', detail='Consumo diario'),
    ]
    tank_levels = [
        TankLevelItem(name='Tanque tratado', volume_m3=420, height_m=4.8, capacity_m3=500, fill_pct=84, status='Normal'),
        TankLevelItem(name='Tanque suave', volume_m3=188, height_m=3.2, capacity_m3=260, fill_pct=72, status='Normal'),
        TankLevelItem(name='Tanque crudo', volume_m3=144, height_m=2.1, capacity_m3=300, fill_pct=48, status='Atención'),
    ]
    supply_hours = [
        WaterMetricItem(name='Pozo 1', value=24, unit='hrs', detail='Suministro 24 hrs'),
        WaterMetricItem(name='Pozo 2', value=24, unit='hrs', detail='Suministro 24 hrs'),
        WaterMetricItem(name='Pozo 3', value=21, unit='hrs', detail='Paro corto'),
        WaterMetricItem(name='Pozo 4', value=24, unit='hrs', detail='Suministro 24 hrs'),
    ]
    filters_vs_treated = [
        WaterMetricItem(name='Agua filtros', value=812, unit='m³', detail='Paso por filtros'),
        WaterMetricItem(name='Agua tratada', value=742, unit='m³', detail='Salida tratada'),
    ]
    cip_weekly = [
        CipPoint(day='Lun', hours=2.1),
        CipPoint(day='Mar', hours=2.4),
        CipPoint(day='Mié', hours=1.9),
        CipPoint(day='Jue', hours=2.6),
        CipPoint(day='Vie', hours=2.3),
        CipPoint(day='Sáb', hours=1.7),
        CipPoint(day='Dom', hours=1.4),
    ]
    entry_vs_exit = [
        BalancePoint(label='Hoy', entrada=1284, salida=1166),
        BalancePoint(label='Ayer', entrada=1248, salida=1189),
        BalancePoint(label='Semana', entrada=8710, salida=8336),
    ]
    monthly_averages = [
        MonthlyAveragePoint(month='Ene', tratada=718, cruda=232, suave=186),
        MonthlyAveragePoint(month='Feb', tratada=731, cruda=228, suave=194),
        MonthlyAveragePoint(month='Mar', tratada=745, cruda=221, suave=201),
        MonthlyAveragePoint(month='Abr', tratada=742, cruda=226, suave=198),
    ]
    daily_indicators = [
        WaterMetricItem(name='Indicador total diario', value=1284, unit='m³', detail='Suma diaria'),
        WaterMetricItem(name='Indicador tratada', value=742, unit='m³', detail='Salida tratada'),
        WaterMetricItem(name='Indicador cruda', value=226, unit='m³', detail='Consumo cruda'),
        WaterMetricItem(name='Indicador suave', value=198, unit='m³', detail='Consumo suave'),
    ]
    report_modules = [
        'Dashboard base de pozos',
        'Reporte de entradas vs salidas',
        'Reporte semanal CIP',
        'Monitoreo UV (fase siguiente)',
    ]

    if section == 'consumos':
        subtitle = 'Vista enfocada en consumos de agua tratada, suave y cruda'
    elif section == 'tanques':
        subtitle = 'Vista enfocada en niveles y capacidad de tanques'
    elif section == 'balance':
        subtitle = 'Vista enfocada en entradas, salidas y balances netos'
    elif section == 'reportes':
        subtitle = 'Estructura inicial para exportaciones y reportes hidráulicos'
    elif section == 'cip':
        subtitle = 'Vista enfocada en CIP y consumo semanal'
    elif section == 'uv':
        subtitle = 'Espacio reservado para monitoreo UV en siguiente fase'

    return WaterDashboardPayload(
        title=title,
        subtitle=subtitle,
        cards=_base_cards(),
        water_entry_by_well=water_entry_by_well,
        water_consumption=water_consumption,
        tank_levels=tank_levels,
        supply_hours=supply_hours,
        filters_vs_treated=filters_vs_treated,
        cip_weekly=cip_weekly,
        entry_vs_exit=entry_vs_exit,
        monthly_averages=monthly_averages,
        daily_indicators=daily_indicators,
        report_modules=report_modules,
        updated_at=datetime.utcnow(),
    )
