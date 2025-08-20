# แก้ไข Error 400 Bad Request

## ปัญหาที่พบ
1. **Validation failed** - ข้อมูลที่ส่งไปไม่ผ่าน validation
2. **Field mismatch** - ชื่อ field ไม่ตรงกันระหว่าง Frontend และ Backend

## การแก้ไขที่ทำแล้ว

### 1. Frontend (ConsentForm.js)
- แก้ไข `nameSurname` field ให้รองรับทั้ง `userData.nameSurname` และ `userData.fullName`
- เพิ่ม console.log เพื่อ debug ข้อมูลที่ส่งไป

### 2. Backend (routes/consent.js)  
- เพิ่ม validation สำหรับ `email` และ `phone` (optional)
- เพิ่ม validation สำหรับ `consentVersionId` และ `consentVersion`
- แก้ไข variable conflict ของ `consentVersion`
- เพิ่ม endpoint `/api/consent/targeted-version/:idPassport`
- เพิ่ม endpoint `/api/consent/active-version`

## วิธีทดสอบ

### 1. เริ่มระบบ
```bash
# Terminal 1: Backend
cd consent-back
npm run dev

# Terminal 2: Frontend  
cd consent
npm start
```

### 2. ดู Console Log
เปิด Browser Developer Tools (F12) ดูที่ Console tab

### 3. ทดสอบ Submit Form
1. ไปที่หน้าแรก http://localhost:3001
2. กรอกข้อมูล Step 1:
   - คำนำหน้า: นาย/Mr.
   - ชื่อ-นามสกุล: ทดสอบ ระบบ
3. คลิก "ถัดไป"
4. กรอกข้อมูล Step 2:
   - เลขบัตร: 1234567890123
   - อีเมล: test@example.com  
   - เบอร์โทร: 0812345678
5. เลื่อนลง อ่านข้อความ และติ๊กถูก "ยอมรับเงื่อนไข"
6. คลิก "ส่งข้อมูล"

### 4. ตรวจสอบ Console
ดู Console log ควรเห็น:
```javascript
Submitting data: {
  title: "นาย",
  nameSurname: "ทดสอบ ระบบ",
  idPassport: "1234567890123",
  email: "test@example.com",
  phone: "0812345678",
  language: "th",
  consentType: "customer",
  consentVersionId: 1,
  consentVersion: "1.0"
}
```

### 5. หากยังมี Error 400
ตรวจสอบ Backend console:
```bash
# ดู Backend terminal ว่ามี error อะไร
# อาจเกิดจาก Database connection หรือ table ไม่มี
```

## Database Setup (ถ้าจำเป็น)

หากยังไม่มี Database tables:

```sql
-- Create consent_records table
CREATE TABLE IF NOT EXISTS consent_records (
    id SERIAL PRIMARY KEY,
    title VARCHAR(20) NOT NULL,
    name_surname VARCHAR(255) NOT NULL,
    id_passport VARCHAR(50) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    consent_type VARCHAR(50),
    consent_language VARCHAR(10),
    consent_version VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consent_versions table  
CREATE TABLE IF NOT EXISTS consent_versions (
    id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    language VARCHAR(10),
    description TEXT,
    file_path VARCHAR(500),
    file_size INTEGER,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

-- Create version_targeting table
CREATE TABLE IF NOT EXISTS version_targeting (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50),
    id_passport VARCHAR(50),
    consent_version_id INTEGER REFERENCES consent_versions(id),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);
```

## Expected Result
✅ Form submit สำเร็จ (Status 201)
✅ ไม่มี Error 400
✅ ข้อมูลบันทึกลง Database
✅ แสดงหน้า Success พร้อมหมายเลขอ้างอิง
