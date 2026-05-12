"""
Admin Dashboard and Batch Management Routes
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import AdminAuthDecorator, format_response, paginate_query, DateRangeFilter, log_admin_action
from app.services import QRBatchService, SchemeService, SubmissionService, WinnerService
from app.models import db, Admin, QRCode, Submission
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/dashboard", methods=["GET"])
@AdminAuthDecorator.admin_required
def get_dashboard():
    """Get admin dashboard statistics"""
    try:
        # Get stats
        total_qr_codes = QRCode.query.count()
        used_qr_codes = QRCode.query.filter_by(is_used=True).count()
        
        submission_stats = SubmissionService.get_submission_stats()
        
        from app.models import Scheme, QRBatch
        total_schemes = Scheme.query.count()
        active_schemes = Scheme.query.filter_by(is_active=True).count()
        total_batches = QRBatch.query.count()
        
        # Winner stats
        winner_stats = WinnerService.get_winner_statistics()
        
        return format_response(
            data={
                "qr_codes": {
                    "total": total_qr_codes,
                    "used": used_qr_codes,
                    "remaining": total_qr_codes - used_qr_codes,
                    "usage_percentage": (used_qr_codes / total_qr_codes * 100) if total_qr_codes > 0 else 0
                },
                "submissions": submission_stats,
                "schemes": {
                    "total": total_schemes,
                    "active": active_schemes,
                    "inactive": total_schemes - active_schemes
                },
                "batches": {
                    "total": total_batches
                },
                "winners": winner_stats
            },
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        return format_response(
            error="Failed to fetch dashboard",
            status_code=500
        )


@admin_bp.route("/batch/create", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("QRBatch", "create")
def create_batch():
    """Create new QR batch"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        batch_name = data.get("batch_name", "").strip()
        quantity = data.get("quantity")
        scheme_id = data.get("scheme_id")
        
        if not all([batch_name, quantity, scheme_id]):
            return format_response(
                error="Missing required fields",
                status_code=400
            )
        
        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return format_response(
                error="Quantity must be an integer",
                status_code=400
            )
        
        # Create batch
        success, batch, error = QRBatchService.create_batch(
            batch_name=batch_name,
            quantity=quantity,
            scheme_id=scheme_id,
            admin_id=admin_id
        )
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} created batch {batch.id}")
        
        return format_response(
            data={
                "batch_id": batch.id,
                "batch_name": batch.batch_name,
                "quantity": batch.quantity,
                "status": "Generating QR codes..."
            },
            message="Batch created successfully",
            status_code=201
        )
        
    except Exception as e:
        logger.error(f"Batch creation error: {str(e)}")
        return format_response(
            error="Batch creation failed",
            status_code=500
        )


@admin_bp.route("/batch/<int:batch_id>", methods=["GET"])
@AdminAuthDecorator.admin_required
def get_batch(batch_id):
    """Get batch details"""
    try:
        batch_data = QRBatchService.get_batch_by_id(batch_id)
        
        if not batch_data:
            return format_response(
                error="Batch not found",
                status_code=404
            )
        
        return format_response(
            data=batch_data,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get batch error: {str(e)}")
        return format_response(
            error="Failed to fetch batch",
            status_code=500
        )


@admin_bp.route("/batches", methods=["GET"])
@AdminAuthDecorator.admin_required
def list_batches():
    """List all batches"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        scheme_id = request.args.get("scheme_id", None, type=int)
        
        result = QRBatchService.list_batches(page, per_page, scheme_id)
        
        return format_response(
            data=result,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"List batches error: {str(e)}")
        return format_response(
            error="Failed to fetch batches",
            status_code=500
        )


@admin_bp.route("/batch/<int:batch_id>/export", methods=["GET"])
@AdminAuthDecorator.admin_required
@log_admin_action("QRBatch", "export")
def export_batch(batch_id):
    """Export QR codes as ZIP"""
    try:
        admin_id = get_jwt_identity()
        
        from app.utils import QRExporter
        
        # Generate ZIP
        zip_data = QRExporter.export_batch_zip(batch_id)
        
        logger.info(f"Admin {admin_id} exported batch {batch_id}")
        
        return send_file(
            io.BytesIO(zip_data),
            mimetype='application/zip',
            as_attachment=True,
            download_name=f"qr_batch_{batch_id}.zip"
        )
        
    except Exception as e:
        logger.error(f"Export batch error: {str(e)}")
        return format_response(
            error="Export failed",
            status_code=500
        )


@admin_bp.route("/batch/<int:batch_id>", methods=["DELETE"])
@AdminAuthDecorator.admin_required
@log_admin_action("QRBatch", "delete")
def delete_batch(batch_id):
    """Delete batch"""
    try:
        admin_id = get_jwt_identity()
        
        success, error = QRBatchService.delete_batch(batch_id)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} deleted batch {batch_id}")
        
        return format_response(
            message="Batch deleted successfully",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Delete batch error: {str(e)}")
        return format_response(
            error="Deletion failed",
            status_code=500
        )


@admin_bp.route("/submissions", methods=["GET"])
@AdminAuthDecorator.admin_required
def get_submissions():
    """Get all submissions with filters"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        city = request.args.get("city")
        batch_id = request.args.get("batch_id", type=int)
        period = request.args.get("period")  # today, week, month, year
        
        # Get date range
        start_date = None
        end_date = None
        
        if period:
            start_date, end_date = DateRangeFilter.get_date_range(period)
        
        result = SubmissionService.list_submissions(
            page=page,
            per_page=per_page,
            city=city,
            batch_id=batch_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return format_response(
            data=result,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get submissions error: {str(e)}")
        return format_response(
            error="Failed to fetch submissions",
            status_code=500
        )


@admin_bp.route("/submissions/export", methods=["GET"])
@AdminAuthDecorator.admin_required
@log_admin_action("Submission", "export")
def export_submissions():
    """Export submissions to CSV"""
    try:
        import io
        from app.utils import QRExporter
        
        batch_id = request.args.get("batch_id", type=int)
        period = request.args.get("period")
        
        # Get date range
        start_date = None
        end_date = None
        
        if period:
            start_date, end_date = DateRangeFilter.get_date_range(period)
        
        # Export CSV
        csv_data = QRExporter.export_submissions_csv(batch_id, start_date, end_date)
        
        return send_file(
            io.BytesIO(csv_data),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"submissions_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        )
        
    except Exception as e:
        logger.error(f"Export submissions error: {str(e)}")
        return format_response(
            error="Export failed",
            status_code=500
        )


@admin_bp.route("/admins", methods=["GET"])
@AdminAuthDecorator.super_admin_required
def list_admins():
    """List all admins (super admin only)"""
    try:
        from app.services import AdminService
        
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        
        result = AdminService.list_admins(page, per_page)
        
        return format_response(
            data=result,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"List admins error: {str(e)}")
        return format_response(
            error="Failed to fetch admins",
            status_code=500
        )
