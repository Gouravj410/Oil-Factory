# FMCG Backend - System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
│          (Existing landing page + Admin Portal)             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  QR Submission Form    │    Admin Dashboard         │   │
│  │  - Validate QR         │    - Statistics           │   │
│  │  - Get Reward Text     │    - Batch Management     │   │
│  │  - Submit Data         │    - Scheme Manager       │   │
│  │                        │    - Winner Selection     │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ HTTP Requests (JSON)
                │ JWT Tokens for Admin
                │
┌───────────────▼──────────────────────────────────────────────┐
│           FLASK BACKEND API LAYER                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ /api/auth       - Admin authentication             │    │
│  │ /api/qr         - QR validation & submission       │    │
│  │ /api/admin      - Dashboard & batch management     │    │
│  │ /api/schemes    - Campaign management              │    │
│  │ /api/winners    - Winner selection & export        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ SERVICES LAYER (Business Logic)                    │    │
│  │                                                    │    │
│  │  AdminService      QRBatchService                 │    │
│  │  SchemeService     SubmissionService              │    │
│  │  WinnerService                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ UTILITIES & HELPERS                               │    │
│  │                                                    │    │
│  │  QR Generation    Password Security               │    │
│  │  QR Validation    Input Validation                │    │
│  │  Export (CSV/ZIP) Rate Limiting                   │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────┬──────────────────────────────────────────────┘
                │
                │ SQL Queries
                │ ORM (SQLAlchemy)
                │
┌───────────────▼──────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                             │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐            │
│  │ qr_codes │  │ submissions  │  │ schemes   │            │
│  ├──────────┤  ├──────────────┤  ├───────────┤            │
│  │ id       │  │ id           │  │ id        │            │
│  │ code*    │  │ qr_code_id*  │  │ title     │            │
│  │ batch_id │  │ phone*       │  │ reward_*  │            │
│  │ used*    │  │ city*        │  │ active*   │            │
│  │ used_at  │  │ is_winner*   │  │ dates     │            │
│  └──────────┘  └──────────────┘  └───────────┘            │
│                                                              │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────┐    │
│  │ qr_batches   │  │ admins       │  │ audit_logs  │    │
│  ├───────────────┤  ├──────────────┤  ├─────────────┤    │
│  │ id            │  │ id           │  │ id          │    │
│  │ code (unique) │  │ username*    │  │ admin_id    │    │
│  │ quantity      │  │ password_h   │  │ action      │    │
│  │ used_count*   │  │ role         │  │ resource_*  │    │
│  │ created_by    │  │ is_active    │  │ ip_address  │    │
│  └───────────────┘  └──────────────┘  └─────────────┘    │
│                                                              │
│  * = Indexed for fast queries                              │
└──────────────────────────────────────────────────────────────┘

Optional: Redis for caching & rate limiting
```

---

## Data Flow: QR Submission

```
User Scans QR Code
        │
        ▼
Browser navigates to /r/{code}
        │
        ▼
Frontend calls GET /api/qr/validate/{code}
        │
        ▼
Backend: Check if QR exists, not used, scheme active
        │
        ├─ YES ──► Return: valid, reward_text, scheme_id
        │           Frontend shows submission form
        │
        └─ NO  ──► Return: error message
                   Frontend shows error
        │
        ▼
User fills form (name, phone, city)
        │
        ▼
Frontend calls POST /api/qr/submit
        │
        ├─ Validate inputs (phone format, etc.)
        │
        ├─ Check for duplicate submissions
        │
        ├─ Create submission record
        │
        ├─ Mark QR as used (ATOMIC)
        │
        ├─ Update batch usage counter
        │
        └─ Return: success + reward details
            │
            ▼
Frontend shows success message with reward info
            │
            ▼
QR code is permanently marked as used
```

---

## Data Flow: Admin Batch Generation

```
Admin clicks "Create Batch"
        │
        ▼
Submit form: batch_name, quantity, scheme_id
        │
        ▼
POST /api/admin/batch/create
        │
        ├─ Verify admin authentication (JWT token)
        │
        ├─ Create QRBatch record
        │
        ├─ Generate unique codes in batches:
        │  - Batch 1: codes 0-999
        │  - Batch 2: codes 1000-1999
        │  - ... (processing in parallel)
        │
        ├─ Store in qr_codes table with is_used=false
        │
        └─ Return: batch_id, status
            │
            ▼
Admin waits for generation to complete
            │
            ▼
GET /api/admin/batch/{id}/export
            │
            ├─ Stream QR images from database
            │
            ├─ Create ZIP file in-memory
            │
            └─ Download for printing
```

---

## API Endpoint Structure

```
Authentication
├── POST /api/auth/register
├── POST /api/auth/login               ──► Returns JWT token
├── POST /api/auth/refresh             ──► Token refresh
├── POST /api/auth/change-password     ──► Requires JWT
└── GET  /api/auth/profile             ──► Requires JWT

Public QR
├── GET  /api/qr/validate/{code}       ──► No auth needed
├── POST /api/qr/submit                ──► No auth needed
├── POST /api/qr/check-duplicate       ──► No auth needed
└── GET  /api/qr/get-reward/{code}     ──► No auth needed

Admin (Requires JWT)
├── GET  /api/admin/dashboard          ──► Dashboard stats
├── POST /api/admin/batch/create       ──► Create QR batch
├── GET  /api/admin/batch/{id}         ──► Batch details
├── GET  /api/admin/batches            ──► List batches
├── GET  /api/admin/batch/{id}/export  ──► Export ZIP
├── DELETE /api/admin/batch/{id}       ──► Delete batch
├── GET  /api/admin/submissions        ──► List submissions
└── GET  /api/admin/submissions/export ──► Export CSV

Schemes (Requires JWT)
├── POST /api/schemes                  ──► Create scheme
├── GET  /api/schemes                  ──► List schemes
├── GET  /api/schemes/{id}             ──► Scheme details
├── PUT  /api/schemes/{id}             ──► Update scheme
├── POST /api/schemes/{id}/activate    ──► Activate
└── POST /api/schemes/{id}/deactivate  ──► Deactivate

Winners (Requires JWT)
├── POST /api/winners/select-random    ──► Random selection
├── POST /api/winners/mark-winner      ──► Manual mark
├── GET  /api/winners                  ──► List winners
├── GET  /api/winners/{id}             ──► Winner details
├── POST /api/winners/{id}/announce    ──► Announce
├── POST /api/winners/announce-bulk    ──► Bulk announce
├── GET  /api/winners/export           ──► Export CSV
└── GET  /api/winners/statistics       ──► Get stats
```

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│     INCOMING REQUEST                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Rate Limiter    │  ← Blocks abusers
        │ (IP-based)      │    (5 attempts/min)
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ CORS Check      │  ← Validates origin
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ JWT Verification│  ← For /admin & /schemes
        │ (If required)   │    (1-hour expiry)
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Input Validation│  ← Sanitizes inputs
        │ - Phone format  │    - SQL injection prevention
        │ - Name length   │    - XSS prevention
        │ - City regex    │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Duplicate Check │  ← QR replay prevention
        │ (if applicable) │    - Phone tracking
        │                 │    - QR one-time use
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ PROCESS REQUEST │  ← Service layer
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ AUDIT LOG       │  ← Log all actions
        │ - Admin ID      │    - IP address
        │ - Action        │    - Timestamp
        │ - Resource      │
        └─────────────────┘
```

---

## Database Query Optimization

```
Slow Query (Without Indexing):
SELECT * FROM submissions 
WHERE phone = '9876543210' 
  AND city = 'Mumbai'

Execution: Scans entire table ⚠️ SLOW

Fast Query (With Indexing):
CREATE INDEX idx_phone_city ON submissions(phone, city);

SELECT * FROM submissions 
WHERE phone = '9876543210' 
  AND city = 'Mumbai'

Execution: Uses index ✅ FAST

Similar indices created for:
- qr_codes(unique_code)
- qr_codes(is_used, batch_id, scheme_id)
- submissions(phone, city)
- submissions(submitted_at)
- winner_selections(scheme_id)
```

---

## Scalability Strategy

```
Layer 1: Database Optimization
  ├─ Smart indexing
  ├─ Connection pooling
  ├─ Query optimization
  └─ Read replicas (production)

Layer 2: Application Optimization
  ├─ Batch processing
  ├─ Pagination (50 per page)
  ├─ Caching (Redis)
  └─ Streaming exports

Layer 3: Infrastructure Scaling
  ├─ Multiple Flask instances
  ├─ Load balancer (Nginx/HAProxy)
  ├─ PostgreSQL replication
  └─ CDN for static files

Result: Can handle millions of records efficiently
```

---

## Security Layers

```
Layer 1: Authentication
  └─ JWT tokens (secure signing)

Layer 2: Authorization  
  └─ Role-based access (admin, super_admin)

Layer 3: Input Security
  ├─ Type validation
  ├─ Length limits
  ├─ Format validation
  └─ Sanitization

Layer 4: Business Logic Security
  ├─ One-time use enforcement
  ├─ Duplicate detection
  ├─ Rate limiting
  └─ Atomic operations

Layer 5: Data Security
  ├─ Password hashing (PBKDF2)
  ├─ SQL injection prevention (ORM)
  └─ Audit logging

Result: Defense-in-depth security model
```

---

## Deployment Architecture

```
Development
└─ python run.py

Production
└─ Gunicorn (4 workers)
   ├─ Nginx (reverse proxy)
   ├─ PostgreSQL (primary + replicas)
   ├─ Redis (caching)
   └─ Monitoring (logs, metrics)

Docker
└─ Container image
   ├─ Based on Python 3.11
   ├─ All dependencies included
   └─ Expose port 5000

Cloud Deployment
├─ Heroku
├─ AWS (RDS + EC2/Fargate)
├─ DigitalOcean
└─ Google Cloud (Cloud Run)
```

---

## File Organization

```
app/
├── __init__.py
│   └─ Flask app factory
│   └─ Initializes extensions
│   └─ Registers blueprints
│   └─ Creates tables
│
├── config.py
│   └─ Development config
│   └─ Testing config
│   └─ Production config
│
├── models/__init__.py
│   ├─ Admin (user accounts)
│   ├─ QRBatch (batch tracking)
│   ├─ QRCode (actual QR codes)
│   ├─ Scheme (campaigns)
│   ├─ Submission (user form data)
│   ├─ WinnerSelection (audit trail)
│   ├─ DuplicateSubmissionCheck (rate limiting)
│   └─ AuditLog (action tracking)
│
├── services/
│   ├─ admin_service.py
│   ├─ batch_service.py
│   ├─ scheme_service.py
│   ├─ submission_service.py
│   └─ winner_service.py
│
├── routes/
│   ├─ auth_routes.py
│   ├─ qr_routes.py
│   ├─ admin_routes.py
│   ├─ scheme_routes.py
│   └─ winner_routes.py
│
└── utils/
    ├─ auth.py (security)
    ├─ qr_utils.py (QR generation)
    └─ helpers.py (common functions)
```

---

This documentation provides a complete overview of the backend architecture, data flows, security measures, and deployment strategy.
