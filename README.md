# Multi-Tenant Consent Management System

## Installation

### Backend Setup
```bash
cd backend
npm install express cors body-parser dotenv
node server-complete.js
```
Backend runs on: http://localhost:4000

### Frontend Setup
```bash
# In root directory
npm install
npm start
```
Frontend runs on: http://localhost:3001

## Access URLs
- **User Consent Page**: http://localhost:3001/#/user
- **Admin Panel**: http://localhost:3001/#/admin
- **Tenant-specific**: http://localhost:3001/#/default/consent

## Features

### User Consent Flow (5 Steps)
- **Step A**: Audience Selection (auto-skip if single audience)
- **Step B**: Language Selection (TH/EN)
- **Step C**: Policy Content Display with version badges
- **Step D**: User Information Form
- **Step E**: Success Confirmation

### Admin Features
- Create/Clone/Deactivate policy versions
- Multi-tenant support
- Audience targeting
- Export to CSV
- Version duplicate prevention

### Validation
- Thai ID: 13 digits with checksum validation
- Passport: [A-Z0-9]{6,12}
- Required consent checkbox
- Effective date range validation

### Security
- ID hashing with salt (SHA256)
- Only last 4 digits stored in plain
- IP address and user agent tracking
- Snapshot HTML capture
- Rate limiting on consent submission

## API Endpoints

### User APIs
- `GET /api/tenant/:tenant/config` - Get tenant configuration
- `POST /api/consent/version` - Get active policy version
- `POST /api/consent/accept` - Submit consent

### Admin APIs
- `GET /admin/policy_versions` - List all versions
- `POST /admin/policy_versions` - Create new version
- `PUT /admin/policy_versions/:id/deactivate` - Deactivate version
- `GET /admin/report` - Get consent report
- `GET /admin/export/csv` - Export CSV

## Database Schema
Run migration: `backend/migrations/complete-schema.sql`

Tables:
- tenants
- policy_kinds
- policies
- audiences
- policy_versions
- policy_version_audiences
- user_consents

## Environment Variables
Copy `backend/.env.example` to `backend/.env` and configure:
```
PORT=4000
ID_HASH_SALT=change-this-salt-in-production
```

## Test Data
Default tenant with privacy policy in TH/EN for customer, staff, admin audiences.

## Version Selection Logic
1. Filter by tenant, kind, audience, active status
2. Match exact language first
3. Fallback to tenant default language
4. Sort by effective_from DESC, version DESC

## Report Columns
Title, Name-Surname, ID (TYPE ****LAST4), Created Date, Created Time, Consent ID, ConsentType, Consent Language, IP Address, Browser
