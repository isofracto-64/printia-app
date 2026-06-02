from typing import Optional
from sqlmodel import SQLModel, Field
from model.mixins import TimeMixim


class KioskConfig(TimeMixim, SQLModel, table=True):
    __tablename__ = "kiosk_config"

    id: str = Field(primary_key=True)
    name: str = "Printia Kiosk"
    status: str = "Disponible"
    address: str = "Universidad Tecnológica de Nuevo Laredo"
    latitude: float = 27.4864
    longitude: float = -99.5104
    esp32_cam_url: Optional[str] = None
