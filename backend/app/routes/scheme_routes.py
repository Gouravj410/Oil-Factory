"""
Scheme Management Routes
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import AdminAuthDecorator, format_response, log_admin_action
from app.services import SchemeService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

scheme_bp = Blueprint("scheme", __name__, url_prefix="/api/schemes")


@scheme_bp.route("", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Scheme", "create")
def create_scheme():
    """Create new scheme"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        title = data.get("title", "").strip()
        description = data.get("description", "").strip()
        reward_details = data.get("reward_details", "").strip()
        reward_text = data.get("reward_text", "").strip()
        start_date_str = data.get("start_date")
        end_date_str = data.get("end_date")
        
        if not all([title, reward_details, reward_text, start_date_str, end_date_str]):
            return format_response(
                error="Missing required fields",
                status_code=400
            )
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return format_response(
                error="Invalid date format. Use ISO 8601.",
                status_code=400
            )
        
        # Create scheme
        success, scheme, error = SchemeService.create_scheme(
            title=title,
            description=description,
            reward_details=reward_details,
            reward_text=reward_text,
            start_date=start_date,
            end_date=end_date
        )
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} created scheme {scheme.id}")
        
        return format_response(
            data=SchemeService.get_scheme_details(scheme.id),
            message="Scheme created successfully",
            status_code=201
        )
        
    except Exception as e:
        logger.error(f"Create scheme error: {str(e)}")
        return format_response(
            error="Scheme creation failed",
            status_code=500
        )


@scheme_bp.route("", methods=["GET"])
def list_schemes():
    """List all schemes"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        active_only = request.args.get("active_only", None)
        
        # Convert to boolean
        if active_only:
            active_only = active_only.lower() == "true"
        
        result = SchemeService.list_schemes(page, per_page, active_only)
        
        return format_response(
            data=result,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"List schemes error: {str(e)}")
        return format_response(
            error="Failed to fetch schemes",
            status_code=500
        )


@scheme_bp.route("/<int:scheme_id>", methods=["GET"])
def get_scheme(scheme_id):
    """Get scheme details"""
    try:
        scheme_data = SchemeService.get_scheme_details(scheme_id)
        
        if not scheme_data:
            return format_response(
                error="Scheme not found",
                status_code=404
            )
        
        return format_response(
            data=scheme_data,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get scheme error: {str(e)}")
        return format_response(
            error="Failed to fetch scheme",
            status_code=500
        )


@scheme_bp.route("/<int:scheme_id>", methods=["PUT"])
@AdminAuthDecorator.admin_required
@log_admin_action("Scheme", "update")
def update_scheme(scheme_id):
    """Update scheme"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        # Build update kwargs
        update_data = {}
        
        for field in ["title", "description", "reward_details", "reward_text"]:
            if field in data and data[field]:
                update_data[field] = data[field].strip()
        
        if "is_active" in data:
            update_data["is_active"] = data["is_active"]
        
        # Handle dates
        if "start_date" in data and data["start_date"]:
            try:
                update_data["start_date"] = datetime.fromisoformat(
                    data["start_date"].replace('Z', '+00:00')
                )
            except (ValueError, AttributeError):
                return format_response(
                    error="Invalid start_date format",
                    status_code=400
                )
        
        if "end_date" in data and data["end_date"]:
            try:
                update_data["end_date"] = datetime.fromisoformat(
                    data["end_date"].replace('Z', '+00:00')
                )
            except (ValueError, AttributeError):
                return format_response(
                    error="Invalid end_date format",
                    status_code=400
                )
        
        if not update_data:
            return format_response(
                error="No fields to update",
                status_code=400
            )
        
        # Update
        success, scheme, error = SchemeService.update_scheme(scheme_id, **update_data)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} updated scheme {scheme_id}")
        
        return format_response(
            data=SchemeService.get_scheme_details(scheme_id),
            message="Scheme updated successfully",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Update scheme error: {str(e)}")
        return format_response(
            error="Scheme update failed",
            status_code=500
        )


@scheme_bp.route("/<int:scheme_id>/activate", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Scheme", "activate")
def activate_scheme(scheme_id):
    """Activate scheme"""
    try:
        admin_id = get_jwt_identity()
        
        success, scheme, error = SchemeService.enable_scheme(scheme_id)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} activated scheme {scheme_id}")
        
        return format_response(
            data=SchemeService.get_scheme_details(scheme_id),
            message="Scheme activated",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Activate scheme error: {str(e)}")
        return format_response(
            error="Activation failed",
            status_code=500
        )


@scheme_bp.route("/<int:scheme_id>/deactivate", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Scheme", "deactivate")
def deactivate_scheme(scheme_id):
    """Deactivate scheme"""
    try:
        admin_id = get_jwt_identity()
        
        success, scheme, error = SchemeService.disable_scheme(scheme_id)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} deactivated scheme {scheme_id}")
        
        return format_response(
            data=SchemeService.get_scheme_details(scheme_id),
            message="Scheme deactivated",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Deactivate scheme error: {str(e)}")
        return format_response(
            error="Deactivation failed",
            status_code=500
        )
