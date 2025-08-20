# Backend Requirements for Consent Management System

## Database Schema (PostgreSQL)

### 1. Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  title VARCHAR(50),
  full_name VARCHAR(255) NOT NULL,
  id_passport VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Consent Versions Table
```sql
CREATE TABLE consent_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'th',
  description TEXT,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size VARCHAR(50),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  UNIQUE(version, language)
);
```

### 3. Consents Table
```sql
CREATE TABLE consents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  consent_version_id INTEGER REFERENCES consent_versions(id),
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, withdrawn, expired
  withdrawn_date TIMESTAMP,
  expiry_date TIMESTAMP
);
```

### 4. Consent Version Targeting Table
```sql
CREATE TABLE consent_version_targeting (
  id SERIAL PRIMARY KEY,
  id_passport VARCHAR(50) NOT NULL,
  consent_version_id INTEGER REFERENCES consent_versions(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);
```

### 5. Admin Users Table
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  user_id INTEGER,
  admin_id INTEGER,
  ip_address VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Required

### Public Endpoints (No Authentication)

#### 1. Submit Initial Registration
```
POST /api/consent/initial
Body: {
  "title": "นาย",
  "fullName": "ชยาพล ทดสอบ"
}
Response: {
  "success": true,
  "data": {
    "userData": {
      "title": "นาย",
      "fullName": "ชยาพล ทดสอบ"
    }
  }
}
```

#### 2. Submit Full Consent
```
POST /api/consent/submit
Body: {
  "title": "นาย",
  "fullName": "ชยาพล ทดสอบ",
  "idPassport": "1234567890123",
  "email": "test@example.com",
  "phone": "0812345678",
  "consentGiven": true,
  "consentVersionId": 2,
  "consentVersion": "2.0"
}
Response: {
  "success": true,
  "message": "บันทึกข้อมูลสำเร็จ",
  "data": {
    "consentId": 123,
    "referenceNumber": "CONS-2024-000123"
  }
}
```

#### 3. Check Consent Status
```
GET /api/consent/check/:idPassport
Response: {
  "success": true,
  "data": {
    "fullName": "ชยาพล ทดสอบ",
    "idPassport": "1234567890123",
    "email": "test@example.com",
    "phone": "0812345678",
    "consentGiven": true,
    "consentDate": "2024-03-15T10:30:00Z",
    "consentVersion": "2.0",
    "status": "active"
  }
}
```

#### 4. Get Active Consent Version
```
GET /api/consent/active-version
Response: {
  "success": true,
  "data": {
    "id": 2,
    "version": "2.0",
    "language": "th",
    "description": "อัพเดตนโยบาย PDPA"
  }
}
```

#### 5. Get Targeted Consent Version
```
GET /api/consent/targeted-version/:idPassport
Response: {
  "success": true,
  "data": {
    "id": 3,
    "version": "3.0",
    "language": "th",
    "description": "เวอร์ชันพิเศษสำหรับกลุ่มเป้าหมาย"
  }
}
```

### Admin Endpoints (Require Authentication)

#### 6. Admin Login
```
POST /api/admin/login
Body: {
  "username": "admin",
  "password": "password123"
}
Response: {
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "fullName": "ผู้ดูแลระบบ",
      "role": "admin"
    }
  }
}
```

#### 7. Get Consent List (Dashboard)
```
GET /api/consent/list
Headers: Authorization: Bearer <token>
Query: ?page=1&limit=10&search=&status=active
Response: {
  "success": true,
  "data": {
    "items": [...],
    "total": 150,
    "page": 1,
    "totalPages": 15
  }
}
```

#### 8. Get Dashboard Statistics
```
GET /api/consent/stats
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "data": {
    "totalConsents": 1500,
    "todayConsents": 25,
    "activeConsents": 1400,
    "withdrawnConsents": 100,
    "monthlyTrend": [...],
    "consentsByVersion": {...}
  }
}
```

#### 9. Export Data
```
GET /api/export/excel
Headers: Authorization: Bearer <token>
Query: ?startDate=2024-01-01&endDate=2024-12-31
Response: Excel file download
```

```
GET /api/export/csv
Headers: Authorization: Bearer <token>
Query: ?startDate=2024-01-01&endDate=2024-12-31
Response: CSV file download
```

#### 10. Consent Version Management
```
POST /api/upload/consent-version
Headers: Authorization: Bearer <token>
Body: FormData with file and metadata
Response: {
  "success": true,
  "data": {
    "id": 4,
    "version": "4.0",
    "fileName": "consent_v4.pdf"
  }
}
```

```
GET /api/upload/consent-versions
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "version": "1.0",
      "language": "th",
      "description": "เวอร์ชันแรก",
      "isActive": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "fileName": "consent_v1.pdf",
      "fileSize": "245KB",
      "usageCount": 1250
    }
  ]
}
```

```
PUT /api/upload/consent-version/:id/toggle
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "message": "อัพเดตสถานะเรียบร้อย"
}
```

```
DELETE /api/upload/consent-version/:id
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "message": "ลบเวอร์ชันเรียบร้อย"
}
```

```
GET /api/upload/consent-version/:id/download
Headers: Authorization: Bearer <token>
Response: File download
```

#### 11. Version Targeting Management
```
POST /api/consent/version-targeting
Headers: Authorization: Bearer <token>
Body: {
  "idPassport": "1234567890123",
  "consentVersionId": 3,
  "startDate": "2024-03-01",
  "endDate": "2024-12-31"
}
Response: {
  "success": true,
  "data": {
    "id": 1,
    "message": "กำหนดเป้าหมายเรียบร้อย"
  }
}
```

```
GET /api/consent/version-targeting
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "idPassport": "1234567890123",
      "consentVersion": "3.0",
      "startDate": "2024-03-01",
      "endDate": "2024-12-31",
      "isActive": true
    }
  ]
}
```

```
DELETE /api/consent/version-targeting/:id
Headers: Authorization: Bearer <token>
Response: {
  "success": true,
  "message": "ลบการกำหนดเป้าหมายเรียบร้อย"
}
```

## Security Requirements

### 1. Authentication & Authorization
- JWT token-based authentication for admin
- Token expiration (e.g., 24 hours)
- Refresh token mechanism
- Role-based access control (RBAC)

### 2. Data Protection
- Password hashing using bcrypt or argon2
- HTTPS/TLS for all communications
- Input validation and sanitization
- SQL injection prevention (use parameterized queries)
- XSS protection

### 3. Rate Limiting
```javascript
// Example rate limits
{
  "public": {
    "/api/consent/submit": "10 requests per minute",
    "/api/consent/check": "20 requests per minute"
  },
  "admin": {
    "/api/admin/login": "5 requests per minute",
    "/api/export/*": "5 requests per minute"
  }
}
```

### 4. CORS Configuration
```javascript
{
  "origin": ["http://localhost:3001", "https://yourdomain.com"],
  "credentials": true,
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["Content-Type", "Authorization"]
}
```

## Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=consent
DB_USER=postgres
DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password

# Admin Default
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

## Middleware Requirements

### 1. Authentication Middleware
```javascript
// Verify JWT token for protected routes
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 2. Error Handling Middleware
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### 3. Logging Middleware
```javascript
// Log all requests
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};
```

## Data Validation Rules

### 1. Thai ID Card Validation
```javascript
function validateThaiID(id) {
  if (!/^\d{13}$/.test(id)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12));
}
```

### 2. Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### 3. Phone Validation (Thai)
```javascript
const phoneRegex = /^(0[689]\d{8})$/;
```

## Deployment Considerations

### 1. Database Migrations
Use a migration tool like:
- Knex.js migrations
- Sequelize migrations
- node-pg-migrate

### 2. Health Check Endpoint
```
GET /api/health
Response: {
  "status": "healthy",
  "timestamp": "2024-03-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

### 3. Monitoring & Logging
- Application logs (Winston, Bunyan)
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Database query logging

### 4. Backup Strategy
- Daily database backups
- File storage backups
- Backup retention policy (30 days)

## Testing Requirements

### 1. Unit Tests
- Test all validation functions
- Test database models
- Test utility functions

### 2. Integration Tests
- Test API endpoints
- Test authentication flow
- Test file upload/download

### 3. Load Testing
- Test concurrent user submissions
- Test rate limiting
- Test database connection pooling

## Additional Features to Consider

1. **Email Notifications**
   - Send confirmation email after consent
   - Admin notifications for new consents

2. **Audit Trail**
   - Log all admin actions
   - Log consent modifications
   - Log data exports

3. **Consent Expiry**
   - Auto-expire consents after period
   - Renewal reminders

4. **Multi-tenancy**
   - Support multiple organizations
   - Separate data per tenant

5. **API Documentation**
   - Swagger/OpenAPI specification
   - Postman collection

6. **Webhooks**
   - Notify external systems on consent changes
   - Integration with CRM systems
