"""
Admin Authentication Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.services import AdminService
from app.utils import format_response, log_admin_action
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
@log_admin_action("Admin", "register")
def register():
    """Register new admin user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        
        if not all([username, email, password]):
            return format_response(
                error="Missing required fields",
                status_code=400
            )
        
        # Validate email format
        if "@" not in email or "." not in email:
            return format_response(
                error="Invalid email format",
                status_code=400
            )
        
        # Create admin
        success, admin, error = AdminService.create_admin(username, email, password)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        return format_response(
            data={
                "id": admin.id,
                "username": admin.username,
                "email": admin.email,
                "role": admin.role
            },
            message="Admin registered successfully",
            status_code=201
        )
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return format_response(
            error="Registration failed",
            status_code=500
        )


@auth_bp.route("/login", methods=["POST"])
@log_admin_action("Admin", "login")
def login():
    """Admin login"""
    try:
        data = request.get_json()
        
        username = data.get("username", "").strip()
        password = data.get("password", "")
        
        if not username or not password:
            return format_response(
                error="Username and password required",
                status_code=400
            )
        
        # Authenticate
        success, admin, error = AdminService.authenticate_admin(username, password)
        
        if not success:
            return format_response(
                error=error,
                status_code=401
            )
        
        # Create tokens
        access_token = create_access_token(identity=admin.id)
        refresh_token = create_refresh_token(identity=admin.id)
        
        return format_response(
            data={
                "admin_id": admin.id,
                "username": admin.username,
                "role": admin.role,
                "access_token": access_token,
                "refresh_token": refresh_token
            },
            message="Login successful",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return format_response(
            error="Login failed",
            status_code=500
        )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        admin_id = get_jwt_identity()
        access_token = create_access_token(identity=admin_id)
        
        return format_response(
            data={"access_token": access_token},
            message="Token refreshed",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Refresh error: {str(e)}")
        return format_response(
            error="Token refresh failed",
            status_code=500
        )


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Change admin password"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        old_password = data.get("old_password", "")
        new_password = data.get("new_password", "")
        
        if not old_password or not new_password:
            return format_response(
                error="Both passwords required",
                status_code=400
            )
        
        success, error = AdminService.change_password(admin_id, old_password, new_password)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        return format_response(
            message="Password changed successfully",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        return format_response(
            error="Password change failed",
            status_code=500
        )


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Get admin profile"""
    try:
        admin_id = get_jwt_identity()
        admin_data = AdminService.get_admin_details(admin_id)
        
        if not admin_data:
            return format_response(
                error="Admin not found",
                status_code=404
            )
        
        return format_response(
            data=admin_data,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return format_response(
            error="Failed to fetch profile",
            status_code=500
        )
