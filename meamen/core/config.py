from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Fitness Trainer API"
    debug: bool = True

    # Logging configuration
    log_level: str = "INFO"
    log_requests: bool = True
    log_request_body: bool = True
    log_health_checks: bool = False

    # Database configuration
    database_url: str = "sqlite:///./fitness_trainer.db"

    # JWT configuration
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
