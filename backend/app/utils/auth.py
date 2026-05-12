"""
Authentication and Security Utilities
"""

from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
import logging

logger = logging.getLogger(__name__)


class PasswordManager:
    """Handle password hashing and verification"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using werkzeug"""
        return generate_password_hash(password, method='pbkdf2:sha256')
    
    @staticmethod
    def verify_password(password_hash: str, password: str) -> bool:
        """Verify password against hash"""
        return check_password_hash(password_hash, password)
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple:
        """
        Validate password strength
        
        Returns:
            Tuple (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        if not (has_upper and has_lower and has_digit):
            return False, "Password must contain uppercase, lowercase, and numbers"
        
        return True, None


class AdminAuthDecorator:
    """Decorators for admin authentication"""
    
    @staticmethod
    def admin_required(f):
        """Require admin authentication"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                admin_id = get_jwt_identity()
                
                # Check if admin exists and is active
                from app.models import Admin
                admin = Admin.query.get(admin_id)
                
                if not admin or not admin.is_active:
                    return jsonify({"error": "Unauthorized"}), 401
                
                return f(*args, **kwargs)
            except Exception as e:
                logger.error(f"Auth error: {str(e)}")
                return jsonify({"error": "Unauthorized"}), 401
        
        return decorated_function
    
    @staticmethod
    def super_admin_required(f):
        """Require super admin role"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                verify_jwt_in_request()
                admin_id = get_jwt_identity()
                
                # Check if admin exists and has super_admin role
                from app.models import Admin
                admin = Admin.query.get(admin_id)
                
                if not admin or not admin.is_active or admin.role != "super_admin":
                    return jsonify({"error": "Insufficient permissions"}), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                logger.error(f"Auth error: {str(e)}")
                return jsonify({"error": "Unauthorized"}), 401
        
        return decorated_function


def log_admin_action(resource_type: str, action: str):
    """
    Decorator to log admin actions
    
    Args:
        resource_type: Type of resource (QRBatch, Scheme, etc.)
        action: Action performed (create, update, delete, etc.)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from app.models import AuditLog, Admin, db
            from flask_jwt_extended import get_jwt_identity
            
            result = f(*args, **kwargs)
            
            try:
                admin_id = get_jwt_identity() if verify_jwt_in_request(optional=True) else None
                
                # Create audit log
                audit = AuditLog(
                    admin_id=admin_id,
                    action=action,
                    resource_type=resource_type,
                    ip_address=request.remote_addr,
                    details={"endpoint": request.path, "method": request.method}
                )
                db.session.add(audit)
                db.session.commit()
            except Exception as e:
                logger.error(f"Error logging action: {str(e)}")
            
            return result
        
        return decorated_function
    
    return decorator


def get_client_ip():
    """Get client IP address from request"""
    if request.environ.get('HTTP_CF_CONNECTING_IP'):
        return request.environ.get('HTTP_CF_CONNECTING_IP')
    
    return request.remote_addr


def get_user_agent():
    """Get user agent from request"""
    return request.headers.get('User-Agent', 'Unknown')
