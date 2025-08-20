# คู่มือ Path Routing ระบบ Consent Management

## 🎯 ภาพรวมระบบ
ระบบแบ่งเป็น 2 ส่วนหลัก:
1. **Customer Side** - สำหรับผู้ใช้ทั่วไปให้ความยินยอม
2. **Admin Side** - สำหรับผู้ดูแลระบบจัดการข้อมูล

---

## 📱 Customer Routes (ผู้ใช้ทั่วไป)

### 1. **หน้าแรก** (`/`)
- **Component**: `LandingPage`
- **คำอธิบาย**: หน้าต้อนรับแสดงข้อมูลเบื้องต้น
- **ปุ่ม/การนำทาง**:
  - "เริ่มต้นใช้งาน" → ไปหน้า `/register`
  - "ให้ความยินยอม" (Navbar) → ไปหน้า `/register`

### 2. **ลงทะเบียนเบื้องต้น** (`/register`)
- **Component**: `InitialRegistration`
- **คำอธิบาย**: กรอกข้อมูลพื้นฐาน (ชื่อ-นามสกุล, คำนำหน้า)
- **Flow**:
  1. กรอกชื่อ-นามสกุล
  2. เลือกคำนำหน้าชื่อ
  3. เลือกภาษา (TH/EN)
  4. กด "ถัดไป" → ไปหน้า `/consent`
- **ข้อมูลที่บันทึก**: เก็บใน localStorage (`userData`)

### 3. **แบบฟอร์มให้ความยินยอม** (`/consent`)
- **Component**: `ConsentForm`
- **คำอธิบาย**: กรอกข้อมูลเพิ่มเติมและยืนยันความยินยอม
- **ข้อมูลที่ต้องกรอก**:
  - เลขบัตรประชาชน/พาสปอร์ต
  - อีเมล
  - เบอร์โทรศัพท์
  - ✅ ติ๊กยอมรับเงื่อนไข
- **การทำงาน**:
  1. ดึงข้อมูลจาก localStorage (จาก `/register`)
  2. แสดงเนื้อหา Consent Version ปัจจุบัน
  3. Submit → บันทึกลงฐานข้อมูล
  4. แจ้งผลสำเร็จ/ผิดพลาด
- **Error Cases**:
  - 409 Conflict: มี consent อยู่แล้ว
    - Version เดียวกัน → แจ้งเตือน, แสดงข้อมูลเดิม
    - Version ต่างกัน → อนุญาต re-consent

---

## 🔐 Admin Routes (ผู้ดูแลระบบ)

### 4. **Admin Login** (`/admin/login`)
- **Component**: `AdminLogin`
- **คำอธิบาย**: หน้า login สำหรับ admin
- **Default Credentials**:
  - Username: `admin`
  - Password: `admin123`
- **หลัง Login สำเร็จ** → ไปหน้า `/admin/dashboard`

### 5. **Admin Dashboard** (`/admin/dashboard`)
- **Component**: `AdminDashboard`
- **Layout**: `AdminLayout` (มี sidebar)
- **คำอธิบาย**: หน้าหลักแสดงสถิติ
- **ข้อมูลที่แสดง**:
  - จำนวน consent ทั้งหมด
  - consent วันนี้
  - consent เดือนนี้
  - กราฟแนวโน้ม
- **Menu ใน Sidebar**:
  - "Dashboard" → `/admin/dashboard`
  - "Consent Records" → `/admin/consents`
  - "Consent Versions" → `/admin/consent-versions`
  - "Version Targeting" → `/admin/version-targeting`

### 6. **Consent Records** (`/admin/consents`)
- **Component**: `AdminDashboard` (แท็บ Consents)
- **คำอธิบาย**: ดูรายการ consent ทั้งหมด
- **Features**:
  - ค้นหาด้วยชื่อ/เลขบัตร
  - Filter ตามวันที่
  - Export Excel
  - ดูรายละเอียด consent

### 7. **Consent Versions** (`/admin/consent-versions`)
- **Component**: `ConsentVersions`
- **คำอธิบาย**: จัดการเวอร์ชันเอกสาร consent
- **Features**:
  - อัพโหลดเวอร์ชันใหม่ (PDF)
  - เปิด/ปิดการใช้งานเวอร์ชัน
  - ดาวน์โหลดไฟล์
  - ดูจำนวนการใช้งาน
- **ปุ่ม**:
  - "อัพโหลดเวอร์ชันใหม่" → เปิด Modal upload
  - "ดาวน์โหลด" → ดาวน์โหลด PDF
  - "Toggle" → เปิด/ปิดเวอร์ชัน

### 8. **Version Targeting** (`/admin/version-targeting`)
- **Component**: `ConsentVersionTargeting`
- **คำอธิบาย**: กำหนดกฎการแสดง consent version
- **Features**:
  - สร้างกฎการ targeting
  - กำหนดเงื่อนไข (อายุ, ภาษา, ประเภทลูกค้า)
  - จัดลำดับความสำคัญ

---

## 🔄 การ Navigate ระหว่างหน้า

### User Flow ปกติ:
```
1. / (Landing Page)
   ↓ คลิก "เริ่มต้นใช้งาน"
2. /register (Initial Registration)
   ↓ กรอกข้อมูล + คลิก "ถัดไป"
3. /consent (Consent Form)
   ↓ Submit
   ✅ Success Message
```

### Admin Flow:
```
1. /admin/login
   ↓ Login สำเร็จ
2. /admin/dashboard
   ↓ เลือกเมนู Sidebar
3. /admin/consent-versions (จัดการเวอร์ชัน)
   หรือ
   /admin/consents (ดูข้อมูล consent)
   หรือ
   /admin/version-targeting (ตั้งค่ากฎ)
```

---

## 🛠️ Protected Routes

### Customer Side:
- `/consent` - ต้องผ่าน `/register` ก่อน (ตรวจสอบ localStorage)

### Admin Side:
- ทุก route ที่ขึ้นต้นด้วย `/admin/*` (ยกเว้น `/admin/login`)
- ตรวจสอบ `adminToken` ใน localStorage
- ถ้าไม่มี token → redirect ไป `/admin/login`

---

## 📝 State Management

### localStorage Keys:
- `userData` - ข้อมูลผู้ใช้จาก registration
- `language` - ภาษาที่เลือก (th/en)
- `adminToken` - token สำหรับ admin
- `adminUser` - ข้อมูล admin user

### Session Flow:
1. **User Session**: ข้อมูลอยู่ใน localStorage ระหว่าง register → consent
2. **Admin Session**: ใช้ JWT token เก็บใน localStorage

---

## 🔗 API Endpoints ที่เกี่ยวข้อง

### Customer APIs:
- `POST /api/consent/submit` - ส่งข้อมูล consent
- `GET /api/consent/active-version` - ดึง version ปัจจุบัน
- `GET /api/consent/check/:idPassport` - ตรวจสอบ consent
- `GET /api/consent/history/:idPassport` - ดูประวัติ consent

### Admin APIs:
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - ดึงสถิติ
- `GET /api/consent/records` - ดึงรายการ consent
- `GET /api/consent/versions` - ดึง consent versions
- `POST /api/consent/versions` - อัพโหลด version ใหม่
- `PUT /api/consent/versions/:id` - อัพเดท version
- `GET /api/consent/versions/:id/download` - ดาวน์โหลดไฟล์

---

## 🎨 UI Components Structure

```
App.js
├── Customer Layout
│   ├── Navbar (แสดงทุกหน้า customer)
│   └── Routes
│       ├── LandingPage
│       ├── InitialRegistration
│       └── ConsentForm
└── Admin Layout
    ├── AdminSidebar (แสดงทุกหน้า admin)
    ├── AdminHeader
    └── Routes
        ├── AdminDashboard
        ├── ConsentVersions
        └── ConsentVersionTargeting
```

---

## ⚠️ หมายเหตุสำคัญ

1. **Re-consent**: ระบบรองรับการให้ consent ซ้ำเมื่อมี version ใหม่
2. **Language**: ภาษาเก็บทั้งใน userData และ localStorage แยก
3. **Version Control**: สามารถมีหลาย version พร้อมกัน แต่ active ได้ version เดียว
4. **Error Handling**: จัดการ 409 Conflict สำหรับ duplicate consent
5. **Security**: Admin routes ทั้งหมดต้องผ่านการ authenticate
