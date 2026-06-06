from flask import Blueprint, request, jsonify
from app.models import ContactMessage, db
from app.utils import AdminAuthDecorator

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/api/contact/submit', methods=['POST'])
def submit_contact():
    data = request.json
    
    # Basic validation
    required_fields = ['name', 'email', 'phone', 'message']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                'success': False,
                'message': f"Field '{field}' is required"
            }), 400
            
    try:
        new_contact = ContactMessage(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            state=data.get('state'),
            city=data.get('city'),
            message=data['message']
        )
        db.session.add(new_contact)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Message sent successfully'
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@contact_bp.route('/api/admin/contacts', methods=['GET'])
@AdminAuthDecorator.admin_required
def get_contacts():
    try:
        contacts = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
        result = []
        for c in contacts:
            result.append({
                'id': c.id,
                'name': c.name,
                'email': c.email,
                'phone': c.phone,
                'state': c.state,
                'city': c.city,
                'message': c.message,
                'is_read': c.is_read,
                'created_at': c.created_at.isoformat()
            })
            
        return jsonify({
            'success': True,
            'data': result
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@contact_bp.route('/api/admin/contacts/<int:contact_id>/read', methods=['PUT'])
@AdminAuthDecorator.admin_required
def mark_read(contact_id):
    try:
        contact = ContactMessage.query.get(contact_id)
        if not contact:
            return jsonify({'success': False, 'message': 'Contact message not found'}), 404
            
        contact.is_read = True
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Marked as read'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500
