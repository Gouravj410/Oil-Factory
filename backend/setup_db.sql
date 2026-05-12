-- FMCG Rewards Database Setup Script
-- Run this as postgres superuser

-- 1. Create the user
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'fmcg_user') THEN
    CREATE USER fmcg_user WITH PASSWORD 'fmcg_password';
  END IF;
END
$$;

-- 2. Create the database
SELECT 'CREATE DATABASE fmcg_rewards OWNER fmcg_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fmcg_rewards')\gexec

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fmcg_rewards TO fmcg_user;

-- 4. Connect to the new database and set schema permissions
\c fmcg_rewards
GRANT ALL ON SCHEMA public TO fmcg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fmcg_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fmcg_user;

\echo '=== Database setup complete! ==='
\echo 'DB: fmcg_rewards'
\echo 'User: fmcg_user'
\echo 'Password: fmcg_password'
