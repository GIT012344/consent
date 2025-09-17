# คู่มือการใช้งาน User Consent Management System

## 🎯 ภาพรวมระบบ
ระบบ Consent Management ที่พัฒนาเสร็จสมบูรณ์ ประกอบด้วย:
- **Frontend**: React + Tailwind CSS (Port 3001)
- **Backend**: Node.js + Express + PostgreSQL (Port 3000)

## 📁 โครงสร้างที่สำคัญ

### Backend (C:\Users\jchayapol\consent-back)
```
routes/
├── consent-accept.js    # API สำหรับ user consent flow
├── consent-export.js    # Export consent data เป็น CSV
└── [other routes]

migrations/
├── create_user_consents_table.sql  # Database schema
```

### Frontend (C:\Users\jchayapol\consent)
```
src/pages/
├── UserConsent.js           # หน้า Stepper UI หลัก
src/components/
├── UserConsentSteps.js      # Components แต่ละ step
```

## 🚀 วิธีการใช้งาน

### 1. เริ่มต้นระบบ

#### Backend:
```bash
cd C:\Users\jchayapol\consent-back
npm run dev
```

#### Frontend:
```bash
cd C:\Users\jchayapol\consent
npm start
```

### 2. เข้าใช้งาน User Consent Stepper
เปิดเบราว์เซอร์ไปที่: `http://localhost:3001/user-consent`

## 📋 Flow การทำงาน

### User Consent Stepper (5 ขั้นตอน)

#### Step A: เลือก Audience
- ระบบจะดึงข้อมูล audiences จาก tenant config
- หากมี audience เดียว จะข้ามไปขั้นตอนถัดไปอัตโนมัติ
- เก็บค่าใน localStorage

#### Step B: เลือกภาษา
- Default: ตรวจจับจาก browser
- รองรับ: ไทย (th) / English (en)
- สามารถเปลี่ยนภาษาได้ตลอดเวลา

#### Step C: แสดงเนื้อหา Consent
- ดึงเนื้อหา consent version ล่าสุดตาม tenant/audience/language
- แสดงเนื้อหาพร้อม checkbox ยอมรับเงื่อนไข
- ต้องติ๊กยอมรับก่อนดำเนินการต่อ

#### Step D: กรอกข้อมูลส่วนตัว
**ทุก field เป็น text input (ไม่มี dropdown)**
- คำนำหน้า
- ชื่อ
- นามสกุล
- เลขบัตรประชาชน/Passport (มี validation)
- อีเมล
- เบอร์โทรศัพท์

**Validation:**
- เลขบัตรประชาชนไทย: 13 หลัก + checksum validation
- Passport: รูปแบบ A-Z + ตัวเลข
- ชื่อ-นามสกุล: ตรวจสอบตามภาษา (ไทย/อังกฤษ)

#### Step E: หน้าสำเร็จ
แสดง:
- Consent ID (format: CNS-YYYYMMDD-XXXXXX)
- วันเวลาที่ยอมรับ
- ปุ่มดาวน์โหลด PDF (placeholder)
- ปุ่มส่งอีเมลยืนยัน (placeholder)

## 🔐 ความปลอดภัย

### การเก็บข้อมูล ID Number
- **ไม่เก็บ plain text** - ใช้ PBKDF2 hash + salt
- เก็บเฉพาะ 4 หลักสุดท้ายแยกต่างหาก
- ใช้สำหรับการ lookup และ reporting

### Duplicate Prevention
- ตรวจสอบการส่งซ้ำด้วย ID + policy version
- Return 409 Conflict หากมีข้อมูลซ้ำ

## 📊 Export ข้อมูล

### CSV Export API
```
GET /api/consent/export/{tenant}
```

**Fields ที่ export:**
- Consent ID
- วันที่/เวลา
- ชื่อ-นามสกุล
- ID (masked: ****XXXX)
- อีเมล
- โทรศัพท์
- Audience
- ภาษา
- Policy Version

## 🗄️ Database Schema

### Table: user_consents
```sql
- id (SERIAL PRIMARY KEY)
- tenant (VARCHAR)
- policy_version_id (INTEGER)
- consent_reference (VARCHAR UNIQUE)
- audience (VARCHAR)
- language (VARCHAR)
- title, first_name, last_name
- id_number_hash (VARCHAR) -- hashed
- id_last_four (VARCHAR)
- email, phone
- ip_address, user_agent
- consent_snapshot_html (TEXT)
- created_at, updated_at
```

## 🔧 การ Config

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=consent
DB_USER=postgres
DB_PASSWORD=yourpassword
PORT=3000
```

### Frontend
API Base URL: `http://localhost:3000/api`
(configured in UserConsent.js)

## 📝 API Endpoints

### Tenant Config
```
GET /api/tenant/{tenant}/config
```
Response: audiences[], default_language

### Latest Consent Version
```
GET /api/consent/version/latest?tenant=X&audience=Y&language=Z
```
Response: version data (currently mock)

### Accept Consent
```
POST /api/consent/accept
Body: {
  tenant, policyVersionId, audience, language,
  title, firstName, lastName, idNumber,
  email, phone, acceptedTerms, consentHtml
}
```

### Export CSV
```
GET /api/consent/export/{tenant}
```

## ⚠️ Known Issues / Pending

1. **PDF Download**: UI button exists, backend implementation pending
2. **Email Confirmation**: UI button exists, backend implementation pending
3. **Real Consent Version**: Currently using mock data
4. **Tenant Config**: Using default/mock data

## 🎉 สรุป

ระบบ User Consent Management พร้อมใช้งานแล้ว โดยมี features:
- ✅ Stepper UI 5 ขั้นตอน
- ✅ Multi-language support (TH/EN)
- ✅ Text input fields ทั้งหมด (ไม่มี dropdown)
- ✅ ID validation (บัตรประชาชน + Passport)
- ✅ Secure ID hashing
- ✅ CSV export
- ✅ Duplicate prevention
- ✅ Consent snapshot storage

พร้อมสำหรับการทดสอบและ deployment!
