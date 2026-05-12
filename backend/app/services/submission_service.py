"""
Submission Service
Handles user submissions and QR code usage tracking
"""

from app.models import db, Submission, QRCode, DuplicateSubmissionCheck
from app.utils import QRValidator, get_client_ip, get_user_agent, validate_phone, sanitize_input, validate_city
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class SubmissionService:
    """Service for handling user submissions"""
    
    @staticmethod
    def validate_submission_data(name: str, phone: str, city: str) -> tuple:
        """
        Validate submission form data
        
        Returns:
            Tuple (is_valid, error_message)
        """
        # Validate name
        name = sanitize_input(name, 255)
        if not name or len(name) < 2:
            return False, "Name is invalid"
        
        # Validate phone
        if not validate_phone(phone):
            return False, "Invalid phone number"
        
        # Validate city
        if not validate_city(city):
            return False, "Invalid city"
        
        return True, None
    
    @staticmethod
    def create_submission(qr_code: str, name: str, phone: str, city: str, state: str = None, purchase_details: dict = None) -> tuple:
        """
        Create new submission after QR validation
        
        Args:
            qr_code: The scanned QR code
            name: User name
            phone: User phone
            city: User city
            state: Optional state
            purchase_details: Optional purchase information
            
        Returns:
            Tuple (success, submission, error_message)
        """
        try:
            # Validate QR code
            is_valid, error, qr_obj = QRValidator.validate_qr_code(qr_code)
            if not is_valid:
                return False, None, error
            
            # Validate submission data
            is_valid, error = SubmissionService.validate_submission_data(name, phone, city)
            if not is_valid:
                return False, None, error
            
            # Sanitize inputs
            name = sanitize_input(name, 255)
            city = sanitize_input(city, 100)
            state = sanitize_input(state, 100) if state else None
            
            # Check duplicate submissions
            is_dup, is_blocked, reason = QRValidator.is_duplicate_submission(phone, qr_obj.id)
            
            if is_blocked:
                logger.warning(f"Blocked submission attempt: {phone} - {reason}")
                return False, None, "Too many submission attempts. Please try again later."
            
            # Create submission
            submission = Submission(
                qr_code_id=qr_obj.id,
                name=name,
                phone=phone,
                city=city,
                state=state,
                purchase_details=purchase_details,
                ip_address=get_client_ip(),
                user_agent=get_user_agent()
            )
            
            db.session.add(submission)
            db.session.flush()  # Get submission ID
            
            # Mark QR as used
            qr_obj.is_used = True
            qr_obj.used_at = datetime.utcnow()
            qr_obj.used_by_submission_id = submission.id
            
            # Update batch usage counter
            batch = qr_obj.batch
            batch.used_count += 1
            
            db.session.commit()
            
            logger.info(f"Created submission {submission.id} for QR {qr_code}")
            
            # Track duplicate attempt
            SubmissionService._track_duplicate_attempt(phone)
            
            return True, submission, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating submission: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def get_submission_details(submission_id: int) -> dict:
        """Get detailed submission information"""
        submission = Submission.query.get(submission_id)
        if not submission:
            return None
        
        return {
            "id": submission.id,
            "name": submission.name,
            "phone": submission.phone,
            "city": submission.city,
            "state": submission.state,
            "qr_code": submission.qr_code.unique_code if submission.qr_code else None,
            "submitted_at": submission.submitted_at.isoformat(),
            "is_winner": submission.is_winner,
            "winner_announced": submission.winner_announced,
            "purchase_details": submission.purchase_details
        }
    
    @staticmethod
    def list_submissions(page: int = 1, per_page: int = 50, city: str = None, batch_id: int = None, start_date=None, end_date=None) -> dict:
        """List submissions with filters"""
        from app.utils import paginate_query
        
        query = Submission.query
        
        if city:
            query = query.filter_by(city=city)
        
        if batch_id:
            batch_qr_ids = db.session.query(QRCode.id).filter_by(batch_id=batch_id).subquery()
            query = query.filter(Submission.qr_code_id.in_(batch_qr_ids))
        
        if start_date:
            query = query.filter(Submission.submitted_at >= start_date)
        
        if end_date:
            query = query.filter(Submission.submitted_at <= end_date)
        
        query = query.order_by(Submission.submitted_at.desc())
        
        submissions, total, total_pages, page = paginate_query(query, page, per_page)
        
        return {
            "submissions": [SubmissionService.get_submission_details(s.id) for s in submissions],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages
            }
        }
    
    @staticmethod
    def _track_duplicate_attempt(phone: str):
        """Track duplicate submission attempts"""
        try:
            attempt = DuplicateSubmissionCheck.query.filter_by(phone_number=phone).first()
            
            if not attempt:
                attempt = DuplicateSubmissionCheck(
                    phone_number=phone,
                    attempt_count=1
                )
                db.session.add(attempt)
            else:
                attempt.attempt_count += 1
                attempt.last_attempt_at = datetime.utcnow()
                
                # Block after 5 attempts
                if attempt.attempt_count > 5:
                    attempt.is_blocked = True
                    attempt.block_reason = "Maximum submission attempts exceeded"
            
            db.session.commit()
        except Exception as e:
            logger.error(f"Error tracking duplicate attempt: {str(e)}")
    
    @staticmethod
    def unblock_phone(phone: str) -> tuple:
        """Admin action to unblock a phone number"""
        try:
            attempt = DuplicateSubmissionCheck.query.filter_by(phone_number=phone).first()
            
            if not attempt:
                return False, "Phone number not found"
            
            attempt.is_blocked = False
            attempt.block_reason = None
            attempt.attempt_count = 0
            
            db.session.commit()
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error unblocking phone: {str(e)}")
            return False, str(e)
    
    @staticmethod
    def get_submission_stats() -> dict:
        """Get submission statistics"""
        total_submissions = Submission.query.count()
        total_winners = Submission.query.filter_by(is_winner=True).count()
        unique_phones = db.session.query(Submission.phone.distinct()).count()
        unique_cities = db.session.query(Submission.city.distinct()).count()
        
        return {
            "total_submissions": total_submissions,
            "total_winners": total_winners,
            "unique_participants": unique_phones,
            "unique_cities": unique_cities,
            "winner_percentage": (total_winners / total_submissions * 100) if total_submissions > 0 else 0
        }
