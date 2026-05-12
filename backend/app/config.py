"""
Application Configuration
Handles development, testing, and production configurations
"""

import os
from datetime import timedelta


class Config:
    """Base configuration"""
    
    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    DEBUG = False
    TESTING = False
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/fmcg_rewards"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 20,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    }
    
    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # File Upload
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
    ALLOWED_EXTENSIONS = {"pdf", "zip", "xlsx", "csv"}
    
    # QR Configuration
    QR_IMAGE_SIZE = 10  # Size per box in pixels
    QR_BORDER = 2  # Border in boxes
    
    # Pagination
    ITEMS_PER_PAGE = 50
    
    # Batch Processing
    BATCH_SIZE = 1000  # Process QR codes in batches
    EXPORT_BATCH_SIZE = 5000  # Export records per batch
    
    # Celery
    CELERY_BROKER_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    CELERY_RESULT_BACKEND = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "app.log")


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    LOG_LEVEL = "DEBUG"


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    RATELIMIT_ENABLED = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    # Ensure SECRET_KEY and JWT_SECRET_KEY are set in environment
    SECRET_KEY = os.getenv("SECRET_KEY", None)
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", None)

    @classmethod
    def validate(cls):
        if not cls.SECRET_KEY or not cls.JWT_SECRET_KEY:
            raise ValueError("SECRET_KEY and JWT_SECRET_KEY must be set in production")


def get_config():
    """Get configuration based on environment"""
    env = os.getenv("FLASK_ENV", "development")
    
    if env == "testing":
        return TestingConfig
    elif env == "production":
        return ProductionConfig
    else:
        return DevelopmentConfig
