"""
Winner Selection Service
Handles winner selection and management
"""

from app.models import db, Submission, WinnerSelection, Scheme
from datetime import datetime
import random
import logging

logger = logging.getLogger(__name__)


class WinnerService:
    """Service for managing winners"""
    
    @staticmethod
    def select_random_winners(scheme_id: int, count: int, admin_id: int) -> tuple:
        """
        Randomly select winners for a scheme
        
        Args:
            scheme_id: Scheme ID
            count: Number of winners to select
            admin_id: Admin performing the selection
            
        Returns:
            Tuple (success, selected_winners, error_message)
        """
        try:
            # Get eligible submissions (not already winners)
            submissions = db.session.query(Submission).filter(
                Submission.qr_code.has(scheme_id=scheme_id),
                Submission.is_winner == False
            ).all()
            
            if len(submissions) < count:
                return False, [], f"Only {len(submissions)} eligible submissions found, need {count}"
            
            # Randomly select
            selected = random.sample(submissions, count)
            
            selected_winners = []
            for submission in selected:
                submission.is_winner = True
                
                # Create winner selection record
                winner_record = WinnerSelection(
                    submission_id=submission.id,
                    scheme_id=scheme_id,
                    selection_method="random",
                    selected_by=admin_id
                )
                
                db.session.add(winner_record)
                selected_winners.append(submission)
            
            db.session.commit()
            
            logger.info(f"Selected {count} random winners for scheme {scheme_id} by admin {admin_id}")
            
            return True, [WinnerService.get_winner_details(w.id) for w in selected_winners], None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error selecting random winners: {str(e)}")
            return False, [], str(e)
    
    @staticmethod
    def manually_mark_winner(submission_id: int, scheme_id: int, admin_id: int) -> tuple:
        """
        Manually mark a submission as winner
        
        Returns:
            Tuple (success, error_message)
        """
        try:
            submission = Submission.query.get(submission_id)
            if not submission:
                return False, "Submission not found"
            
            if submission.is_winner:
                return False, "Already marked as winner"
            
            submission.is_winner = True
            
            # Create winner record
            winner_record = WinnerSelection(
                submission_id=submission_id,
                scheme_id=scheme_id,
                selection_method="manual",
                selected_by=admin_id
            )
            
            db.session.add(winner_record)
            db.session.commit()
            
            logger.info(f"Manually marked submission {submission_id} as winner by admin {admin_id}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error marking winner: {str(e)}")
            return False, str(e)
    
    @staticmethod
    def get_winner_details(submission_id: int) -> dict:
        """Get winner submission details"""
        submission = Submission.query.get(submission_id)
        if not submission:
            return None
        
        winner_record = WinnerSelection.query.filter_by(submission_id=submission_id).first()
        
        return {
            "submission_id": submission.id,
            "name": submission.name,
            "phone": submission.phone,
            "city": submission.city,
            "qr_code": submission.qr_code.unique_code if submission.qr_code else None,
            "submitted_at": submission.submitted_at.isoformat(),
            "selection_method": winner_record.selection_method if winner_record else None,
            "selected_at": winner_record.created_at.isoformat() if winner_record else None,
            "announced": submission.winner_announced,
            "announcement_date": winner_record.announcement_date.isoformat() if winner_record and winner_record.announcement_date else None
        }
    
    @staticmethod
    def list_winners(scheme_id: int = None, announced_only: bool = False, page: int = 1, per_page: int = 50) -> dict:
        """List all winners"""
        from app.utils import paginate_query
        
        query = db.session.query(Submission).filter_by(is_winner=True)
        
        if scheme_id:
            query = query.filter(Submission.qr_code.has(scheme_id=scheme_id))
        
        if announced_only:
            query = query.filter_by(winner_announced=True)
        
        query = query.order_by(Submission.submitted_at.desc())
        
        submissions, total, total_pages, page = paginate_query(query, page, per_page)
        
        return {
            "winners": [WinnerService.get_winner_details(s.id) for s in submissions],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages
            }
        }
    
    @staticmethod
    def announce_winner(submission_id: int) -> tuple:
        """Announce a winner"""
        try:
            submission = Submission.query.get(submission_id)
            if not submission:
                return False, "Submission not found"
            
            submission.winner_announced = True
            
            winner_record = WinnerSelection.query.filter_by(submission_id=submission_id).first()
            if winner_record:
                winner_record.announcement_date = datetime.utcnow()
            
            db.session.commit()
            
            logger.info(f"Announced winner {submission_id}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error announcing winner: {str(e)}")
            return False, str(e)
    
    @staticmethod
    def bulk_announce_winners(submission_ids: list) -> tuple:
        """Announce multiple winners"""
        try:
            now = datetime.utcnow()
            
            # Update submissions
            db.session.query(Submission).filter(
                Submission.id.in_(submission_ids)
            ).update({"winner_announced": True})
            
            # Update winner records
            db.session.query(WinnerSelection).filter(
                WinnerSelection.submission_id.in_(submission_ids)
            ).update({"announcement_date": now})
            
            db.session.commit()
            
            logger.info(f"Announced {len(submission_ids)} winners")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error bulk announcing winners: {str(e)}")
            return False, str(e)
    
    @staticmethod
    def get_winner_statistics(scheme_id: int = None) -> dict:
        """Get winner statistics"""
        query = db.session.query(Submission).filter_by(is_winner=True)
        
        if scheme_id:
            query = query.filter(Submission.qr_code.has(scheme_id=scheme_id))
        
        total_winners = query.count()
        announced = db.session.query(Submission).filter_by(is_winner=True, winner_announced=True)
        
        if scheme_id:
            announced = announced.filter(Submission.qr_code.has(scheme_id=scheme_id))
        
        announced_count = announced.count()
        
        return {
            "total_winners": total_winners,
            "announced": announced_count,
            "pending_announcement": total_winners - announced_count
        }
