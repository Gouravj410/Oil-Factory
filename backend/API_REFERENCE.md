# Complete API Reference

## Base URL
```
Development: http://localhost:5000
Production: https://yourdomain.com
```

## Response Format

All responses follow this format:

```json
{
  "success": true/false,
  "timestamp": "2024-01-15T10:30:45.123456",
  "data": {},
  "message": "Success message",
  "error": "Error message"
}
```

---

## 🔐 Authentication Endpoints

### Register Admin
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "message": "Admin registered successfully"
}
```

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "SecurePassword123!"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "admin_id": 1,
    "username": "admin",
    "role": "admin",
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Login successful"
}
```

**Note:** Store `access_token` in localStorage. Include in all admin requests:
```
Authorization: Bearer <access_token>
```

---

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "message": "Token refreshed"
}
```

---

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "OldPassword123!",
  "new_password": "NewPassword123!"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "is_active": true,
    "last_login": "2024-01-15T10:30:45",
    "created_at": "2024-01-10T15:20:30"
  }
}
```

---

## 📱 Public QR Endpoints (No Auth Required)

### Validate QR Code
```http
GET /api/qr/validate/{qr_code}
```

**Example:**
```http
GET /api/qr/validate/QR123456789ABC
```

**Response: 200 OK (Valid)**
```json
{
  "success": true,
  "data": {
    "qr_code": "QR123456789ABC",
    "is_valid": true,
    "scheme_id": 1,
    "reward_text": "Win a free bottle!",
    "scheme_title": "Spring Campaign",
    "remaining_days": 15
  },
  "message": "QR code is valid"
}
```

**Response: 400 Bad Request (Invalid)**
```json
{
  "success": false,
  "error": "QR code already used"
}
```

---

### Submit QR Form
```http
POST /api/qr/submit
Content-Type: application/json

{
  "qr_code": "QR123456789ABC",
  "name": "John Doe",
  "phone": "9876543210",
  "city": "Mumbai",
  "state": "Maharashtra",
  "purchase_details": {
    "product": "Premium Oil",
    "quantity": "1L"
  }
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "submission_id": 1234,
    "status": "success",
    "message": "Your entry has been recorded. Thank you for participating!"
  },
  "message": "Submission successful"
}
```

---

### Check for Duplicate
```http
POST /api/qr/check-duplicate
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "is_duplicate": true,
    "is_blocked": false,
    "reason": "Multiple submissions detected (1 existing)"
  }
}
```

---

### Get Reward Details
```http
GET /api/qr/get-reward/{qr_code}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "qr_code": "QR123456789ABC",
    "scheme_title": "Spring Campaign",
    "reward_details": "50 loyalty points + exclusive gift",
    "reward_text": "Win a free bottle!"
  }
}
```

---

## 📊 Admin Endpoints (Require JWT Token)

### Get Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "qr_codes": {
      "total": 500000,
      "used": 125000,
      "remaining": 375000,
      "usage_percentage": 25.0
    },
    "submissions": {
      "total_submissions": 125000,
      "total_winners": 5000,
      "unique_participants": 120000,
      "unique_cities": 650,
      "winner_percentage": 4.0
    },
    "schemes": {
      "total": 5,
      "active": 3,
      "inactive": 2
    },
    "batches": {
      "total": 10
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

### Create QR Batch
```http
POST /api/admin/batch/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "batch_name": "Spring Campaign Batch 1",
  "quantity": 50000,
  "scheme_id": 1
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "batch_id": 5,
    "batch_name": "Spring Campaign Batch 1",
    "quantity": 50000,
    "status": "Generating QR codes..."
  },
  "message": "Batch created successfully"
}
```

---

### Get Batch Details
```http
GET /api/admin/batch/{batch_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "batch_name": "Spring Campaign Batch 1",
    "batch_code": "BATCH_20240115101524_1",
    "total_codes": 50000,
    "used_codes": 12500,
    "unused_codes": 37500,
    "usage_percentage": 25.0,
    "created_by": "admin",
    "created_at": "2024-01-15T10:15:24"
  }
}
```

---

### List Batches
```http
GET /api/admin/batches?page=1&per_page=50&scheme_id=1
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "batches": [
      {
        "id": 5,
        "batch_name": "Spring Campaign Batch 1",
        "total_codes": 50000,
        "used_codes": 12500,
        "usage_percentage": 25.0
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total": 10,
      "total_pages": 1
    }
  }
}
```

---

### Export QR Codes as ZIP
```http
GET /api/admin/batch/{batch_id}/export
Authorization: Bearer <access_token>
```

**Response: 200 OK**
- Returns binary ZIP file with QR images
- Use `download_name="qr_batch_{id}.zip"`

---

### Delete Batch
```http
DELETE /api/admin/batch/{batch_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Batch deleted successfully"
}
```

---

### List Submissions
```http
GET /api/admin/submissions?page=1&per_page=50&city=Mumbai&batch_id=1&period=month
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 50)
- `city` - Filter by city
- `batch_id` - Filter by batch
- `period` - today/week/month/year

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": 1234,
        "name": "John Doe",
        "phone": "9876543210",
        "city": "Mumbai",
        "state": "Maharashtra",
        "qr_code": "QR123456789ABC",
        "submitted_at": "2024-01-15T10:30:45",
        "is_winner": false,
        "winner_announced": false
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total": 125000,
      "total_pages": 2500
    }
  }
}
```

---

### Export Submissions as CSV
```http
GET /api/admin/submissions/export?batch_id=1&period=month
Authorization: Bearer <access_token>
```

**Response: 200 OK**
- Returns CSV file
- Columns: ID, Name, Phone, City, State, QR Code, Submitted At, Winner, Announced

---

## 📋 Scheme Endpoints (Require JWT Token)

### Create Scheme
```http
POST /api/schemes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Spring Campaign 2024",
  "description": "Win exciting prizes this spring",
  "reward_details": "50 loyalty points + free bottle",
  "reward_text": "Win a free bottle!",
  "start_date": "2024-02-01T00:00:00Z",
  "end_date": "2024-03-31T23:59:59Z"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Spring Campaign 2024",
    "is_active": true,
    "total_qr_codes": 0,
    "used_qr_codes": 0
  }
}
```

---

### List Schemes
```http
GET /api/schemes?page=1&per_page=50&active_only=true
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "schemes": [
      {
        "id": 1,
        "title": "Spring Campaign 2024",
        "reward_text": "Win a free bottle!",
        "is_active": true,
        "total_qr_codes": 500000,
        "used_qr_codes": 125000,
        "usage_percentage": 25.0
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total": 5,
      "total_pages": 1
    }
  }
}
```

---

### Get Scheme
```http
GET /api/schemes/{scheme_id}
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Spring Campaign 2024",
    "description": "Win exciting prizes this spring",
    "reward_details": "50 loyalty points + free bottle",
    "reward_text": "Win a free bottle!",
    "start_date": "2024-02-01T00:00:00",
    "end_date": "2024-03-31T23:59:59",
    "is_active": true,
    "total_qr_codes": 500000,
    "used_qr_codes": 125000,
    "usage_percentage": 25.0
  }
}
```

---

### Update Scheme
```http
PUT /api/schemes/{scheme_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "reward_text": "Updated reward text",
  "is_active": true
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "is_active": true
  },
  "message": "Scheme updated successfully"
}
```

---

### Activate/Deactivate Scheme
```http
POST /api/schemes/{scheme_id}/activate
POST /api/schemes/{scheme_id}/deactivate
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_active": true
  },
  "message": "Scheme activated"
}
```

---

## 🏆 Winner Management Endpoints (Require JWT Token)

### Select Random Winners
```http
POST /api/winners/select-random
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "scheme_id": 1,
  "count": 10
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "winners_selected": 10,
    "winners": [
      {
        "submission_id": 1234,
        "name": "John Doe",
        "phone": "9876543210",
        "city": "Mumbai",
        "qr_code": "QR123456789ABC",
        "submitted_at": "2024-01-15T10:30:45"
      }
    ]
  },
  "message": "Successfully selected 10 winners"
}
```

---

### Mark Winner Manually
```http
POST /api/winners/mark-winner
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "submission_id": 1234,
  "scheme_id": 1
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "submission_id": 1234,
    "name": "John Doe",
    "announced": false
  },
  "message": "Winner marked successfully"
}
```

---

### List Winners
```http
GET /api/winners?page=1&per_page=50&scheme_id=1&announced_only=false
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "winners": [
      {
        "submission_id": 1234,
        "name": "John Doe",
        "phone": "9876543210",
        "city": "Mumbai",
        "announced": false
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "total": 5000,
      "total_pages": 100
    }
  }
}
```

---

### Announce Winner
```http
POST /api/winners/{submission_id}/announce
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "submission_id": 1234,
    "announced": true,
    "announcement_date": "2024-01-15T10:45:00"
  },
  "message": "Winner announced"
}
```

---

### Bulk Announce Winners
```http
POST /api/winners/announce-bulk
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "submission_ids": [1234, 1235, 1236, ...]
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "announced_count": 100
  },
  "message": "Successfully announced 100 winners"
}
```

---

### Export Winners as CSV
```http
GET /api/winners/export?scheme_id=1&announced_only=false
Authorization: Bearer <access_token>
```

**Response: 200 OK**
- Returns CSV file with winner details

---

### Get Winner Statistics
```http
GET /api/winners/statistics?scheme_id=1
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "total_winners": 5000,
    "announced": 4500,
    "pending_announcement": 500
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden (Insufficient permissions)
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Auth endpoints:** 5 attempts per minute
- **QR submission:** 10 per hour per IP
- **Other endpoints:** Configurable

When rate limited, you'll receive:
```
HTTP 429 Too Many Requests
```

---

## Pagination

All list endpoints support pagination:

```
GET /api/endpoint?page=1&per_page=50
```

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 10000,
    "total_pages": 200
  }
}
```

---

## Date Format

All dates use ISO 8601 format:
```
2024-01-15T10:30:45
2024-01-15T10:30:45Z (with timezone)
```

---

This is the complete API reference covering all 25+ endpoints in the system.
