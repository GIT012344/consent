# Test Consent Flow System

## ทดสอบการทำงานของระบบ Consent ตามประเภทผู้ใช้

### 1. Customer Type (ลูกค้า)
**ลักษณะการทำงาน:** ต้องเลือกภาษาก่อนเข้าใช้งาน

#### Test Cases:
1. **ลิงก์หลัก (ไม่ระบุภาษา)**
   - URL: `http://localhost:3001/consent/customer`
   - ผลที่คาดหวัง: แสดงหน้าเลือกภาษา (ไทย/English)
   - หลังเลือกภาษา: ไปหน้ากรอกข้อมูลส่วนตัว

2. **ลิงก์ภาษาไทย (ระบุภาษา)**
   - URL: `http://localhost:3001/consent/customer?lang=th`
   - ผลที่คาดหวัง: ข้ามหน้าเลือกภาษา ไปหน้ากรอกข้อมูลเลย (ภาษาไทย)

3. **ลิงก์ภาษาอังกฤษ (ระบุภาษา)**
   - URL: `http://localhost:3001/consent/customer?lang=en`
   - ผลที่คาดหวัง: ข้ามหน้าเลือกภาษา ไปหน้ากรอกข้อมูลเลย (English)

### 2. Employee Type (พนักงาน)
**ลักษณะการทำงาน:** ไม่ต้องเลือกภาษา ใช้ภาษาจาก URL

#### Test Cases:
1. **ลิงก์ภาษาไทย**
   - URL: `http://localhost:3001/consent/employee?lang=th`
   - ผลที่คาดหวัง: ไปหน้ากรอกข้อมูลเลย (ภาษาไทย) ไม่มีหน้าเลือกภาษา

2. **ลิงก์ภาษาอังกฤษ**
   - URL: `http://localhost:3001/consent/employee?lang=en`
   - ผลที่คาดหวัง: ไปหน้ากรอกข้อมูลเลย (English) ไม่มีหน้าเลือกภาษา

### 3. Partner Type (พาร์ทเนอร์)
**ลักษณะการทำงาน:** ไม่ต้องเลือกภาษา ใช้ภาษาจาก URL

#### Test Cases:
1. **ลิงก์ภาษาไทย**
   - URL: `http://localhost:3001/consent/partner?lang=th`
   - ผลที่คาดหวัง: ไปหน้ากรอกข้อมูลเลย (ภาษาไทย) ไม่มีหน้าเลือกภาษา

2. **ลิงก์ภาษาอังกฤษ**
   - URL: `http://localhost:3001/consent/partner?lang=en`
   - ผลที่คาดหวัง: ไปหน้ากรอกข้อมูลเลย (English) ไม่มีหน้าเลือกภาษา

## ขั้นตอนการทดสอบ

### Step 1: เตรียมข้อมูล Policy
1. สร้าง Policy สำหรับแต่ละ userType และภาษา
2. ใช้หน้า Admin > สร้าง Policy (`http://localhost:3001/admin/create-policy`)

### Step 2: ดูลิงก์ที่สร้างขึ้น
1. ไปที่หน้า Admin > Consent Links (`http://localhost:3001/admin/links`)
2. จะเห็นลิงก์สำหรับแต่ละประเภทผู้ใช้
3. คัดลอกลิงก์ไปทดสอบ

### Step 3: ทดสอบแต่ละลิงก์
1. เปิดลิงก์ในหน้าต่าง Incognito/Private
2. ตรวจสอบว่าแสดงผลตามที่คาดหวัง
3. กรอกข้อมูลและส่ง consent

## สิ่งที่ต้องตรวจสอบ

### UI Elements:
- [ ] Customer: มีหน้าเลือกภาษาเมื่อไม่ระบุ lang parameter
- [ ] Customer: ข้ามหน้าเลือกภาษาเมื่อระบุ lang parameter
- [ ] Employee/Partner: ไม่มีหน้าเลือกภาษาเลย
- [ ] ปุ่ม Back ในหน้ากรอกข้อมูล: แสดงเฉพาะ Customer type

### Language Display:
- [ ] แสดงข้อความภาษาไทยเมื่อ lang=th
- [ ] แสดงข้อความ English เมื่อ lang=en
- [ ] Customer สามารถเปลี่ยนภาษาได้หลังเลือกแล้ว

### Policy Content:
- [ ] แสดง Policy ที่ถูกต้องตาม userType
- [ ] แสดง Policy ที่ถูกต้องตามภาษา
- [ ] แสดง fallback message เมื่อไม่มี Policy

### Data Submission:
- [ ] บันทึก userType ที่ถูกต้อง
- [ ] บันทึกภาษาที่ถูกต้อง
- [ ] บันทึก Policy version ที่ถูกต้อง

## Commands สำหรับทดสอบ

```bash
# Start Backend (Port 4000)
cd c:\Users\jchayapol\consent-back
npm run dev

# Start Frontend (Port 3001)
cd c:\Users\jchayapol\consent
npm start

# Access Admin Panel
http://localhost:3001/admin/login

# Access Consent Links Page
http://localhost:3001/admin/links
```

## Expected Results Summary

| User Type | URL | Expected Behavior |
|-----------|-----|-------------------|
| Customer | /consent/customer | Show language selection → Form |
| Customer | /consent/customer?lang=th | Skip to form (Thai) |
| Customer | /consent/customer?lang=en | Skip to form (English) |
| Employee | /consent/employee?lang=th | Direct to form (Thai) |
| Employee | /consent/employee?lang=en | Direct to form (English) |
| Partner | /consent/partner?lang=th | Direct to form (Thai) |
| Partner | /consent/partner?lang=en | Direct to form (English) |
