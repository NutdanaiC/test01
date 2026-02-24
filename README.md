# Safety Patrol - ระบบจัดการความเสี่ยงด้านความปลอดภัย

ระบบ Web Application สำหรับบันทึกและติดตามความเสี่ยงด้านความปลอดภัย พร้อมกำหนดผู้รับผิดชอบแก้ไข

## Features

- **บันทึกความเสี่ยง** - เพิ่ม/แก้ไข/ลบ รายการความเสี่ยง พร้อมระดับความรุนแรง (สูง/กลาง/ต่ำ)
- **ผู้รับผิดชอบ** - กำหนดผู้รับผิดชอบแก้ไขแต่ละรายการ
- **ติดตามสถานะ** - ติดตามสถานะ: เปิด / กำลังแก้ไข / แก้ไขแล้ว
- **สรุปข้อมูล** - Dashboard แสดงสถิติความเสี่ยงทั้งหมด
- **ค้นหา & กรอง** - กรองตามระดับ, สถานะ, ผู้รับผิดชอบ

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React.js
- **Testing**: Jest + Supertest

## Project Structure

```
safety-patrol/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app entry point
│   │   ├── routes/risks.js   # REST API routes
│   │   └── data/store.js     # In-memory data store
│   ├── __tests__/
│   │   └── risks.test.js     # API integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styles
│   │   └── api/risksApi.js   # API client
│   └── package.json
└── package.json
```

## Getting Started

### ติดตั้ง Dependencies
```bash
npm run install:all
```

### รัน Backend (Port 3001)
```bash
npm run start:backend
```

### รัน Frontend (Port 3000)
```bash
npm run start:frontend
```

### รัน Tests
```bash
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/risks | ดึงรายการความเสี่ยงทั้งหมด |
| GET | /api/risks/:id | ดึงความเสี่ยงตาม ID |
| POST | /api/risks | สร้างความเสี่ยงใหม่ |
| PUT | /api/risks/:id | อัปเดตความเสี่ยง |
| DELETE | /api/risks/:id | ลบความเสี่ยง |

### Query Parameters (GET /api/risks)
- `level` - กรองตามระดับ: `high`, `medium`, `low`
- `status` - กรองตามสถานะ: `open`, `in_progress`, `resolved`
- `assignee` - ค้นหาตามชื่อผู้รับผิดชอบ

### Risk Object
```json
{
  "id": "uuid",
  "title": "พื้นลื่นในโกดัง",
  "description": "รายละเอียดความเสี่ยง",
  "level": "high",
  "location": "โกดัง A",
  "assignee": "นายสมชาย",
  "status": "open",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```
