# FMCG Reward Campaign Backend

Scalable backend system for managing QR code-based reward campaigns for FMCG products.

## Features

- **Admin Portal**: Secure authentication with JWT tokens
- **QR Code Generation**: Generate unlimited unique QR codes efficiently
- **Batch Management**: Organize QR codes into batches
- **Scheme Management**: Create and manage marketing campaigns
- **Submission Handling**: Process user submissions from QR scans
- **Winner Selection**: Automated and manual winner selection
- **Analytics & Reporting**: Dashboard with detailed statistics
- **Export Functionality**: Export QR codes and submissions
- **Scalability**: Handle lakhs of records efficiently
- **Security**: Input validation, rate limiting, duplicate prevention

## Architecture

```
backend/
├── app/
│   ├── models/          # SQLAlchemy ORM models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Helpers and utilities
│   ├── middleware/      # Custom middleware
│   ├── __init__.py      # Flask app factory
│   └── config.py        # Configuration management
├── migrations/          # Database migrations
├── tests/               # Test suite
├── requirements.txt     # Python dependencies
├── .env.example         # Environment configuration template
├── run.py              # Development server
└── wsgi.py             # Production server entry point
```

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Redis 6+ (for caching and rate limiting)
- pip or conda

## Setup Instructions

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Important: Generate strong SECRET_KEY and JWT_SECRET_KEY values
```

Example for development:

```env
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/fmcg_rewards
SECRET_KEY=generate-strong-key-here
JWT_SECRET_KEY=generate-strong-jwt-key-here
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:5173
```

### 3. Setup PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE fmcg_rewards;
CREATE USER fmcg_user WITH PASSWORD 'fmcg_password';
GRANT ALL PRIVILEGES ON DATABASE fmcg_rewards TO fmcg_user;

# Exit psql
\q
```

### 4. Initialize Database

```bash
# Run the development server (creates tables automatically)
python run.py

# Or initialize manually via Python
python -c "from app import create_app; app = create_app(); app.app_context().push(); from app.models import db; db.create_all()"
```

### 5. Create Initial Admin User

```bash
python -c "
from app import create_app
from app.services import AdminService

app = create_app()
with app.app_context():
    success, admin, error = AdminService.create_admin(
        'admin',
        'admin@example.com',
        'SecurePassword123!'
    )
    if success:
        print(f'Admin created: {admin.username}')
    else:
        print(f'Error: {error}')
"
```

## Running the Application

### Development

```bash
python run.py
```

Server starts at `http://localhost:5000`

### Production (with Gunicorn)

```bash
gunicorn wsgi:app --workers 4 --bind 0.0.0.0:8000
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Admin login (returns JWT token)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change admin password
- `GET /api/auth/profile` - Get admin profile

### QR Codes (`/api/qr`)

- `GET /api/qr/validate/<qr_code>` - Validate QR code
- `POST /api/qr/submit` - Submit user form
- `POST /api/qr/check-duplicate` - Check duplicate submissions
- `GET /api/qr/get-reward/<qr_code>` - Get reward details

### Admin (`/api/admin`)

- `GET /api/admin/dashboard` - Get dashboard stats
- `POST /api/admin/batch/create` - Create QR batch
- `GET /api/admin/batch/<id>` - Get batch details
- `GET /api/admin/batches` - List all batches
- `GET /api/admin/batch/<id>/export` - Export QR codes as ZIP
- `DELETE /api/admin/batch/<id>` - Delete batch
- `GET /api/admin/submissions` - List submissions
- `GET /api/admin/submissions/export` - Export submissions as CSV
- `GET /api/admin/admins` - List admin users (super admin only)

### Schemes (`/api/schemes`)

- `POST /api/schemes` - Create scheme
- `GET /api/schemes` - List schemes
- `GET /api/schemes/<id>` - Get scheme details
- `PUT /api/schemes/<id>` - Update scheme
- `POST /api/schemes/<id>/activate` - Activate scheme
- `POST /api/schemes/<id>/deactivate` - Deactivate scheme

### Winners (`/api/winners`)

- `POST /api/winners/select-random` - Random winner selection
- `POST /api/winners/mark-winner` - Manually mark winner
- `GET /api/winners` - List winners
- `GET /api/winners/<id>` - Get winner details
- `POST /api/winners/<id>/announce` - Announce winner
- `POST /api/winners/announce-bulk` - Announce multiple winners
- `GET /api/winners/export` - Export winners as CSV
- `GET /api/winners/statistics` - Get winner statistics

## Database Schema

### qr_codes
- id, unique_code, batch_id, scheme_id, is_used, used_at, used_by_submission_id, created_at

### submissions
- id, name, phone, city, state, qr_code_id, purchase_details, ip_address, user_agent, is_winner, winner_announced, submitted_at

### schemes
- id, title, description, reward_details, reward_text, start_date, end_date, is_active, created_at, updated_at

### qr_batches
- id, batch_name, batch_code, quantity, used_count, created_by, created_at, updated_at

### admins
- id, username, email, password_hash, role, is_active, last_login, created_at, updated_at

### winner_selections
- id, submission_id, scheme_id, selection_method, selected_by, announcement_date, prize_distribution_date, created_at

### duplicate_submission_checks
- id, phone_number, qr_code_id, attempt_count, last_attempt_at, is_blocked, block_reason, created_at

### audit_logs
- id, admin_id, action, resource_type, resource_id, details, ip_address, created_at

## Integration with Frontend

### QR Submission Flow

1. User scans QR code, gets redirected to: `http://localhost:5173/r/<qr_code>`
2. Frontend makes GET request to `/api/qr/validate/<qr_code>`
3. If valid, show submission form
4. User fills form and submits to `POST /api/qr/submit`
5. Backend validates and creates submission
6. Frontend shows success message with reward details

### Admin Portal Flow

1. Admin logs in via `/api/auth/login`
2. Receives JWT access token
3. Uses token in Authorization header: `Authorization: Bearer <token>`
4. Can access admin endpoints

## Environment-Specific Configuration

### Development
```env
FLASK_ENV=development
FLASK_DEBUG=True
```

### Testing
```env
FLASK_ENV=testing
DATABASE_URL=sqlite:///:memory:
```

### Production
```env
FLASK_ENV=production
FLASK_DEBUG=False
# Ensure SECRET_KEY and JWT_SECRET_KEY are set
```

## Performance Optimization

### Database Indexing
- QR code lookups indexed on `unique_code`
- Submission queries indexed on `phone`, `city`, `qr_code_id`
- Batch operations indexed on `batch_id`

### Batch Processing
- QR generation handles large quantities in batches
- Export operations stream data to avoid memory overload
- Pagination on all list endpoints

### Caching
- Redis integration for rate limiting
- Can add caching layer for frequently accessed data

## Security Features

1. **Authentication**: JWT-based admin authentication
2. **Password Security**: PBKDF2 hashing, strength validation
3. **Input Validation**: All inputs sanitized and validated
4. **Rate Limiting**: Configurable limits on public endpoints
5. **Duplicate Prevention**: Tracks duplicate submission attempts
6. **QR Replay Prevention**: One-time use codes, marked after submission
7. **CSRF Protection**: Built-in via Flask
8. **Audit Logging**: All admin actions tracked
9. **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Test connection:
psql "postgresql://user:password@localhost:5432/fmcg_rewards"
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping  # Should return PONG
```

### Import Errors
```bash
# Ensure you're in the virtual environment
# Reinstall dependencies
pip install -r requirements.txt
```

## Deployment

### Docker
```bash
docker build -t fmcg-backend .
docker run -p 5000:5000 --env-file .env fmcg-backend
```

### Heroku
```bash
# Add Procfile with: web: gunicorn wsgi:app
# Push to Heroku
git push heroku main
```

### AWS/DigitalOcean
- Use Gunicorn with systemd service
- Configure Nginx as reverse proxy
- Use managed PostgreSQL and Redis services

## Monitoring & Logging

Logs are written to `app.log` with format:
```
2024-01-15 10:30:45,123 - app - INFO - Message
```

Configure log level in `.env`:
```env
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

## Support & Maintenance

- Review audit logs regularly: `AuditLog` table
- Monitor database performance and indices
- Archive old submission data for reporting
- Update dependencies regularly

## License

All rights reserved.
