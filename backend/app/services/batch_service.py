"""
QR Batch Service
Handles QR code batch generation and management
"""

from app.models import db, QRBatch, QRCode, Scheme, Admin
from app.utils import QRCodeGenerator, BatchProcessor
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class QRBatchService:
    """Service for managing QR code batches"""
    
    @staticmethod
    def create_batch(batch_name: str, quantity: int, scheme_id: int, admin_id: int) -> tuple:
        """
        Create new QR batch and generate unique codes
        
        Args:
            batch_name: Name of the batch
            quantity: Number of QR codes to generate
            scheme_id: Associated scheme ID
            admin_id: Admin creating the batch
            
        Returns:
            Tuple (success, batch, error_message)
        """
        try:
            # Validate scheme exists and is active
            scheme = Scheme.query.get(scheme_id)
            if not scheme:
                return False, None, "Scheme not found"
            
            # Validate quantity
            if quantity <= 0 or quantity > 1000000:  # Max 10 lakhs
                return False, None, "Quantity must be between 1 and 1000000"
            
            # Create batch record
            batch_code = f"BATCH_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{admin_id}"
            
            batch = QRBatch(
                batch_name=batch_name,
                batch_code=batch_code,
                quantity=quantity,
                scheme_id=scheme_id,
                created_by=admin_id
            )
            
            db.session.add(batch)
            db.session.flush()  # Get batch ID without committing
            
            logger.info(f"Created batch {batch.id} with {quantity} codes")
            
            # Generate QR codes in batches to avoid memory issues
            QRBatchService._generate_codes_for_batch(batch.id, quantity, scheme_id)
            
            db.session.commit()
            
            logger.info(f"Successfully generated {quantity} QR codes for batch {batch.id}")
            return True, batch, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating batch: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    def _generate_codes_for_batch(batch_id: int, quantity: int, scheme_id: int):
        """
        Generate QR codes for batch in chunks
        
        Args:
            batch_id: Batch ID
            quantity: Number of codes to generate
            scheme_id: Scheme ID
        """
        from flask import current_app
        batch_size = current_app.config.get("BATCH_SIZE", 1000)
        
        for i in range(0, quantity, batch_size):
            codes_to_create = min(batch_size, quantity - i)
            
            qr_codes = []
            for j in range(codes_to_create):
                unique_code = QRCodeGenerator.generate_unique_code(batch_id, i + j)
                
                qr = QRCode(
                    unique_code=unique_code,
                    batch_id=batch_id,
                    scheme_id=scheme_id,
                    is_used=False
                )
                qr_codes.append(qr)
            
            db.session.add_all(qr_codes)
            db.session.commit()
            
            logger.info(f"Generated {codes_to_create} codes for batch {batch_id} (progress: {i}/{quantity})")
    
    @staticmethod
    def get_batch_stats(batch_id: int) -> dict:
        """Get statistics for a batch"""
        batch = QRBatch.query.get(batch_id)
        if not batch:
            return None
        
        total = batch.quantity
        used = QRCode.query.filter_by(batch_id=batch_id, is_used=True).count()
        unused = total - used
        usage_percentage = (used / total * 100) if total > 0 else 0
        
        return {
            "id": batch.id,
            "batch_name": batch.batch_name,
            "batch_code": batch.batch_code,
            "total_codes": total,
            "used_codes": used,
            "unused_codes": unused,
            "usage_percentage": round(usage_percentage, 2),
            "created_at": batch.created_at.isoformat(),
            "created_by": batch.created_by_admin.username if batch.created_by_admin else "Unknown"
        }
    
    @staticmethod
    def list_batches(page: int = 1, per_page: int = 50, scheme_id: int = None) -> dict:
        """List all batches with pagination"""
        from app.utils import paginate_query
        
        query = QRBatch.query
        
        if scheme_id:
            query = query.filter_by(scheme_id=scheme_id)
        
        query = query.order_by(QRBatch.created_at.desc())
        
        batches, total, total_pages, page = paginate_query(query, page, per_page)
        
        return {
            "batches": [QRBatchService.get_batch_stats(b.id) for b in batches],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages
            }
        }
    
    @staticmethod
    def get_batch_by_id(batch_id: int) -> dict:
        """Get detailed batch information"""
        batch = QRBatch.query.get(batch_id)
        if not batch:
            return None
        
        return QRBatchService.get_batch_stats(batch_id)
    
    @staticmethod
    def delete_batch(batch_id: int) -> tuple:
        """
        Delete batch and associated QR codes
        
        Returns:
            Tuple (success, error_message)
        """
        try:
            batch = QRBatch.query.get(batch_id)
            if not batch:
                return False, "Batch not found"
            
            # Check if any codes are used
            used_count = QRCode.query.filter_by(batch_id=batch_id, is_used=True).count()
            if used_count > 0:
                return False, f"Cannot delete batch with {used_count} used codes"
            
            # Delete QR codes
            QRCode.query.filter_by(batch_id=batch_id).delete()
            
            # Delete batch
            db.session.delete(batch)
            db.session.commit()
            
            logger.info(f"Deleted batch {batch_id}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting batch: {str(e)}")
            return False, str(e)
