"""
Public QR Code and Submission Routes
User-facing endpoints for QR scanning and submission
"""

from flask import Blueprint, request, jsonify
from app.utils import QRValidator, QRCodeGenerator, format_response, validate_phone
from app.services import SubmissionService
from app.models import db, Scheme
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

qr_bp = Blueprint("qr", __name__, url_prefix="/api/qr")


@qr_bp.route("/validate/<qr_code>", methods=["GET"])
def validate_qr(qr_code):
    """
    Validate QR code and get scheme details
    Called before showing submission form
    """
    try:
        qr_code = qr_code.strip().upper()
        
        # Validate QR
        is_valid, error, qr_obj = QRValidator.validate_qr_code(qr_code)
        
        if not is_valid:
            return format_response(
                error=error,
                status_code=400
            )
        
        # Get scheme details
        scheme = Scheme.query.get(qr_obj.scheme_id)
        
        return format_response(
            data={
                "qr_code": qr_code,
                "is_valid": True,
                "scheme_id": scheme.id,
                "reward_text": scheme.reward_text,
                "scheme_title": scheme.title,
                "remaining_days": (scheme.end_date - datetime.utcnow()).days
            },
            message="QR code is valid",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"QR validation error: {str(e)}")
        return format_response(
            error="Validation failed",
            status_code=500
        )


@qr_bp.route("/submit", methods=["POST"])
def submit_qr():
    """
    Submit user form after QR scan
    This is the main user submission endpoint
    """
    try:
        data = request.get_json()
        
        # Extract data
        qr_code = data.get("qr_code", "").strip().upper()
        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()
        city = data.get("city", "").strip()
        state = data.get("state", "").strip() if data.get("state") else None
        purchase_details = data.get("purchase_details", {})
        
        # Validate required fields
        if not all([qr_code, name, phone, city]):
            return format_response(
                error="Missing required fields: qr_code, name, phone, city",
                status_code=400
            )
        
        # Validate phone format
        if not validate_phone(phone):
            return format_response(
                error="Invalid phone number",
                status_code=400
            )
        
        # Create submission
        success, submission, error = SubmissionService.create_submission(
            qr_code=qr_code,
            name=name,
            phone=phone,
            city=city,
            state=state,
            purchase_details=purchase_details
        )
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"User submission created: {submission.id} with phone {phone}")
        
        return format_response(
            data={
                "submission_id": submission.id,
                "status": "success",
                "message": "Your entry has been recorded. Thank you for participating!"
            },
            message="Submission successful",
            status_code=201
        )
        
    except Exception as e:
        logger.error(f"Submission error: {str(e)}")
        return format_response(
            error="Submission failed",
            status_code=500
        )


@qr_bp.route("/check-duplicate", methods=["POST"])
def check_duplicate():
    """Check if phone has existing submissions"""
    try:
        data = request.get_json()
        phone = data.get("phone", "").strip()
        
        if not phone:
            return format_response(
                error="Phone number required",
                status_code=400
            )
        
        if not validate_phone(phone):
            return format_response(
                error="Invalid phone number",
                status_code=400
            )
        
        # Check duplicate
        is_duplicate, is_blocked, reason = QRValidator.is_duplicate_submission(phone, None)
        
        return format_response(
            data={
                "is_duplicate": is_duplicate,
                "is_blocked": is_blocked,
                "reason": reason
            },
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Duplicate check error: {str(e)}")
        return format_response(
            error="Check failed",
            status_code=500
        )


@qr_bp.route("/get-reward/<qr_code>", methods=["GET"])
def get_reward(qr_code):
    """
    Get reward information for a QR code
    Called after successful submission
    """
    try:
        qr_code = qr_code.strip().upper()
        
        # Validate QR exists
        from app.models import QRCode
        qr_obj = QRCode.query.filter_by(unique_code=qr_code).first()
        
        if not qr_obj:
            return format_response(
                error="QR code not found",
                status_code=404
            )
        
        scheme = Scheme.query.get(qr_obj.scheme_id)
        
        return format_response(
            data={
                "qr_code": qr_code,
                "scheme_title": scheme.title,
                "reward_details": scheme.reward_details,
                "reward_text": scheme.reward_text
            },
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get reward error: {str(e)}")
        return format_response(
            error="Failed to fetch reward",
            status_code=500
        )


@qr_bp.route("/public/scheme/<int:scheme_id>", methods=["GET"])
def get_public_scheme(scheme_id):
    """Get public scheme information"""
    try:
        scheme = Scheme.query.get(scheme_id)
        
        if not scheme or not scheme.is_active:
            return format_response(
                error="Scheme not found",
                status_code=404
            )
        
        # Check if scheme is within valid dates
        from datetime import timedelta
        now_utc = datetime.utcnow()
        
        # Add a 24-hour buffer to handle all global timezones gracefully
        start_buffered = scheme.start_date - timedelta(hours=24)
        end_buffered = scheme.end_date + timedelta(hours=24)
        
        is_active = (start_buffered <= now_utc <= end_buffered)
        
        if not is_active:
            error_msg = "Campaign has not started yet" if now_utc < start_buffered else "Campaign period has expired"
            return format_response(
                error=error_msg,
                status_code=400
            )
        
        return format_response(
            data={
                "id": scheme.id,
                "title": scheme.title,
                "description": scheme.description,
                "reward_text": scheme.reward_text,
                "end_date": scheme.end_date.isoformat()
            },
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get scheme error: {str(e)}")
        return format_response(
            error="Failed to fetch scheme",
            status_code=500
        )
