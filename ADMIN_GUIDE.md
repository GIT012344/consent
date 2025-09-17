# 📘 คู่มือการใช้งานระบบ Admin - Consent Management System

## 🚀 การเริ่มต้นใช้งาน

### 1. เริ่มต้นระบบ Backend และ Frontend

```bash
# Terminal 1 - Backend Server (Port 4000)
cd c:\Users\jchayapol\consent-back
npm run dev

# Terminal 2 - Frontend Application (Port 3000)
cd c:\Users\jchayapol\consent
npm start
```

## 📍 เส้นทางหน้า Admin

### หน้าหลักสำหรับ Admin:
- **Admin Dashboard**: http://localhost:3000/admin
- **จัดการคำนำหน้า**: http://localhost:3000/admin/titles
- **จัดการ Form Fields**: http://localhost:3000/admin/form-fields
- **จัดการเนื้อหา Consent**: http://localhost:3000/admin/consent-versions

## 🎯 ฟีเจอร์หลักของ Admin

### 1. การจัดการคำนำหน้า (Titles)
- **เพิ่มคำนำหน้าใหม่**: กดปุ่ม "เพิ่มคำนำหน้า" และกรอกข้อมูลภาษาไทย/อังกฤษ
- **แก้ไข**: คลิกไอคอนดินสอบนรายการที่ต้องการแก้ไข
- **ลบ**: คลิกไอคอนถังขยะ (ระวัง: ไม่สามารถกู้คืนได้)
- **ผลกระทบ**: คำนำหน้าที่เพิ่มจะแสดงในหน้าลูกค้าทันที

### 2. การจัดการ Form Fields แบบ Dynamic
- **สร้างฟิลด์ใหม่**: 
  - กำหนดชื่อฟิลด์ (field_name) - ใช้ภาษาอังกฤษ snake_case
  - ตั้งค่า Label ภาษาไทย/อังกฤษ
  - เลือกประเภท: text, email, phone, date, select
  - กำหนดว่าบังคับกรอกหรือไม่ (is_required)
  - เปิด/ปิดการใช้งาน (is_active)
- **ผลกระทบ**: ฟิลด์ที่ active จะแสดงในหน้ากรอกข้อมูลลูกค้าทันที

### 3. การจัดการเนื้อหา Consent
- **สร้างเวอร์ชันใหม่**:
  - เลือกประเภทผู้ใช้: customer, employee, partner
  - เลือกภาษา: th, en
  - กำหนดเวอร์ชัน (เช่น 1.0, 1.1, 2.0)
  - เขียนเนื้อหา HTML หรือ Plain Text
- **การ Targeting**: ระบบจะเลือกเนื้อหาตาม userType และ language อัตโนมัติ

## 📊 Dashboard Features

### สถิติที่แสดง:
- จำนวนความยินยอมทั้งหมด
- จำนวนความยินยอมวันนี้
- แยกตามประเภทผู้ใช้
- กราฟแสดงแนวโน้ม

### การ Export ข้อมูล:
- **Excel**: กดปุ่ม "Export Excel" 
- **CSV**: กดปุ่ม "Export CSV"
- **ข้อมูลที่ Export**: ชื่อ, เลขบัตร, ประเภท, วันที่, เวอร์ชัน

## 🔄 Flow การทำงานกับลูกค้า

1. **ลูกค้าเข้าหน้า Consent Flow**
2. **เลือกภาษา** → ระบบจะใช้ภาษานี้ตลอด
3. **เลือกประเภทผู้ใช้** → ระบบจะโหลดเนื้อหาที่เหมาะสม
4. **กรอกข้อมูล**:
   - คำนำหน้า (จาก Admin Titles)
   - ชื่อ-นามสกุล
   - เลขบัตรประชาชน/พาสปอร์ต
   - Dynamic Fields (จาก Admin Form Fields)
5. **แสดงเนื้อหา Consent** → ตาม userType + language
6. **บันทึกข้อมูล** → เก็บใน Database

## 🎨 การปรับแต่ง UI

### Theme Colors:
- Primary: Blue → Purple gradient
- Success: Green → Teal gradient  
- Danger: Red tones
- Background: Blue → Purple → Pink gradient

### Responsive Design:
- ✅ Desktop (1920x1080)
- ✅ Tablet (768px)
- ✅ Mobile (375px)
- ✅ iPhone/Android compatible

## 🛠️ Troubleshooting

### ปัญหาที่พบบ่อย:

**1. Backend Connection Refused**
```bash
# ตรวจสอบว่า backend ทำงานที่ port 4000
cd c:\Users\jchayapol\consent-back
npm run dev
```

**2. ข้อมูลไม่อัพเดท**
- Refresh หน้าเว็บ (F5)
- Clear browser cache
- ตรวจสอบ Network tab ใน DevTools

**3. ไม่สามารถบันทึกข้อมูลได้**
- ตรวจสอบ Database connection
- ดู console log ใน backend terminal
- ตรวจสอบ validation rules

## 📝 Database Tables

### ตารางหลัก:
- `consent_titles` - คำนำหน้า
- `consent_form_fields` - Dynamic form fields
- `consent_versions` - เนื้อหา consent แต่ละเวอร์ชัน
- `consent_records` - บันทึกความยินยอม
- `consent_history` - ประวัติการให้ความยินยอม

## 🔐 Security Notes

- ข้อมูลเลขบัตรประชาชนถูกเข้ารหัสใน database
- มี rate limiting ป้องกัน spam
- CORS configured สำหรับ localhost
- Input validation ทั้ง frontend และ backend

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:
1. ตรวจสอบ console log ทั้ง browser และ terminal
2. ดู error message ที่แสดง
3. ตรวจสอบการเชื่อมต่อ database
4. Restart ทั้ง backend และ frontend

---
*Version 1.0 - Updated: August 2025*
