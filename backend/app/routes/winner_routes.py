"""
Winner Management Routes
"""

from flask import Blueprint, request, send_file
from flask_jwt_extended import get_jwt_identity
from app.utils import AdminAuthDecorator, format_response, log_admin_action
from app.services import WinnerService
import logging
import io

logger = logging.getLogger(__name__)

winner_bp = Blueprint("winner", __name__, url_prefix="/api/winners")


@winner_bp.route("/select-random", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Winner", "select_random")
def select_random_winners():
    """Randomly select winners"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        scheme_id = data.get("scheme_id")
        count = data.get("count", 1)
        
        if not scheme_id:
            return format_response(
                error="Scheme ID required",
                status_code=400
            )
        
        try:
            count = int(count)
            if count <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return format_response(
                error="Count must be a positive integer",
                status_code=400
            )
        
        # Select winners
        success, winners, error = WinnerService.select_random_winners(scheme_id, count, admin_id)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} selected {count} random winners for scheme {scheme_id}")
        
        return format_response(
            data={
                "winners_selected": len(winners),
                "winners": winners
            },
            message=f"Successfully selected {count} winners",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Select random winners error: {str(e)}")
        return format_response(
            error="Selection failed",
            status_code=500
        )


@winner_bp.route("/mark-winner", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Winner", "mark_winner")
def mark_winner():
    """Manually mark submission as winner"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        submission_id = data.get("submission_id")
        scheme_id = data.get("scheme_id")
        
        if not all([submission_id, scheme_id]):
            return format_response(
                error="submission_id and scheme_id required",
                status_code=400
            )
        
        # Mark as winner
        success, error = WinnerService.manually_mark_winner(submission_id, scheme_id, admin_id)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} marked submission {submission_id} as winner")
        
        return format_response(
            data=WinnerService.get_winner_details(submission_id),
            message="Winner marked successfully",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Mark winner error: {str(e)}")
        return format_response(
            error="Failed to mark winner",
            status_code=500
        )


@winner_bp.route("", methods=["GET"])
@AdminAuthDecorator.admin_required
def list_winners():
    """List all winners"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 50, type=int)
        scheme_id = request.args.get("scheme_id", type=int)
        announced_only = request.args.get("announced_only", False, type=bool)
        
        result = WinnerService.list_winners(scheme_id, announced_only, page, per_page)
        
        return format_response(
            data=result,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"List winners error: {str(e)}")
        return format_response(
            error="Failed to fetch winners",
            status_code=500
        )


@winner_bp.route("/<int:submission_id>", methods=["GET"])
def get_winner(submission_id):
    """Get winner details"""
    try:
        winner_data = WinnerService.get_winner_details(submission_id)
        
        if not winner_data:
            return format_response(
                error="Winner not found",
                status_code=404
            )
        
        return format_response(
            data=winner_data,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get winner error: {str(e)}")
        return format_response(
            error="Failed to fetch winner",
            status_code=500
        )


@winner_bp.route("/<int:submission_id>/announce", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Winner", "announce")
def announce_winner(submission_id):
    """Announce a winner"""
    try:
        admin_id = get_jwt_identity()
        
        success, error = WinnerService.announce_winner(submission_id)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} announced winner {submission_id}")
        
        return format_response(
            data=WinnerService.get_winner_details(submission_id),
            message="Winner announced",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Announce winner error: {str(e)}")
        return format_response(
            error="Announcement failed",
            status_code=500
        )


@winner_bp.route("/announce-bulk", methods=["POST"])
@AdminAuthDecorator.admin_required
@log_admin_action("Winner", "announce_bulk")
def announce_bulk():
    """Announce multiple winners"""
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        submission_ids = data.get("submission_ids", [])
        
        if not submission_ids or not isinstance(submission_ids, list):
            return format_response(
                error="submission_ids array required",
                status_code=400
            )
        
        if len(submission_ids) > 1000:
            return format_response(
                error="Maximum 1000 winners at a time",
                status_code=400
            )
        
        # Announce
        success, error = WinnerService.bulk_announce_winners(submission_ids)
        
        if not success:
            return format_response(
                error=error,
                status_code=400
            )
        
        logger.info(f"Admin {admin_id} announced {len(submission_ids)} winners")
        
        return format_response(
            data={"announced_count": len(submission_ids)},
            message=f"Successfully announced {len(submission_ids)} winners",
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Bulk announce error: {str(e)}")
        return format_response(
            error="Bulk announcement failed",
            status_code=500
        )


@winner_bp.route("/export", methods=["GET"])
@AdminAuthDecorator.admin_required
@log_admin_action("Winner", "export")
def export_winners():
    """Export winners to CSV"""
    try:
        import csv
        from datetime import datetime
        from app.models import db, Submission, WinnerSelection
        
        scheme_id = request.args.get("scheme_id", type=int)
        announced_only = request.args.get("announced_only", False, type=bool)
        
        # Query winners
        query = db.session.query(Submission).filter_by(is_winner=True)
        
        if scheme_id:
            query = query.filter(Submission.qr_code.has(scheme_id=scheme_id))
        
        if announced_only:
            query = query.filter_by(winner_announced=True)
        
        winners = query.all()
        
        # Create CSV
        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)
        
        # Header
        writer.writerow([
            "Submission ID", "Name", "Phone", "City", "State",
            "QR Code", "Selected Method", "Selected Date", "Announced", "Announcement Date"
        ])
        
        # Data
        for submission in winners:
            winner_record = WinnerSelection.query.filter_by(submission_id=submission.id).first()
            
            writer.writerow([
                submission.id,
                submission.name,
                submission.phone,
                submission.city,
                submission.state or "",
                submission.qr_code.unique_code if submission.qr_code else "",
                winner_record.selection_method if winner_record else "",
                winner_record.created_at.isoformat() if winner_record else "",
                "Yes" if submission.winner_announced else "No",
                winner_record.announcement_date.isoformat() if winner_record and winner_record.announcement_date else ""
            ])
        
        csv_bytes = csv_buffer.getvalue().encode()
        
        return send_file(
            io.BytesIO(csv_bytes),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f"winners_{datetime.utcnow().strftime('%Y%m%d')}.csv"
        )
        
    except Exception as e:
        logger.error(f"Export winners error: {str(e)}")
        return format_response(
            error="Export failed",
            status_code=500
        )


@winner_bp.route("/statistics", methods=["GET"])
@AdminAuthDecorator.admin_required
def get_statistics():
    """Get winner statistics"""
    try:
        scheme_id = request.args.get("scheme_id", type=int)
        
        stats = WinnerService.get_winner_statistics(scheme_id)
        
        return format_response(
            data=stats,
            status_code=200
        )
        
    except Exception as e:
        logger.error(f"Get statistics error: {str(e)}")
        return format_response(
            error="Failed to fetch statistics",
            status_code=500
        )
