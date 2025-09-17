# 🔧 วิธีแก้ไขปัญหา "กรุณาเลือกประเภทผู้ใช้และภาษาก่อน"

## ปัญหาที่พบ
เมื่อเข้าหน้า Consent Form แล้วไม่แสดงเนื้อหา policy ที่สร้างไว้ แต่ขึ้นข้อความ "กรุณาเลือกประเภทผู้ใช้และภาษาก่อน"

## สาเหตุ
Backend ไม่มี policy content ที่สร้างไว้ในระบบ ทำให้ API ส่งค่าว่างกลับมา

## วิธีแก้ไข

### 1. เริ่ม Backend Server
```bash
cd c:\Users\jchayapol\consent-back
node consent-server.js
```

### 2. สร้าง Policy Content
เปิด terminal ใหม่และรันคำสั่ง:

```bash
cd c:\Users\jchayapol\consent-back

# สร้าง Policy ภาษาไทยสำหรับลูกค้า
curl -X POST http://localhost:3000/api/simple-policy -H "Content-Type: application/json" -d "{\"version\":\"2.0\",\"language\":\"th-TH\",\"userType\":\"customer\",\"title\":\"นโยบายความเป็นส่วนตัว\",\"content\":\"<h2>นโยบายความเป็นส่วนตัว</h2><p>บริษัทให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน</p><h3>1. ข้อมูลที่เราเก็บรวบรวม</h3><ul><li>ชื่อ-นามสกุล</li><li>เลขบัตรประชาชน/พาสปอร์ต</li><li>อีเมล</li><li>เบอร์โทรศัพท์</li></ul><h3>2. วัตถุประสงค์การใช้ข้อมูล</h3><p>เราใช้ข้อมูลของท่านเพื่อ:</p><ul><li>ให้บริการตามที่ท่านร้องขอ</li><li>ปรับปรุงคุณภาพการบริการ</li><li>ติดต่อสื่อสารกับท่าน</li></ul><h3>3. การรักษาความปลอดภัย</h3><p>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของท่าน</p>\"}"

# สร้าง Policy ภาษาอังกฤษสำหรับลูกค้า
curl -X POST http://localhost:3000/api/simple-policy -H "Content-Type: application/json" -d "{\"version\":\"2.0\",\"language\":\"en-US\",\"userType\":\"customer\",\"title\":\"Privacy Policy\",\"content\":\"<h2>Privacy Policy</h2><p>We value your privacy and are committed to protecting your personal information.</p><h3>1. Information We Collect</h3><ul><li>Name and Surname</li><li>ID/Passport Number</li><li>Email</li><li>Phone Number</li></ul><h3>2. How We Use Your Information</h3><p>We use your information to:</p><ul><li>Provide requested services</li><li>Improve service quality</li><li>Communicate with you</li></ul><h3>3. Data Security</h3><p>We implement appropriate security measures to protect your information.</p>\"}"

# สร้าง Policy สำหรับพนักงาน
curl -X POST http://localhost:3000/api/simple-policy -H "Content-Type: application/json" -d "{\"version\":\"1.0\",\"language\":\"th-TH\",\"userType\":\"employee\",\"title\":\"นโยบายสำหรับพนักงาน\",\"content\":\"<h2>นโยบายความเป็นส่วนตัวสำหรับพนักงาน</h2><p>ข้อมูลพนักงานจะถูกใช้เพื่อการบริหารงานบุคคลและการปฏิบัติตามกฎหมายแรงงานเท่านั้น</p>\"}"
```

### 3. ทดสอบระบบ

เปิดเบราว์เซอร์และเข้าไปที่:

#### ลิงค์สำหรับลูกค้า (Customer)
- **ภาษาไทย**: http://localhost:3003/consent/customer?lang=th
- **ภาษาอังกฤษ**: http://localhost:3003/consent/customer?lang=en

#### ลิงค์สำหรับพนักงาน (Employee)
- **ภาษาไทย**: http://localhost:3003/consent/employee?lang=th

### 4. ขั้นตอนการใช้งาน
1. เข้าลิงค์ด้านบน
2. กรอกชื่อ-นามสกุล
3. กรอกเลขบัตรประชาชน (13 หลัก) หรือ Passport
4. คลิก "ถัดไป"
5. **ตอนนี้จะเห็นเนื้อหา Policy ที่สร้างไว้แล้ว** ✅
6. ติ๊กยอมรับเงื่อนไข
7. คลิก "ยอมรับ"

## สิ่งที่แก้ไขแล้ว
✅ Backend เก็บ policy content ในหน่วยความจำ (in-memory storage)
✅ API `/api/simple-policy/active` ส่ง policy content ที่ถูกต้องตาม userType และ language
✅ Frontend แสดง policy content ที่ดึงมาจาก backend
✅ รองรับหลายภาษาและหลายประเภทผู้ใช้

## หมายเหตุ
- Policy จะหายเมื่อ restart backend server (เพราะเก็บใน memory)
- ถ้าต้องการเก็บถาวร ต้องใช้ database จริง
- สามารถสร้าง policy เพิ่มได้ตลอดเวลาผ่าน API
