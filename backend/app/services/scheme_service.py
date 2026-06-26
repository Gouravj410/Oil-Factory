"""
Scheme Service
Manages marketing schemes and rewards
"""

from app.models import db, Scheme, QRCode
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SchemeService:
    """Service for managing schemes"""
    
    @staticmethod
    def create_scheme(title: str, description: str, reward_details: str, reward_text: str, start_date: datetime, end_date: datetime) -> tuple:
        """
        Create new scheme
        
        Returns:
            Tuple (success, scheme, error_message)
        """
        try:
            # Validate dates
            if start_date >= end_date:
                return False, None, "Start date must be before end date"
            
            # Check if start date is in the past
            from datetime import timedelta
            # Add a 24-hour buffer so timezone differences don't prevent creating campaigns for "today"
            if start_date < (datetime.utcnow() - timedelta(hours=24)):
                return False, None, "Start date cannot be in the past"
            
            scheme = Scheme(
                title=title,
                description=description,
                reward_details=reward_details,
                reward_text=reward_text,
                start_date=start_date,
                end_date=end_date,
                is_active=True
            )
            
            db.session.add(scheme)
            db.session.commit()
            
            logger.info(f"Created scheme {scheme.id}: {title}")
            return True, scheme, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating scheme: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def get_scheme_details(scheme_id: int) -> dict:
        """Get detailed scheme information"""
        scheme = Scheme.query.get(scheme_id)
        if not scheme:
            return None
        
        total_qr = QRCode.query.filter_by(scheme_id=scheme_id).count()
        used_qr = QRCode.query.filter_by(scheme_id=scheme_id, is_used=True).count()
        
        return {
            "id": scheme.id,
            "title": scheme.title,
            "description": scheme.description,
            "reward_details": scheme.reward_details,
            "reward_text": scheme.reward_text,
            "start_date": scheme.start_date.isoformat(),
            "end_date": scheme.end_date.isoformat(),
            "is_active": scheme.is_active,
            "total_qr_codes": total_qr,
            "used_qr_codes": used_qr,
            "unused_qr_codes": total_qr - used_qr,
            "usage_percentage": (used_qr / total_qr * 100) if total_qr > 0 else 0,
            "created_at": scheme.created_at.isoformat()
        }
    
    @staticmethod
    def list_schemes(page: int = 1, per_page: int = 50, active_only: bool = None) -> dict:
        """List schemes with pagination"""
        from app.utils import paginate_query
        
        query = Scheme.query
        
        if active_only is not None:
            query = query.filter_by(is_active=active_only)
        
        query = query.order_by(Scheme.created_at.desc())
        
        schemes, total, total_pages, page = paginate_query(query, page, per_page)
        
        return {
            "schemes": [SchemeService.get_scheme_details(s.id) for s in schemes],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages
            }
        }
    
    @staticmethod
    def update_scheme(scheme_id: int, **kwargs) -> tuple:
        """
        Update scheme details
        
        Returns:
            Tuple (success, scheme, error_message)
        """
        try:
            scheme = Scheme.query.get(scheme_id)
            if not scheme:
                return False, None, "Scheme not found"
            
            # Update allowed fields
            allowed_fields = ["title", "description", "reward_details", "reward_text", "is_active"]
            
            for field in allowed_fields:
                if field in kwargs and kwargs[field] is not None:
                    setattr(scheme, field, kwargs[field])
            
            # Update dates if provided
            if "start_date" in kwargs and kwargs["start_date"]:
                scheme.start_date = kwargs["start_date"]
            
            if "end_date" in kwargs and kwargs["end_date"]:
                scheme.end_date = kwargs["end_date"]
                
                # Validate dates
                if scheme.start_date >= scheme.end_date:
                    return False, None, "Start date must be before end date"
            
            scheme.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Updated scheme {scheme_id}")
            return True, scheme, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error updating scheme: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def disable_scheme(scheme_id: int) -> tuple:
        """Disable a scheme"""
        return SchemeService.update_scheme(scheme_id, is_active=False)
    
    @staticmethod
    def enable_scheme(scheme_id: int) -> tuple:
        """Enable a scheme"""
        return SchemeService.update_scheme(scheme_id, is_active=True)
    
    @staticmethod
    def get_active_schemes() -> list:
        """Get all active schemes"""
        schemes = Scheme.query.filter_by(is_active=True).all()
        return [SchemeService.get_scheme_details(s.id) for s in schemes]
    
    @staticmethod
    def assign_qr_batch_to_scheme(scheme_id: int, batch_id: int) -> tuple:
        """
        Assign QR batch to a scheme
        
        Returns:
            Tuple (success, error_message)
        """
        try:
            # Verify scheme and batch exist
            scheme = Scheme.query.get(scheme_id)
            if not scheme:
                return False, "Scheme not found"
            
            # Update QR codes in batch with scheme
            updated = db.session.query(QRCode).filter_by(batch_id=batch_id).update(
                {"scheme_id": scheme_id},
                synchronize_session=False
            )
            
            db.session.commit()
            
            logger.info(f"Assigned {updated} QR codes from batch {batch_id} to scheme {scheme_id}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error assigning batch to scheme: {str(e)}")
            return False, str(e)
