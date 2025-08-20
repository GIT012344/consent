# Consent Management System - Frontend

ระบบจัดการความยินยอมในการใช้ข้อมูลส่วนบุคคล (PDPA Compliance)

## 🚀 Features

- **ให้ความยินยอม**: ฟอร์มสำหรับกรอกข้อมูลและให้ความยินยอม
- **ตรวจสอบข้อมูล**: ค้นหาและตรวจสอบสถานะความยินยอม
- **จัดการข้อมูล**: Dashboard สำหรับผู้ดูแลระบบ
- **Export ข้อมูล**: Export เป็น Excel และ CSV
- **Responsive Design**: รองรับทุกขนาดหน้าจอ
- **Multi-language**: รองรับภาษาไทยและอังกฤษ

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## 📦 Installation

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables (Optional)
สร้างไฟล์ `.env` ในโฟลเดอร์ root:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### 3. รันแอปพลิเคชัน
```bash
# Development mode
npm start

# Build for production
npm run build
```

แอปพลิเคชันจะรันที่: http://localhost:3001

## 🔗 Backend Integration

แอปพลิเคชันนี้เชื่อมต่อกับ Backend API ที่รันอยู่ที่ `http://localhost:3000`

### API Endpoints ที่ใช้:
- `POST /api/consent/submit` - ส่งข้อมูลความยินยอม
- `GET /api/consent/check/:id` - ตรวจสอบข้อมูลความยินยอม
- `GET /api/consent/list` - ดึงรายการข้อมูลทั้งหมด (Admin)
- `GET /api/consent/stats` - สถิติข้อมูล
- `GET /api/export/excel` - Export Excel
- `GET /api/export/csv` - Export CSV

## 📱 Pages

### 1. หน้าให้ความยินยอม (`/`)
- ฟอร์มกรอกข้อมูลส่วนบุคคล
- ตรวจสอบข้อมูลซ้ำอัตโนมัติ
- แสดงข้อความความยินยอมตามภาษาที่เลือก
- Validation ข้อมูลครบถ้วน

### 2. หน้าตรวจสอบข้อมูล (`/check`)
- ค้นหาด้วยเลขบัตรประชาชน/Passport
- แสดงรายละเอียดความยินยอม
- ข้อมูลการติดต่อสำหรับถอนความยินยอม

### 3. หน้าจัดการข้อมูล (`/admin`)
- Dashboard สำหรับผู้ดูแลระบบ
- สถิติและกราฟข้อมูล
- ตัวกรองและค้นหาข้อมูล
- Export ข้อมูลเป็น Excel/CSV
- Pagination สำหรับข้อมูลจำนวนมาก

## 🎨 UI/UX Features

- **Modern Design**: ใช้ Tailwind CSS สำหรับ UI ที่สวยงาม
- **Responsive**: รองรับ Mobile, Tablet, Desktop
- **Accessibility**: ปฏิบัติตาม Web Accessibility Guidelines
- **Loading States**: แสดงสถานะการโหลดข้อมูล
- **Error Handling**: จัดการ Error และแสดงข้อความที่เข้าใจง่าย
- **Form Validation**: ตรวจสอบข้อมูลแบบ Real-time

## 🔒 Security Features

- **Input Validation**: ตรวจสอบข้อมูลก่อนส่งไป Backend
- **XSS Protection**: ป้องกัน Cross-site Scripting
- **CORS Handling**: จัดการ Cross-Origin Requests อย่างปลอดภัย
- **Error Sanitization**: ไม่แสดงข้อมูลสำคัญใน Error Messages

## 📊 Data Validation

### เลขบัตรประชาชนไทย
- ตรวจสอบรูปแบบ 13 หลัก
- คำนวณเลขตรวจสอบ (Check Digit)

### Passport Number
- รองรับรูปแบบสากล (6-9 ตัวอักษร)
- ตัวอักษรและตัวเลข

## 🌐 Internationalization

- **ภาษาไทย**: UI และข้อความทั้งหมด
- **ภาษาอังกฤษ**: รองรับการเปลี่ยนภาษา
- **Date Formatting**: จัดรูปแบบวันที่ตามภาษา

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `build/` สามารถ deploy ไปยัง:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## 🐛 Troubleshooting

### ปัญหาที่อาจเจอ:

1. **CORS Error**
   - ตรวจสอบ Backend API ทำงานที่ port 3000
   - ตรวจสอบ CORS configuration ใน Backend

2. **API Connection Failed**
   - ตรวจสอบ Backend server ทำงานหรือไม่
   - ตรวจสอบ URL ใน environment variables

3. **Build Error**
   - ลบ `node_modules` และ `package-lock.json`
   - รัน `npm install` ใหม่

## 📞 Support

หากมีปัญหาหรือข้อสงสัย:
- Email: developer@company.com
- เอกสาร API: ดูไฟล์คำแนะนำจาก Backend team

## 📄 License

Copyright © 2024 Consent Management System. All rights reserved.

---

**Frontend พร้อมใช้งานแล้ว! 🎉**

รันคำสั่ง `npm start` เพื่อเริ่มต้นใช้งาน
