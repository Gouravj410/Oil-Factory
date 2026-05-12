# Quick Start Guide - FMCG Backend

## For Windows Users

### 1. Prerequisites Installation

```powershell
# Install Python 3.10+
# Download from https://www.python.org/downloads/

# Install PostgreSQL
# Download from https://www.postgresql.org/download/windows/

# Install Redis
# Download from https://github.com/microsoftarchive/redis/releases
# Or use: choco install redis-64 (if using Chocolatey)
```

### 2. Setup (5 minutes)

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
Copy-Item .env.example .env

# Edit .env and update:
# - DATABASE_URL
# - JWT_SECRET_KEY
# - SECRET_KEY
```

### 3. Database Setup

```powershell
# Start PostgreSQL service
# Then create database:

psql -U postgres -c "CREATE DATABASE fmcg_rewards;"
psql -U postgres -c "CREATE USER fmcg_user WITH PASSWORD 'fmcg_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fmcg_rewards TO fmcg_user;"
```

### 4. Run Development Server

```powershell
# Make sure virtual environment is active
# (if not: venv\Scripts\activate)

python run.py

# Server starts at http://localhost:5000
```

### 5. Create Admin User

```powershell
# In another terminal (activate venv first)

python -c "
from app import create_app
from app.services import AdminService

app = create_app()
with app.app_context():
    success, admin, error = AdminService.create_admin('admin', 'admin@example.com', 'Test@1234')
    print('Admin created!' if success else f'Error: {error}')
"
```

### 6. Test the API

```powershell
# Login (use Postman or curl)
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"admin\", \"password\": \"Test@1234\"}"

# Should return access_token
```

---

## Key Files to Know

```
backend/
├── run.py                 # Start here! Run: python run.py
├── app/__init__.py        # Flask app factory
├── app/models/           # Database models
│   └── __init__.py       # All ORM models
├── app/services/         # Business logic
│   ├── admin_service.py
│   ├── batch_service.py
│   ├── submission_service.py
│   ├── scheme_service.py
│   └── winner_service.py
├── app/routes/           # API endpoints
│   ├── auth_routes.py
│   ├── qr_routes.py
│   ├── admin_routes.py
│   ├── scheme_routes.py
│   └── winner_routes.py
├── app/utils/            # Helpers
│   ├── auth.py           # Security utils
│   ├── qr_utils.py       # QR generation
│   └── helpers.py        # Common helpers
└── .env.example          # Environment config
```

---

## Common Tasks

### Generate QR Batch

```bash
curl -X POST http://localhost:5000/api/admin/batch/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "batch_name": "Spring Campaign",
    "quantity": 1000,
    "scheme_id": 1
  }'
```

### Get Dashboard Stats

```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <token>"
```

### Submit User Form

```bash
curl -X POST http://localhost:5000/api/qr/submit \
  -H "Content-Type: application/json" \
  -d '{
    "qr_code": "QR123ABC",
    "name": "John Doe",
    "phone": "9876543210",
    "city": "Mumbai"
  }'
```

### Select Winners

```bash
curl -X POST http://localhost:5000/api/winners/select-random \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scheme_id": 1,
    "count": 10
  }'
```

---

## Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use different port in .env:
# FLASK_PORT=5001
```

### Database Connection Error
```powershell
# Check PostgreSQL is running
net start postgresql-x64-15

# Test connection
psql -U fmcg_user -d fmcg_rewards -h localhost

# If fails, verify DATABASE_URL in .env
```

### Module Not Found
```powershell
# Make sure virtual environment is active
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Permission Denied
```powershell
# Delete generated files and retry
rm -r app/__pycache__
rm -r .pytest_cache
python run.py
```

---

## Important Notes

### Never in Production
```python
FLASK_DEBUG = True  # ❌ Never set to True
FLASK_ENV = 'development'  # ❌ Set to 'production'
SECRET_KEY = 'dev-key'  # ❌ Generate strong random key
```

### Database Backups
```powershell
# Regular backups
pg_dump -U fmcg_user fmcg_rewards > backup.sql

# Restore
psql -U fmcg_user fmcg_rewards < backup.sql
```

### Log Files
```powershell
# Check logs
cat app.log

# Clear logs
echo $null > app.log
```

---

## Next Steps

1. ✅ Run backend server
2. 📱 Update frontend to call backend APIs
3. 🔐 Test authentication flow
4. 📊 Create schemes and batches
5. 🎯 Test QR submission
6. 🏆 Test winner selection
7. 📈 Monitor performance
8. 🚀 Deploy to production

---

## Support

- Check `README.md` for detailed documentation
- Check `ARCHITECTURE.md` for system design
- Review API endpoints in route files
- Check service classes for business logic
- Use audit logs to debug issues

Good luck! 🚀
