from functools import lru_cache
from typing import List
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="ARCA CONTINENTAL Energy API", alias="APP_NAME")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    debug: bool = Field(default=True, alias="DEBUG")
    database_url: str = Field(default="sqlite:///./energy_dashboard.db", alias="DATABASE_URL")
    db_mode: str = Field(default="sqlserver", alias="DB_MODE")
    allowed_origins_raw: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        alias="ALLOWED_ORIGINS",
    )

    smtp_host: str = Field(default="smtp.office365.com", alias="SMTP_HOST")
    smtp_port: int = Field(default=587, alias="SMTP_PORT")
    smtp_username: str = Field(default="", alias="SMTP_USERNAME")
    smtp_password: str = Field(default="", alias="SMTP_PASSWORD")
    smtp_from: str = Field(default="no-reply@example.com", alias="SMTP_FROM")

    # SQL Server settings
    sqlserver_host: str = Field(default=r"(localdb)\MSSQLLocalDB", alias="SQLSERVER_HOST")
    sqlserver_port: int = Field(default=1433, alias="SQLSERVER_PORT")
    sqlserver_database: str = Field(default="ION_Network", alias="SQLSERVER_DATABASE")
    sqlserver_username: str = Field(default="", alias="SQLSERVER_USERNAME")
    sqlserver_password: str = Field(default="", alias="SQLSERVER_PASSWORD")
    sqlserver_driver: str = Field(default="ODBC Driver 18 for SQL Server", alias="SQLSERVER_DRIVER")
    sqlserver_trust_cert: bool = Field(default=True, alias="SQLSERVER_TRUST_CERT")
    sqlserver_encrypt: str = Field(default="optional", alias="SQLSERVER_ENCRYPT")
    sqlserver_use_windows_auth: bool = Field(default=True, alias="SQLSERVER_USE_WINDOWS_AUTH")

    # Real-source mapping
    sqlserver_source_mode: str = Field(default="table", alias="SQLSERVER_SOURCE_MODE")
    sqlserver_source_table: str = Field(default="dbo.v_dashboard_measurements", alias="SQLSERVER_SOURCE_TABLE")

    @property
    def allowed_origins(self) -> List[str]:
        return [item.strip() for item in self.allowed_origins_raw.split(",") if item.strip()]

    @property
    def resolved_database_url(self) -> str:
        if self.db_mode.lower() == "sqlserver":
            driver = quote_plus(self.sqlserver_driver)
            trust = "yes" if self.sqlserver_trust_cert else "no"

            # Named instances such as (localdb)\MSSQLLocalDB should not include :port
            server_part = self.sqlserver_host
            if "\\" not in self.sqlserver_host and self.sqlserver_port:
                server_part = f"{self.sqlserver_host}:{self.sqlserver_port}"

            if self.sqlserver_use_windows_auth:
                return (
                    f"mssql+pyodbc://@{server_part}/"
                    f"{self.sqlserver_database}"
                    f"?driver={driver}"
                    f"&Trusted_Connection=yes"
                    f"&TrustServerCertificate={trust}"
                    f"&Encrypt={self.sqlserver_encrypt}"
                )

            user = quote_plus(self.sqlserver_username)
            password = quote_plus(self.sqlserver_password)
            return (
                f"mssql+pyodbc://{user}:{password}@{server_part}/"
                f"{self.sqlserver_database}"
                f"?driver={driver}"
                f"&TrustServerCertificate={trust}"
                f"&Encrypt={self.sqlserver_encrypt}"
            )

        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
