"""
QR Code Utility Functions
Handles QR generation, validation, and export
"""

import qrcode
import io
import uuid
import hashlib
import os
from datetime import datetime
from flask import current_app
import logging

logger = logging.getLogger(__name__)


class QRCodeGenerator:
    """Generate unique QR codes efficiently"""
    
    @staticmethod
    def generate_unique_code(batch_id: int, index: int) -> str:
        """
        Generate unique, collision-free QR code identifier
        Uses hash-based deterministic generation
        
        Args:
            batch_id: ID of the batch
            index: Sequential index in batch
            
        Returns:
            Unique code string
        """
        # Create deterministic unique code using batch_id and index
        unique_seed = f"{batch_id}:{index}:{uuid.uuid4()}"
        unique_code = hashlib.sha256(unique_seed.encode()).hexdigest()[:20].upper()
        
        # Ensure it's alphanumeric and easily printable
        return f"QR{batch_id}{index:06d}" + unique_code[:8]
    
    @staticmethod
    def generate_qr_image(qr_code: str, size: int = 10, border: int = 2) -> bytes:
        """
        Generate QR image as bytes
        Only called during export, not stored permanently
        
        Args:
            qr_code: The code to encode
            size: Size per box in pixels
            border: Border in boxes
            
        Returns:
            PNG image bytes
        """
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=size,
                border=border,
            )
            qr.add_data(qr_code)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to bytes
            img_bytes = io.BytesIO()
            img.save(img_bytes, format="PNG")
            img_bytes.seek(0)
            
            return img_bytes.getvalue()
        except Exception as e:
            logger.error(f"Error generating QR image: {str(e)}")
            raise
    
    @staticmethod
    def generate_qr_url(qr_code: str, base_url: str = None) -> str:
        """
        Generate the full URL for QR code submission
        
        Args:
            qr_code: The unique code
            base_url: Optional base URL (defaults to config)
            
        Returns:
            Full submission URL
        """
        if base_url is None:
            base_url = current_app.config.get("BASE_URL", "http://localhost:5173")
        
        return f"{base_url}/r/{qr_code}"


class QRValidator:
    """Validate QR codes and check usage status"""
    
    @staticmethod
    def validate_qr_code(unique_code: str):
        """
        Validate QR code exists and is unused
        
        Args:
            unique_code: The QR code to validate
            
        Returns:
            Tuple (is_valid, error_message, qr_code_object)
        """
        from app.models import QRCode, Scheme
        
        try:
            # Find QR code
            qr = QRCode.query.filter_by(unique_code=unique_code).first()
            
            if not qr:
                return False, "Invalid QR code", None
            
            # Check if already used
            if qr.is_used:
                return False, "QR code already used", None
            
            # Check if scheme is active
            scheme = Scheme.query.get(qr.scheme_id)
            if not scheme or not scheme.is_active:
                return False, "Scheme is no longer active", None
            
            # Check if scheme dates are valid
            now = datetime.utcnow()
            if now < scheme.start_date or now > scheme.end_date:
                return False, "Campaign period has ended", None
            
            return True, None, qr
            
        except Exception as e:
            logger.error(f"Error validating QR code: {str(e)}")
            return False, "Validation error occurred", None
    
    @staticmethod
    def is_duplicate_submission(phone: str, qr_code_id: int, threshold: int = 5) -> tuple:
        """
        Check for duplicate submission attempts
        
        Args:
            phone: Phone number
            qr_code_id: QR code ID
            threshold: Max attempts before blocking
            
        Returns:
            Tuple (is_duplicate, is_blocked, reason)
        """
        from app.models import DuplicateSubmissionCheck, Submission
        
        try:
            # Check existing submissions with this phone
            existing = Submission.query.filter_by(phone=phone).count()
            
            if existing > 0:
                # Allow multiple submissions but track them
                return True, False, f"Multiple submissions detected ({existing} existing)"
            
            # Check duplicate attempt counter
            attempt = DuplicateSubmissionCheck.query.filter_by(phone_number=phone).first()
            
            if not attempt:
                return False, False, None
            
            if attempt.is_blocked:
                return True, True, attempt.block_reason
            
            if attempt.attempt_count >= threshold:
                return True, True, "Too many submission attempts"
            
            return False, False, None
            
        except Exception as e:
            logger.error(f"Error checking duplicate submission: {str(e)}")
            return False, False, None


class QRExporter:
    """Export QR codes for printing"""
    
    @staticmethod
    def export_batch_zip(batch_id: int, format: str = "png") -> bytes:
        """
        Export QR batch as ZIP file with images
        Generates images on-the-fly, not stored
        
        Args:
            batch_id: Batch ID
            format: Image format (png, pdf)
            
        Returns:
            ZIP file bytes
        """
        import zipfile
        from app.models import QRCode, QRBatch
        
        try:
            # Get batch
            batch = QRBatch.query.get(batch_id)
            if not batch:
                raise ValueError(f"Batch {batch_id} not found")
            
            # Create ZIP in memory
            zip_buffer = io.BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                # Stream QR codes in batches to avoid memory overload
                page_num = 1
                codes_per_page = 100
                
                for qr_code in QRCode.query.filter_by(batch_id=batch_id).yield_per(codes_per_page):
                    try:
                        img_bytes = QRCodeGenerator.generate_qr_image(qr_code.unique_code)
                        filename = f"qr_{qr_code.id}_{qr_code.unique_code}.png"
                        zf.writestr(filename, img_bytes)
                    except Exception as e:
                        logger.error(f"Error generating QR {qr_code.id}: {str(e)}")
                        continue
            
            zip_buffer.seek(0)
            return zip_buffer.getvalue()
            
        except Exception as e:
            logger.error(f"Error exporting batch: {str(e)}")
            raise
    
    @staticmethod
    def export_submissions_csv(batch_id: int = None, start_date=None, end_date=None) -> bytes:
        """
        Export submissions as CSV
        
        Args:
            batch_id: Optional batch filter
            start_date: Optional start date filter
            end_date: Optional end date filter
            
        Returns:
            CSV file bytes
        """
        import csv
        from app.models import Submission, QRCode
        
        try:
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            # Header
            writer.writerow([
                "Submission ID", "Name", "Phone", "City", "State",
                "QR Code", "Submitted At", "Is Winner", "Winner Announced"
            ])
            
            # Query submissions
            query = Submission.query
            
            if batch_id:
                # Filter by batch
                qr_ids = QRCode.query.filter_by(batch_id=batch_id).with_entities(QRCode.id)
                query = query.filter(Submission.qr_code_id.in_(qr_ids))
            
            if start_date:
                query = query.filter(Submission.submitted_at >= start_date)
            
            if end_date:
                query = query.filter(Submission.submitted_at <= end_date)
            
            # Write data
            for submission in query.yield_per(1000):
                writer.writerow([
                    submission.id,
                    submission.name,
                    submission.phone,
                    submission.city,
                    submission.state or "",
                    submission.qr_code.unique_code,
                    submission.submitted_at.isoformat(),
                    "Yes" if submission.is_winner else "No",
                    "Yes" if submission.winner_announced else "No",
                ])
            
            return csv_buffer.getvalue().encode()
            
        except Exception as e:
            logger.error(f"Error exporting submissions: {str(e)}")
            raise
