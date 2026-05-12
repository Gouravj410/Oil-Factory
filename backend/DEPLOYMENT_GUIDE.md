# Production Deployment Guide

## Overview

This guide covers deploying the FMCG Reward Campaign backend to production environments. The application is production-ready and can be deployed to:

- Docker containers
- Heroku
- AWS (EC2, ECS, Elastic Beanstalk)
- DigitalOcean
- Google Cloud
- Azure
- Traditional VPS

---

## Prerequisites

- PostgreSQL 12+ database (local or managed service)
- Python 3.8+ runtime
- Redis 6+ (optional, for caching)
- Domain name and SSL certificate
- Environment secrets management

---

## 1. Docker Deployment

### Create Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/api/health')"

# Run with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "wsgi:app"]
```

### Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fmcg_rewards
      POSTGRES_USER: fmcg_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fmcg_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://fmcg_user:${DB_PASSWORD}@postgres:5432/fmcg_rewards
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker

```bash
# Build image
docker build -t fmcg-backend:v1.0 .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Access shell
docker-compose exec app python

# Run migrations
docker-compose exec app python -c "from app import create_app; app = create_app(); app.app_context().push(); from flask_sqlalchemy import SQLAlchemy"

# Stop services
docker-compose down
```

---

## 2. Heroku Deployment

### Create Procfile

```
web: gunicorn --workers=4 --timeout=120 wsgi:app
```

### Create runtime.txt

```
python-3.11.7
```

### Deploy Steps

```bash
# Login to Heroku
heroku login

# Create app
heroku create fmcg-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0 --app fmcg-backend

# Add Redis addon (optional)
heroku addons:create heroku-redis:premium-0 --app fmcg-backend

# Set environment variables
heroku config:set SECRET_KEY="your-secret-key" --app fmcg-backend
heroku config:set JWT_SECRET_KEY="your-jwt-key" --app fmcg-backend
heroku config:set FLASK_ENV=production --app fmcg-backend

# Deploy
git push heroku main

# View logs
heroku logs -t --app fmcg-backend

# Create admin user
heroku run python --app fmcg-backend
>>> from app import create_app
>>> app = create_app()
>>> app.app_context().push()
>>> from app.services.admin_service import AdminService
>>> AdminService.create_admin("admin", "admin@example.com", "SecurePassword123!")
```

---

## 3. AWS Elastic Beanstalk

### Create .ebextensions/python.config

```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: wsgi:app
  
  aws:elasticbeanstalk:application:environment:
    FLASK_ENV: production
    PYTHONPATH: /var/app/current:$PYTHONPATH
```

### Deploy Steps

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB app
eb init -p python-3.11 fmcg-backend

# Create environment
eb create fmcg-prod --database --instance-type t3.medium

# Set environment variables
eb setenv SECRET_KEY="your-secret-key" JWT_SECRET_KEY="your-jwt-key"

# Deploy
eb deploy

# Monitor logs
eb logs

# SSH into instance
eb ssh
```

---

## 4. DigitalOcean App Platform

### Create app.yaml

```yaml
name: fmcg-backend
services:
- name: api
  github:
    repo: yourusername/fmcg-backend
    branch: main
  build_command: pip install -r requirements.txt
  http_port: 5000
  
- name: db
  engine: PG
  version: "15"
  production: true

envs:
- key: FLASK_ENV
  value: production
- key: SECRET_KEY
  scope: RUN_TIME
- key: JWT_SECRET_KEY
  scope: RUN_TIME
- key: DATABASE_URL
  scope: RUN_TIME
  value: ${db.DATABASE_URL}
```

### Deploy via CLI

```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Create app
doctl apps create --spec app.yaml

# View deployment
doctl apps list
doctl apps get <APP_ID>
```

---

## 5. Traditional VPS Deployment

### Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
    postgresql postgresql-contrib redis-server nginx supervisor

# Create app user
sudo useradd -m -s /bin/bash fmcg
sudo su - fmcg

# Create app directory
mkdir ~/fmcg-backend
cd ~/fmcg-backend

# Clone repository
git clone https://github.com/yourrepo/fmcg-backend.git .

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with production values
nano .env

# Test run
python run.py
```

### PostgreSQL Setup

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
createdb fmcg_rewards
createuser fmcg_user
psql

# In psql:
ALTER USER fmcg_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE fmcg_rewards TO fmcg_user;
\q
```

### Nginx Configuration

Create `/etc/nginx/sites-available/fmcg-backend`:

```nginx
upstream fmcg_app {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://fmcg_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
    
    location /static/ {
        alias /home/fmcg/fmcg-backend/static/;
        expires 30d;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/fmcg-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Supervisor Configuration

Create `/etc/supervisor/conf.d/fmcg.conf`:

```ini
[program:fmcg-backend]
user=fmcg
directory=/home/fmcg/fmcg-backend
command=/home/fmcg/fmcg-backend/venv/bin/gunicorn \
    --workers=4 \
    --timeout=120 \
    --bind=127.0.0.1:8000 \
    --access-logfile=/home/fmcg/fmcg-backend/logs/access.log \
    --error-logfile=/home/fmcg/fmcg-backend/logs/error.log \
    wsgi:app
autostart=true
autorestart=true
stderr_logfile=/var/log/fmcg.err.log
stdout_logfile=/var/log/fmcg.out.log
```

Start service:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start fmcg-backend
```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (runs daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 6. Environment Variables for Production

Create `.env` file with:

```env
# Flask Configuration
FLASK_ENV=production
FLASK_DEBUG=False

# Database (Production)
DATABASE_URL=postgresql://fmcg_user:secure_password@db.example.com:5432/fmcg_rewards

# Security Keys (Generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your-64-char-hex-key
JWT_SECRET_KEY=your-64-char-hex-key

# JWT Configuration
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://admin.yourdomain.com

# Base URL
BASE_URL=https://api.yourdomain.com

# Rate Limiting
RATELIMIT_STORAGE_URL=redis://redis.example.com:6379/0

# Redis (Optional)
REDIS_URL=redis://redis.example.com:6379/0

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/fmcg-backend/app.log

# Batch Processing
BATCH_SIZE=1000
MAX_QR_BATCH_SIZE=100000

# File Uploads
MAX_CONTENT_LENGTH=52428800

# Email (Optional for notifications)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=app-specific-password
```

---

## 7. Deployment Checklist

- [ ] Database backups scheduled (daily)
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Environment variables securely stored (not in git)
- [ ] Logs configured and rotating
- [ ] Monitoring and alerting set up
- [ ] Gunicorn with multiple workers (4+ for production)
- [ ] Nginx reverse proxy configured
- [ ] Rate limiting enabled
- [ ] CORS origins restricted to frontend domain only
- [ ] Admin user created
- [ ] First QR batch generated and tested
- [ ] Submission flow tested end-to-end
- [ ] Winner selection algorithm tested
- [ ] Export functionality verified
- [ ] Database query performance monitored
- [ ] Error tracking configured (Sentry optional)

---

## 8. Monitoring & Maintenance

### Monitor Application

```bash
# Check Gunicorn workers
ps aux | grep gunicorn

# Check nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# View application logs
tail -f /var/log/fmcg.out.log
```

### Database Maintenance

```bash
# Backup database
pg_dump -U fmcg_user fmcg_rewards > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U fmcg_user fmcg_rewards < backup_20240115.sql

# Optimize tables
VACUUM ANALYZE;
```

### Performance Tuning

```sql
-- Create indices for hot queries
CREATE INDEX idx_submission_phone ON submission(phone);
CREATE INDEX idx_qr_code_is_used ON qr_code(is_used);
CREATE INDEX idx_submission_is_winner ON submission(is_winner);

-- Check index usage
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

---

## 9. Scaling Considerations

For **millions of QR codes**:

### Horizontal Scaling
```
1. Multiple Gunicorn workers (8+ for heavy load)
2. Load balancer (Nginx, HAProxy)
3. Read replicas for PostgreSQL
4. Caching layer (Redis)
5. CDN for static assets
```

### Database Scaling
```
1. Connection pooling (PgBouncer)
2. Partitioning large tables by date or batch_id
3. Archive old data to separate storage
4. Replication for high availability
```

### Performance Optimization
```
1. Enable caching for scheme and batch queries
2. Use connection pooling
3. Implement query result caching
4. Consider async task queue (Celery) for exports
```

---

## 10. Troubleshooting

### Application Won't Start
```bash
# Check for syntax errors
python -m py_compile app/**/*.py

# Test imports
python -c "from app import create_app; create_app()"

# Check environment variables
printenv | grep FLASK
```

### Database Connection Issues
```bash
# Test connection
psql postgresql://fmcg_user:password@host:5432/fmcg_rewards

# Check connection string format
# postgresql://username:password@host:port/database
```

### High Memory Usage
```bash
# Reduce Gunicorn workers
gunicorn --workers=2 wsgi:app

# Enable garbage collection tracking
python -c "import gc; gc.collect()"
```

### Slow Queries
```bash
# Enable query logging in PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

# Check slow query log
tail -f /var/log/postgresql/postgresql.log
```

---

## Support & Documentation

- **Main README:** backend/README.md
- **Architecture Guide:** backend/ARCHITECTURE.md
- **API Reference:** backend/API_REFERENCE.md
- **Quick Start:** backend/QUICKSTART.md
- **Implementation Summary:** IMPLEMENTATION_SUMMARY.md

---

This deployment guide covers all major platforms. Choose the platform that best fits your infrastructure needs.
