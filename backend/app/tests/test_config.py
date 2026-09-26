from app.core.config import Settings


def test_settings_initialization():
    settings = Settings()
    assert settings.APP_ENV in ["development", "testing", "production"]
    assert settings.DATABASE_URL.startswith("postgresql")
    assert settings.REDIS_URL.startswith("redis")
    assert settings.JWT_ALGORITHM == "HS256"
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) > 0
