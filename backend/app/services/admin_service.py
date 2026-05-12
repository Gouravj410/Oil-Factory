"""
Admin Service
Manages admin users and authentication
"""

from app.models import db, Admin
from app.utils import PasswordManager
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class AdminService:
    """Service for managing admin users"""
    
    @staticmethod
    def create_admin(username: str, email: str, password: str, role: str = "admin") -> tuple:
        """
        Create new admin user
        
        Returns:
            Tuple (success, admin, error_message)
        """
        try:
            # Validate password strength
            is_valid, error = PasswordManager.validate_password_strength(password)
            if not is_valid:
                return False, None, error
            
            # Check if username/email already exists
            if Admin.query.filter_by(username=username).first():
                return False, None, "Username already exists"
            
            if Admin.query.filter_by(email=email).first():
                return False, None, "Email already exists"
            
            # Validate role
            if role not in ["admin", "super_admin"]:
                return False, None, "Invalid role"
            
            # Create admin
            password_hash = PasswordManager.hash_password(password)
            
            admin = Admin(
                username=username,
                email=email,
                password_hash=password_hash,
                role=role,
                is_active=True
            )
            
            db.session.add(admin)
            db.session.commit()
            
            logger.info(f"Created admin {username} with role {role}")
            return True, admin, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating admin: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def authenticate_admin(username: str, password: str) -> tuple:
        """
        Authenticate admin with username and password
        
        Returns:
            Tuple (success, admin, error_message)
        """
        try:
            admin = Admin.query.filter_by(username=username).first()
            
            if not admin:
                logger.warning(f"Login attempt with non-existent username: {username}")
                return False, None, "Invalid credentials"
            
            if not admin.is_active:
                logger.warning(f"Login attempt with inactive admin: {username}")
                return False, None, "Account is disabled"
            
            if not PasswordManager.verify_password(admin.password_hash, password):
                logger.warning(f"Failed login attempt for {username}")
                return False, None, "Invalid credentials"
            
            # Update last login
            admin.last_login = datetime.utcnow()
            db.session.commit()
            
            logger.info(f"Admin {username} logged in successfully")
            return True, admin, None
            
        except Exception as e:
            logger.error(f"Error authenticating admin: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def get_admin_details(admin_id: int) -> dict:
        """Get admin information"""
        admin = Admin.query.get(admin_id)
        if not admin:
            return None
        
        return {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "role": admin.role,
            "is_active": admin.is_active,
            "last_login": admin.last_login.isoformat() if admin.last_login else None,
            "created_at": admin.created_at.isoformat()
        }
    
    @staticmethod
    def list_admins(page: int = 1, per_page: int = 50) -> dict:
        """List all admins"""
        from app.utils import paginate_query
        
        query = Admin.query.order_by(Admin.created_at.desc())
        
        admins, total, total_pages, page = paginate_query(query, page, per_page)
        
        return {
            "admins": [AdminService.get_admin_details(a.id) for a in admins],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages
            }
        }
    
    @staticmethod
    def update_admin(admin_id: int, **kwargs) -> tuple:
        """Update admin details"""
        try:
            admin = Admin.query.get(admin_id)
            if not admin:
                return False, None, "Admin not found"
            
            # Update allowed fields
            if "email" in kwargs and kwargs["email"]:
                # Check email uniqueness
                existing = Admin.query.filter(Admin.email == kwargs["email"], Admin.id != admin_id).first()
                if existing:
                    return False, None, "Email already exists"
                admin.email = kwargs["email"]
            
            if "role" in kwargs and kwargs["role"]:
                if kwargs["role"] not in ["admin", "super_admin"]:
                    return False, None, "Invalid role"
                admin.role = kwargs["role"]
            
            if "is_active" in kwargs:
                admin.is_active = kwargs["is_active"]
            
            admin.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Updated admin {admin_id}")
            return True, admin, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating admin: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def change_password(admin_id: int, old_password: str, new_password: str) -> tuple:
        """Change admin password"""
        try:
            admin = Admin.query.get(admin_id)
            if not admin:
                return False, "Admin not found"
            
            # Verify old password
            if not PasswordManager.verify_password(admin.password_hash, old_password):
                return False, "Current password is incorrect"
            
            # Validate new password strength
            is_valid, error = PasswordManager.validate_password_strength(new_password)
            if not is_valid:
                return False, error
            
            # Update password
            admin.password_hash = PasswordManager.hash_password(new_password)
            db.session.commit()
            
            logger.info(f"Admin {admin_id} changed password")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error changing password: {str(e)}")
            return False, str(e)
    
    @staticmethod
    def disable_admin(admin_id: int) -> tuple:
        """Disable an admin account"""
        return AdminService.update_admin(admin_id, is_active=False)
    
    @staticmethod
    def enable_admin(admin_id: int) -> tuple:
        """Enable an admin account"""
        return AdminService.update_admin(admin_id, is_active=True)
