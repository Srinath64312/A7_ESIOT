from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./motorguard.db" # Default for local dev, override with asyncpg
    AI_MODEL_DIR: str = "../ai/models"
    AI_MODEL_VERSION: str = "1.0.0"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "supersecretkey"
    SIMULATION_INTERVAL_MS: int = 1000
    DEFAULT_TARGET_RPM: int = 1500

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
