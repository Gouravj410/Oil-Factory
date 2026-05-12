# FMCG Reward Campaign System - Architecture & Integration Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Design](#architecture-design)
3. [Data Flow](#data-flow)
4. [Frontend Integration](#frontend-integration)
5. [API Reference](#api-reference)
6. [Scalability Considerations](#scalability-considerations)
7. [Security Implementation](#security-implementation)
8. [Deployment Guide](#deployment-guide)

---

## System Overview

The FMCG Reward Campaign System is a **two-tier application**:

### Frontend (React)
- User-facing interface for QR scanning and form submission
- Admin dashboard for campaign management
- Built with React, Vite, Framer Motion

### Backend (Python/Flask)
- RESTful APIs for all operations
- PostgreSQL database for data persistence
- JWT authentication for admin access
- Microservices architecture with clean separation of concerns

---

## Architecture Design

### 1. **Service Layer Architecture**

Each major feature has its own service class:

```
Services/
├── AdminService          # Admin user management
├── QRBatchService        # QR code batch operations
├── SchemeService         # Campaign scheme management
├── SubmissionService     # User submissions handling
└── WinnerService         # Winner selection & management
```

**Benefits:**
- Testable business logic
- Reusable across endpoints
- Clean separation of concerns
- Easy to maintain and extend

### 2. **API Layer Architecture**

RESTful endpoints organized by feature:

```
Routes/
├── auth_routes.py        # Authentication & profile
├── qr_routes.py          # QR validation & submissions
├── admin_routes.py       # Dashboard & batch management
├── scheme_routes.py      # Campaign management
└── winner_routes.py      # Winner selection
```

### 3. **Database Design**

**Fully normalized schema with proper indexing:**

```
qr_codes
├── PK: id
├── FK: batch_id → qr_batches
├── FK: scheme_id → schemes
├── INDEX: unique_code (fast lookup)
└── INDEX: (is_used, batch_id, scheme_id)

submissions
├── PK: id
├── FK: qr_code_id → qr_codes  (UNIQUE - one submission per QR)
├── INDEX: (phone, city, submitted_at)
├── INDEX: is_winner
└── UNIQUE CONSTRAINT on qr_code_id

schemes
├── PK: id
├── INDEX: (is_active, created_at)
└── DATE RANGE for campaign period

qr_batches
├── PK: id
├── FK: created_by → admins
├── INDEX: (batch_name, created_at)
└── used_count (tracks usage)

admins
├── PK: id
├── UNIQUE: username, email
└── role: admin | super_admin

duplicate_submission_checks
├── PK: id
├── INDEX: phone_number
├── is_blocked (rate limiting)
└── attempt_count (tracking)

winner_selections
├── PK: id
├── FK: submission_id → submissions
├── FK: scheme_id → schemes
├── selection_method: random | manual
└── audit trail fields

audit_logs
├── PK: id
├── FK: admin_id → admins
├── resource_type, action
└── complete audit trail
```

---

## Data Flow

### 1. **QR Code Generation Flow**

```
Admin Dashboard
    ↓
POST /api/admin/batch/create
    ↓
QRBatchService.create_batch()
    ↓
Generate unique codes in batches
    ↓
Store in qr_codes table
    ↓
Return batch statistics
    ↓
Admin can export as ZIP
```

**Key Features:**
- Batch processing: 1000 codes per transaction
- Memory efficient: No QR images stored (generated on-demand)
- Collision-free: Hash-based deterministic generation

### 2. **User Submission Flow**

```
User Scans QR
    ↓
Browser: GET /r/{qr_code}
    ↓
Frontend: validate QR
GET /api/qr/validate/{qr_code}
    ↓
Check: QR exists, not used, scheme active
    ↓
Show submission form with reward info
    ↓
User submits form
    ↓
POST /api/qr/submit
    ├─ Validate all inputs
    ├─ Check for duplicate submissions
    ├─ Create submission record
    ├─ Mark QR as used
    └─ Update batch usage count
    ↓
Return success message + reward details
```

### 3. **Winner Selection Flow**

```
Admin Dashboard → Winners Section
    ↓
Option 1: Random Selection
    POST /api/winners/select-random
    ├─ Query eligible submissions
    ├─ Random sample
    ├─ Create WinnerSelection records
    └─ Return selected winners

Option 2: Manual Selection
    POST /api/winners/mark-winner
    ├─ Validate submission
    ├─ Mark as winner
    └─ Create audit record

    ↓
Announce Winners
    POST /api/winners/{id}/announce
    ├─ Update winner_announced flag
    ├─ Set announcement_date
    └─ Log action
    ↓
Export Winner List
    GET /api/winners/export
    ├─ Generate CSV
    └─ Stream to client
```

---

## Frontend Integration

### 1. **Environment Configuration**

Create `.env.local` in frontend directory:

```env
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
```

### 2. **API Client Setup**

Create `src/api/client.js`:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
client.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
```

### 3. **QR Submission Integration**

In the existing form component:

```javascript
import { useParams } from 'react-router-dom';
import client from '@/api/client';

export function QRSubmissionForm() {
  const { qrCode } = useParams();
  const [formData, setFormData] = useState({ name: '', phone: '', city: '' });
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate QR on mount
  useEffect(() => {
    const validateQR = async () => {
      const response = await client.get(`/qr/validate/${qrCode}`);
      setScheme(response.data.data);
      setLoading(false);
    };
    validateQR();
  }, [qrCode]);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await client.post('/qr/submit', {
      qr_code: qrCode,
      ...formData
    });
    // Show success message with reward
    showRewardMessage(response.data.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        placeholder="Name" 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input 
        placeholder="Phone" 
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      <input 
        placeholder="City" 
        value={formData.city}
        onChange={(e) => setFormData({...formData, city: e.target.value})}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 4. **Admin Portal Integration**

Create admin routes in React Router:

```javascript
// src/routes/admin.jsx
import AdminDashboard from '@/pages/admin/Dashboard';
import BatchGenerator from '@/pages/admin/BatchGenerator';
import SchemeManager from '@/pages/admin/SchemeManager';
import SubmissionList from '@/pages/admin/SubmissionList';
import WinnerManager from '@/pages/admin/WinnerManager';

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />
  },
  {
    path: '/admin/batches',
    element: <BatchGenerator />
  },
  {
    path: '/admin/schemes',
    element: <SchemeManager />
  },
  {
    path: '/admin/submissions',
    element: <SubmissionList />
  },
  {
    path: '/admin/winners',
    element: <WinnerManager />
  }
];
```

### 5. **Authentication Handling**

```javascript
// src/hooks/useAuth.js
import { useState, useCallback } from 'react';
import client from '@/api/client';

export function useAuth() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    const response = await client.post('/auth/login', { username, password });
    localStorage.setItem('access_token', response.data.data.access_token);
    localStorage.setItem('refresh_token', response.data.data.refresh_token);
    setAdmin(response.data.data);
    setLoading(false);
    return response.data.success;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAdmin(null);
  }, []);

  return { admin, login, logout, loading };
}
```

---

## API Reference

### Authentication

```bash
# Register Admin
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

```bash
# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "admin_id": 1,
    "username": "admin",
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

### QR Operations

```bash
# Validate QR Code
GET /api/qr/validate/ABC123XYZ

Response: 200 OK
{
  "success": true,
  "data": {
    "qr_code": "ABC123XYZ",
    "is_valid": true,
    "scheme_id": 1,
    "reward_text": "Win a free bottle!",
    "scheme_title": "Spring Campaign"
  }
}

Response: 400 Bad Request (if already used)
{
  "success": false,
  "error": "QR code already used"
}
```

```bash
# Submit QR
POST /api/qr/submit
{
  "qr_code": "ABC123XYZ",
  "name": "John Doe",
  "phone": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra",
  "purchase_details": {
    "product": "Premium Oil",
    "quantity": "1L"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "submission_id": 1234,
    "status": "success"
  }
}
```

### Admin Operations

```bash
# Create Batch (requires JWT token)
POST /api/admin/batch/create
Authorization: Bearer <token>
{
  "batch_name": "Spring Campaign Batch",
  "quantity": 50000,
  "scheme_id": 1
}

Response: 201 Created
{
  "success": true,
  "data": {
    "batch_id": 1,
    "batch_name": "Spring Campaign Batch",
    "quantity": 50000,
    "status": "Generating QR codes..."
  }
}
```

```bash
# Export QR Codes
GET /api/admin/batch/1/export

Response: 200 OK
Content-Type: application/zip
(Binary ZIP file with QR images)
```

```bash
# Get Dashboard
GET /api/admin/dashboard
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "qr_codes": {
      "total": 500000,
      "used": 125000,
      "remaining": 375000,
      "usage_percentage": 25
    },
    "submissions": {
      "total_submissions": 125000,
      "total_winners": 5000,
      "unique_participants": 120000,
      "unique_cities": 650
    },
    "winners": {
      "total_winners": 5000,
      "announced": 4500,
      "pending_announcement": 500
    }
  }
}
```

---

## Scalability Considerations

### 1. **Database Optimization**

**Indexing Strategy:**
```sql
-- QR code lookup (critical)
CREATE INDEX idx_qr_unique_code ON qr_codes(unique_code);
CREATE INDEX idx_qr_batch_scheme ON qr_codes(batch_id, scheme_id);
CREATE INDEX idx_qr_is_used ON qr_codes(is_used);

-- Submission queries
CREATE INDEX idx_submission_phone_city ON submissions(phone, city);
CREATE INDEX idx_submission_qr_code ON submissions(qr_code_id);
CREATE INDEX idx_submission_date ON submissions(submitted_at);

-- Winner queries
CREATE INDEX idx_winner_selection_scheme ON winner_selections(scheme_id);
CREATE INDEX idx_submission_is_winner ON submissions(is_winner);
```

**Partitioning (for multi-million records):**
```sql
-- Partition submissions by month
CREATE TABLE submissions_2024_01 PARTITION OF submissions
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 2. **Query Optimization**

**Batch Processing:**
- Generate QR codes in 1000-record chunks
- Process submissions in batches
- Stream exports without loading entire dataset

**Pagination:**
```python
# Always paginate list endpoints
@app.route("/api/submissions")
def get_submissions():
    page = request.args.get("page", 1, type=int)
    per_page = 50
    query = db.session.query(Submission)
    # ... filters ...
    paginate_query(query, page, per_page)
```

### 3. **Caching Strategy**

```python
# Cache frequently accessed data
from functools import lru_cache

@lru_cache(maxsize=128)
def get_scheme_details(scheme_id):
    return SchemeService.get_scheme_details(scheme_id)

# Invalidate on updates
SchemeService.update_scheme(scheme_id, **data)
get_scheme_details.cache_clear()
```

### 4. **Load Balancing**

For horizontal scaling:
```
Load Balancer
├── Backend Instance 1
├── Backend Instance 2
├── Backend Instance 3
└── Backend Instance 4
    ↓
PostgreSQL (Primary)
    ↓
PostgreSQL Replica (for read-heavy operations)
```

---

## Security Implementation

### 1. **Authentication Flow**

```
User Login
    ↓
POST /api/auth/login
    ↓
Verify credentials against password_hash
    ↓
Generate JWT token (expires in 1 hour)
    ↓
Return access_token + refresh_token
    ↓
Client stores in localStorage
    ↓
Include in all subsequent requests:
    Authorization: Bearer <token>
```

### 2. **Password Security**

```python
# PBKDF2 with SHA256 (werkzeug)
password_hash = generate_password_hash(password, method='pbkdf2:sha256')

# Validation
is_valid = check_password_hash(password_hash, password)

# Strength requirements:
# - Minimum 8 characters
# - Must contain uppercase, lowercase, numbers
# - Optional: Special characters
```

### 3. **Rate Limiting**

```python
from flask_limiter import Limiter

# Protect auth endpoints
@app.route("/api/auth/login")
@limiter.limit("5 per minute")  # 5 attempts per minute per IP
def login():
    pass

# Protect QR submission
@app.route("/api/qr/submit")
@limiter.limit("10 per hour")  # 10 submissions per hour per IP
def submit():
    pass
```

### 4. **Input Validation**

```python
# All inputs validated and sanitized
from app.utils import validate_phone, sanitize_input, validate_city

class SubmissionService:
    @staticmethod
    def validate_submission_data(name, phone, city):
        name = sanitize_input(name, 255)  # Trim, limit length
        
        if not validate_phone(phone):  # Check format
            return False, "Invalid phone"
        
        if not validate_city(city):  # Check format
            return False, "Invalid city"
        
        return True, None
```

### 5. **Duplicate Prevention**

```python
# Track submission attempts
class DuplicateSubmissionCheck:
    phone_number = db.Column(String(20))  # indexed
    attempt_count = int  # incremented on each attempt
    is_blocked = boolean  # block after 5 attempts
    
# Block after suspicious activity
if attempt_count > 5:
    is_blocked = True
    return "Too many attempts"
```

### 6. **QR Replay Prevention**

```python
class QRCode:
    is_used = db.Column(Boolean, default=False)  # indexed
    used_at = db.Column(DateTime)  # timestamp
    used_by_submission_id = db.Column(Integer)  # which submission
    
# One-time use with atomic operation
def submit_qr():
    # Check QR is not used
    if qr.is_used:
        return "QR already used"
    
    # Atomic update
    qr.is_used = True
    qr.used_at = datetime.utcnow()
    qr.used_by_submission_id = submission.id
    db.session.commit()
```

### 7. **Audit Logging**

```python
class AuditLog:
    admin_id = Int  # who
    action = String  # what (create, update, delete)
    resource_type = String  # resource type
    resource_id = Int  # specific resource
    details = JSON  # additional context
    ip_address = String  # from where
    created_at = DateTime  # when
    
# Automatic logging of admin actions
@log_admin_action("Scheme", "create")
def create_scheme():
    # Action automatically logged
    pass
```

---

## Deployment Guide

### 1. **Docker Deployment**

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV FLASK_APP=wsgi.py
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "wsgi:app"]
```

Build and run:
```bash
docker build -t fmcg-backend:latest .
docker run -p 5000:5000 --env-file .env fmcg-backend:latest
```

### 2. **Production Checklist**

- [ ] Set `FLASK_ENV=production`
- [ ] Generate strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Configure database replication
- [ ] Set up Redis for caching
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Set up CDN for static files
- [ ] Enable rate limiting

### 3. **Environment Variables for Production**

```env
FLASK_ENV=production
FLASK_DEBUG=False

# Secrets (generate strong random values)
SECRET_KEY=<generate-with-secrets.token_hex(32)>
JWT_SECRET_KEY=<generate-with-secrets.token_hex(32)>

# Database (use managed service)
DATABASE_URL=postgresql://user:pwd@rds-instance.aws.com/fmcg_rewards

# Redis (use managed service)
REDIS_URL=redis://elasticache-instance.aws.com:6379

# Security
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Base URL for QR codes (production domain)
BASE_URL=https://yourdomain.com

# Logging
LOG_LEVEL=WARNING
LOG_FILE=/var/log/app/fmcg.log
```

### 4. **Performance Tuning**

**PostgreSQL:**
```ini
# postgresql.conf
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 20MB
maintenance_work_mem = 1GB
```

**Gunicorn:**
```bash
gunicorn \
  --workers 8 \
  --worker-class sync \
  --bind 0.0.0.0:5000 \
  --timeout 60 \
  --access-logfile - \
  --error-logfile - \
  wsgi:app
```

---

## Summary

This backend provides a **production-ready, scalable solution** for FMCG reward campaigns with:

✅ Clean, maintainable architecture
✅ Full integration with existing React frontend
✅ Comprehensive security measures
✅ Support for lakhs of records
✅ Easy deployment options
✅ Complete audit trail
✅ Flexible reporting and analytics

The system is ready for deployment and can handle high-volume campaigns with millions of QR codes and submissions.
