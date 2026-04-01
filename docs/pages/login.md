# Login Page

## ภาพรวม

หน้าเข้าสู่ระบบ รับ Employee ID และ Password แล้ว call API เพื่อยืนยันตัวตน
เมื่อสำเร็จจะเก็บ token และ redirect ไปหน้า Dashboard

---

## ไฟล์ที่เกี่ยวข้อง

```
src/
├── pages/
│   └── LoginPage.jsx              — entry point ของหน้า login
├── components/auth/
│   ├── AuthLayout.jsx             — layout กรอบนอก (background + card)
│   ├── LoginBrand.jsx             — โลโก้ + ชื่อระบบ (ฝั่งซ้าย)
│   └── LoginForm.jsx              — ฟอร์มกรอก ID + Password (ฝั่งขวา)
├── hooks/
│   └── useLogin.js                — logic ทั้งหมด (validation, API, state)
├── services/
│   └── authservice.js             — call POST /api/users/loginUser
└── store/
    └── authstore.js               — เก็บ token + user ใน Zustand (persist localStorage)
```

---

## Flow การทำงาน

```
user กรอก employeeId + password
        ↓
กด "ເຂົ້າສູ່ລະບົບ"
        ↓
LoginForm — e.preventDefault()
        ↓
useLogin.handleSubmit()
  ├─ validate: employeeId และ password ห้ามว่าง
  ├─ ถ้า invalid → แสดง fieldErrors ใต้แต่ละ input, หยุด
  └─ ถ้า valid → call authservice.loginUser({ usercode, pwds })
                        ↓
              POST /api/users/loginUser
                        ↓
          ┌─ สำเร็จ (200) ──────────────────────────────────┐
          │  setAuth(userData)                               │
          │  Zustand เก็บ token + user → persist localStorage│
          │  return true → LoginForm navigate('/dashboard')  │
          └──────────────────────────────────────────────────┘
          ┌─ ไม่สำเร็จ ──────────────────────────────────────┐
          │  setError("ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ") │
          │  แสดง error message บนฟอร์ม                     │
          │  return false                                    │
          └──────────────────────────────────────────────────┘
```

---

## API

**Endpoint:** `POST /api/users/loginUser`

**Request body:**
```json
{ "usercode": "111198", "pwds": "1234" }
```

**Response (สำเร็จ):**
```json
{
  "success": true,
  "statuscode": 200,
  "message": "...",
  "data_id": { "token": "...", "...": "user profile fields" }
}
```

`authservice.js` คืนแค่ `data_id` ให้ `useLogin` → `setAuth(userData)` เก็บลง Zustand

---

## State ใน useLogin

| State | ประเภท | หน้าที่ |
|-------|--------|---------|
| `employeeId` | string | ค่าใน input Employee ID |
| `password` | string | ค่าใน input Password |
| `showPassword` | boolean | toggle แสดง/ซ่อน password |
| `loading` | boolean | true ขณะ call API → ปุ่ม disable |
| `error` | string | error จาก API แสดงบนฟอร์ม |
| `fieldErrors` | object | validation error แยกต่อ field |

---

## Error Messages

| กรณี | ข้อความที่แสดง | ตำแหน่ง |
|------|--------------|---------|
| ไม่กรอก Employee ID | "ກະລຸນາປ້ອນລະຫັດພະນັກງານ" | ใต้ช่อง Employee ID |
| ไม่กรอก Password | "ກະລຸນາປ້ອນລະຫັດຜ່ານ" | ใต้ช่อง Password |
| รหัสผ่านผิด / ไม่มี user | "ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" | บนฟอร์ม (ErrorMessage) |

ถ้าต้องการเปลี่ยนข้อความ → แก้ใน `useLogin.js`

---

## Input Validation

| Field | กฎ |
|-------|----|
| Employee ID | ห้ามว่าง, alphanumeric เท่านั้น, max 20 ตัวอักษร |
| Password | ห้ามว่าง, alphanumeric เท่านั้น, max 20 ตัวอักษร |

กด `Enter` ที่ช่อง Employee ID → focus ย้ายไปช่อง Password อัตโนมัติ

---

## วิธีแก้ไขที่พบบ่อย

**เปลี่ยนโลโก้**
แทนที่ไฟล์ `src/assets/Logo/CSC_LOGO_HD.webp`

**เปลี่ยน background**
แก้ไฟล์ `src/assets/blackguard/bg.svg`

**เปลี่ยนชื่อระบบ**
แก้ `<h2>` ใน `LoginBrand.jsx`

**เปลี่ยนหน้า redirect หลัง login**
แก้ `navigate('/dashboard')` ใน `LoginForm.jsx`

**เพิ่ม field ใหม่ในฟอร์ม**
1. เพิ่ม state ใน `useLogin.js`
2. เพิ่ม validation ใน `handleSubmit`
3. เพิ่ม `<FormInput>` ใน `LoginForm.jsx`
4. เพิ่ม field ใน payload ที่ส่งไป `loginUser()`

**เปลี่ยน API endpoint**
แก้ `ENDPOINTS.AUTH.LOGIN` ใน `src/api/endpoints.js`
