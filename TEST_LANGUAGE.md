# ขั้นตอนทดสอบ Language Support และ Version Targeting

## 1. เริ่มต้นระบบ

### Backend (Terminal 1):
```bash
cd consent-back
npm run dev
```

### Frontend (Terminal 2):
```bash
cd consent
npm start
```

## 2. ทดสอบ Language Selector

1. เปิดเว็บไซต์ที่ http://localhost:3001
2. ดูที่ Navbar ด้านบน ควรมี Language Selector (ไอคอนโลก + dropdown)
3. เลือกเปลี่ยนภาษาจาก "ไทย" เป็น "English"
4. ระบบควร reload และแสดงเมนูเป็นภาษาอังกฤษ

## 3. ทดสอบ Consent Form

### ภาษาไทย:
1. เลือกภาษาไทย
2. คลิก "ให้ความยินยอม"
3. กรอกข้อมูล:
   - คำนำหน้า: นาย
   - ชื่อ-นามสกุล: ทดสอบ ระบบ
4. คลิก "ถัดไป"
5. กรอกข้อมูล Step 2:
   - เลขบัตรประชาชน: 1234567890123
   - อีเมล: test@example.com
   - เบอร์โทร: 0812345678
6. ดูเนื้อหา Consent ควรเป็นภาษาไทย

### ภาษาอังกฤษ:
1. เลือกภาษา English
2. คลิก "Give Consent"
3. กรอกข้อมูล:
   - Title: Mr.
   - Name-Surname: Test System
4. คลิก "Next"
5. กรอกข้อมูล Step 2:
   - ID/Passport: PASS123456
   - Email: test@example.com
   - Phone: 0812345678
6. ดูเนื้อหา Consent ควรเป็นภาษาอังกฤษ

## 4. ตรวจสอบ Error Messages

### Error 400:
- หากเกิด Error 400 ตรวจสอบ:
  1. Backend console log ดู error details
  2. Network tab ใน browser ดู request/response
  3. ตรวจสอบว่าส่ง field ครบถ้วน

## 5. Version Targeting Test

1. Login เข้า Admin (/admin)
2. ไปที่ Version Targeting 
3. เพิ่ม Rule ใหม่:
   - Rule Type: เฉพาะบุคคล
   - ID/Passport: 1234567890123
   - Version: เลือก version ที่ต้องการ
4. ทดสอบโดยกรอก ID นี้ในหน้า Consent Form
5. ควรได้ version ตาม targeting rule

## 6. ปัญหาที่อาจพบและวิธีแก้

### ไม่เห็น Language Selector:
- ตรวจสอบว่า Navbar.js มี Globe icon และ select dropdown
- ตรวจสอบ localStorage ว่ามี key 'language'

### Consent ไม่แสดงภาษาที่เลือก:
- ตรวจสอบ ConsentContent.js ว่ามีเนื้อหาทั้ง th และ en
- ตรวจสอบ ConsentForm.js ว่าส่ง language prop ถูกต้อง

### Error 400 เมื่อ submit:
- ตรวจสอบ Backend validation rules
- ดู console.log ที่ Backend
- ตรวจสอบ field names ที่ส่งไป

### Version Targeting ไม่ทำงาน:
- ตรวจสอบ database table: version_targeting
- ตรวจสอบ API endpoint: /api/consent/targeted-version/:id
- ดู console.log ที่ Backend

## 7. Expected Results

✅ Language Selector แสดงใน Navbar
✅ เปลี่ยนภาษาได้และ UI update ตามภาษา
✅ Consent Content แสดงตามภาษาที่เลือก
✅ Submit form สำเร็จไม่มี Error 400
✅ Version Targeting ทำงานถูกต้อง
✅ ข้อมูลบันทึกลง Database พร้อม language และ version
