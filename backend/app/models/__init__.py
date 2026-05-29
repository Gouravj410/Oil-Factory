"""
Database Models
SQLAlchemy ORM models for the FMCG Reward Campaign system
"""

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# Optimize SQLite connection parameters when using local SQLite fallback
from sqlalchemy.engine import Engine
from sqlalchemy import event

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()
    except Exception:
        # Gracefully ignore for PostgreSQL or other database engines
        pass


class Admin(db.Model):
    """Admin user model"""
    __tablename__ = "admins"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="admin")  # admin, super_admin
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    generated_batches = db.relationship("QRBatch", backref="created_by_admin", lazy="dynamic")
    
    __table_args__ = (
        db.Index("idx_admin_username_email", "username", "email"),
    )


class QRBatch(db.Model):
    """QR code batch model"""
    __tablename__ = "qr_batches"
    
    id = db.Column(db.Integer, primary_key=True)
    batch_name = db.Column(db.String(255), nullable=False, index=True)
    batch_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    quantity = db.Column(db.Integer, nullable=False)
    used_count = db.Column(db.Integer, default=0)
    scheme_id = db.Column(db.Integer, db.ForeignKey("schemes.id"), nullable=True, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey("admins.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    qr_codes = db.relationship("QRCode", backref="batch", lazy="dynamic", cascade="all, delete-orphan")
    scheme   = db.relationship("Scheme", foreign_keys=[scheme_id])

    __table_args__ = (
        db.Index("idx_batch_name_date", "batch_name", "created_at"),
    )


class Scheme(db.Model):
    """Marketing scheme model"""
    __tablename__ = "schemes"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.Text)
    reward_details = db.Column(db.Text, nullable=False)
    reward_text = db.Column(db.String(500), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False, index=True)
    end_date = db.Column(db.DateTime, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    qr_codes = db.relationship("QRCode", backref="scheme", lazy="dynamic")
    
    __table_args__ = (
        db.Index("idx_scheme_active_date", "is_active", "created_at"),
    )


class QRCode(db.Model):
    """QR code model - stores unique codes and usage status"""
    __tablename__ = "qr_codes"
    
    id = db.Column(db.Integer, primary_key=True)
    unique_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    batch_id = db.Column(db.Integer, db.ForeignKey("qr_batches.id"), nullable=False, index=True)
    scheme_id = db.Column(db.Integer, db.ForeignKey("schemes.id"), nullable=False, index=True)
    is_used = db.Column(db.Boolean, default=False, index=True)
    used_at = db.Column(db.DateTime, index=True)
    used_by_submission_id = db.Column(db.Integer, db.ForeignKey("submissions.id"), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    submission = db.relationship("Submission", uselist=False, foreign_keys=[used_by_submission_id])
    
    __table_args__ = (
        db.Index("idx_qr_unique_code_batch", "unique_code", "batch_id"),
        db.Index("idx_qr_used_batch_scheme", "is_used", "batch_id", "scheme_id"),
        db.Index("idx_qr_batch_scheme", "batch_id", "scheme_id"),
    )


class Submission(db.Model):
    """User submission model"""
    __tablename__ = "submissions"
    
    id = db.Column(db.Integer, primary_key=True)
    qr_code_id = db.Column(db.Integer, db.ForeignKey("qr_codes.id"), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False, index=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100))
    purchase_details = db.Column(db.JSON)  # Store optional purchase info
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    is_winner = db.Column(db.Boolean, default=False, index=True)
    winner_announced = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    qr_code = db.relationship("QRCode", foreign_keys=[qr_code_id])
    
    __table_args__ = (
        db.Index("idx_submission_phone_city_date", "phone", "city", "submitted_at"),
        db.Index("idx_submission_qr_code", "qr_code_id"),
        db.Index("idx_submission_is_winner", "is_winner"),
        db.UniqueConstraint("qr_code_id", name="uq_submission_qr_code"),  # One submission per QR
    )


class WinnerSelection(db.Model):
    """Winner selection record for audit trail"""
    __tablename__ = "winner_selections"
    
    id = db.Column(db.Integer, primary_key=True)
    submission_id = db.Column(db.Integer, db.ForeignKey("submissions.id"), nullable=False, index=True)
    scheme_id = db.Column(db.Integer, db.ForeignKey("schemes.id"), nullable=False)
    selection_method = db.Column(db.String(50), nullable=False)  # random, manual
    selected_by = db.Column(db.Integer, db.ForeignKey("admins.id"))
    announcement_date = db.Column(db.DateTime)
    prize_distribution_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    submission = db.relationship("Submission", foreign_keys=[submission_id])
    admin = db.relationship("Admin", foreign_keys=[selected_by])
    scheme = db.relationship("Scheme", foreign_keys=[scheme_id])
    
    __table_args__ = (
        db.Index("idx_winner_scheme_date", "scheme_id", "created_at"),
    )


class AuditLog(db.Model):
    """Audit log for tracking all admin actions"""
    __tablename__ = "audit_logs"
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey("admins.id"))
    action = db.Column(db.String(255), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # QRBatch, Scheme, etc.
    resource_id = db.Column(db.Integer)
    details = db.Column(db.JSON)
    ip_address = db.Column(db.String(45))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    admin = db.relationship("Admin", foreign_keys=[admin_id])
    
    __table_args__ = (
        db.Index("idx_audit_admin_date", "admin_id", "created_at"),
    )


class DuplicateSubmissionCheck(db.Model):
    """Track duplicate submission attempts"""
    __tablename__ = "duplicate_submission_checks"
    
    id = db.Column(db.Integer, primary_key=True)
    phone_number = db.Column(db.String(20), nullable=False, index=True)
    qr_code_id = db.Column(db.Integer, db.ForeignKey("qr_codes.id"))
    attempt_count = db.Column(db.Integer, default=1)
    last_attempt_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    is_blocked = db.Column(db.Boolean, default=False)
    block_reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.Index("idx_duplicate_phone_date", "phone_number", "last_attempt_at"),
    )
