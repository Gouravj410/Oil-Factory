# Routes module
from .auth_routes import auth_bp
from .qr_routes import qr_bp
from .admin_routes import admin_bp
from .scheme_routes import scheme_bp
from .winner_routes import winner_bp

__all__ = [
    "auth_bp",
    "qr_bp",
    "admin_bp",
    "scheme_bp",
    "winner_bp",
]
