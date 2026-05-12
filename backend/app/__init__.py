"""
Flask Application Factory
Initializes and configures the Flask application
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from app.config import get_config
from app.models import db
from app.routes import auth_bp, qr_bp, admin_bp, scheme_bp, winner_bp
import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def create_app(config_name=None):
    """Application factory"""
    
    # Get config
    config = get_config() if not config_name else config_name
    
    # Initialize app
    app = Flask(__name__)
    app.config.from_object(config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=app.config.get("CORS_ORIGINS", ["*"]))
    jwt = JWTManager(app)
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        storage_uri=app.config.get("RATELIMIT_STORAGE_URL")
    )
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(qr_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(scheme_bp)
    app.register_blueprint(winner_bp)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Endpoint not found",
            "status_code": 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "status_code": 500
        }), 500
    
    # Health check endpoint
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "version": "1.0.0"
        }), 200
    
    # API info endpoint
    @app.route("/api", methods=["GET"])
    def api_info():
        return jsonify({
            "name": "FMCG Reward Campaign API",
            "version": "1.0.0",
            "endpoints": {
                "auth": "/api/auth",
                "qr": "/api/qr",
                "admin": "/api/admin",
                "schemes": "/api/schemes",
                "winners": "/api/winners"
            }
        }), 200
    
    # Create database tables
    with app.app_context():
        db.create_all()
        logger.info("Database tables created/verified")
    
    logger.info("Flask application initialized")
    
    return app
