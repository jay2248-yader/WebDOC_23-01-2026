# User Page

## ภาพรวม

หน้าจัดการผู้ใช้งานระบบ — สร้าง User ใหม่, แก้ไขข้อมูล User, และเปลี่ยนรหัสผ่าน
**ไม่รองรับการลบ User** เนื่องจากไม่มี API endpoint สำหรับลบ

---

## ไฟล์ที่เกี่ยวข้อง

```
src/
├── pages/
│   └── UserPage.jsx                        — หน้าหลัก (state + logic ทั้งหมดอยู่ที่นี่)
├── components/users/
│   └── UserFormModal.jsx                   — modal สร้าง/แก้ไข User
├── components/common/
│   ├── GenericToolbar.jsx                  — toolbar (search + ปุ่มสร้าง)
│   ├── GenericDataTable.jsx                — ตารางแสดงข้อมูล + pagination
│   ├── FormModalShell.jsx                  — กรอบ modal + confirm/success dialog
│   └── LoadingDialog.jsx                   — dialog loading ขณะเปิด modal
├── hooks/
│   ├── useFormModal.js                     — จัดการ state/validation/submit ของ form
│   └── useSelectPagination.js              — pagination + search สำหรับ dropdown
├── services/
│   ├── userservice.js                      — API calls (getAll, create, updatePwds)
│   ├── departmentservice.js                — ดึงรายชื่อ Department สำหรับ dropdown
│   ├── positionservice.js                  — ดึงรายชื่อ Position สำหรับ dropdown
│   └── branchservice.js                    — ดึงรายชื่อ Branch สำหรับ dropdown
├── store/
│   ├── authstore.js                        — ดึง username สำหรับ auto-fill createby
│   └── toastStore.js                       — แสดง toast error เมื่อโหลดข้อมูลไม่สำเร็จ
└── api/
    └── endpoints.js                        — USERS.GET_ALL, USERS.NEW, USERS.UPDATEPASS
```

> **หมายเหตุ:** UserPage ไม่ได้ใช้ `useCrudPage` — มี state และ logic เป็นของตัวเองทั้งหมด
> เนื่องจาก search เป็นแบบ manual (กดปุ่มค้นหา) และมี Password Modal พิเศษ

---

## Flow การทำงาน

### โหลดข้อมูล
```
mount / page/pageSize/searchText เปลี่ยน
  ↓
loadUsers({ page, limit, search })
  ↓
userservice.getAllUsers() → GET /api/users/getAllUser
  ↓
setUsers, setTotalItems, setTotalPages
```

### Search
```
user พิมพ์ข้อความ → inputText เปลี่ยน (ยังไม่ค้นหา)
  ↓
กดปุ่มค้นหา → handleSearch()
  ↓
setSearchText(inputText) + setPage(1) → trigger loadUsers ใหม่
```

> ต่างจากหน้าอื่น — search ที่นี่ต้องกดปุ่มก่อน ไม่ใช่ auto-search

### สร้าง User
```
กด "ສ້າງ User" → handleCreateUser()
  ↓
LoadingDialog 500ms → UserFormModal เปิด (mode: create)
  ↓
กรอกฟอร์ม + Submit → handleSubmitUser(formData)
  ↓
createNewUser(formData) → POST /api/users/newUsers
  ↓
สำเร็จ → loadUsers() reload ตาราง
```

### แก้ไข User
```
กด "ແກ້ໄຂ" → handleEditUser(user)
  ↓
LoadingDialog 500ms → UserFormModal เปิด (mode: edit)
  ↓
** ไม่มี API update user ** → form แสดงข้อมูลเดิมแต่ submit ไม่ได้ทำอะไร
```

> **ข้อสังเกต:** `handleSubmitUser` check `if (!editingUser)` ก่อน create — แปลว่า edit mode ไม่ได้ call API ใดๆ

### เปลี่ยนรหัสผ่าน
```
กด "ປ່ຽນລະຫັດ" → openPwdModal(user)
  ↓
Password Modal เปิด (inline ใน UserPage ไม่ใช่ component แยก)
  ↓
พิมพ์รหัสใหม่ + กด "ຢືນຢັນ" (หรือ Enter)
  ↓
handleUpdatePwd() → updatePwds({ usercode, pwds })
  ↓
POST /api/users/updatePwds → สำเร็จ → ปิด modal
```

---

## API

| Action | Method | Endpoint |
|--------|--------|----------|
| ดึงรายชื่อ User | GET | `/api/users/getAllUser` |
| สร้าง User | POST | `/api/users/newUsers` |
| เปลี่ยนรหัสผ่าน | POST | `/api/users/updatePwds` |

**ไม่มี endpoint สำหรับ:** Update User, Delete User

---

## State ใน UserPage

| State | ประเภท | หน้าที่ |
|-------|--------|---------|
| `users` | array | ข้อมูล User ในตาราง |
| `totalItems` | number | จำนวน User ทั้งหมด |
| `totalPages` | number | จำนวนหน้าทั้งหมด |
| `inputText` | string | ข้อความที่พิมพ์ใน search box (ยังไม่ค้นหา) |
| `searchText` | string | ข้อความที่ใช้ค้นหาจริง (หลังกดปุ่ม) |
| `page` | number | หน้าปัจจุบัน |
| `pageSize` | number | จำนวนแถวต่อหน้า |
| `showFormModal` | boolean | แสดง UserFormModal |
| `editingUser` | object/null | User ที่กำลังแก้ไข |
| `isLoading` | boolean | loading ขณะโหลดข้อมูล / เปิด modal |
| `pwdModal` | object | state ของ Password Modal `{ open, user, newPwd, isSubmitting }` |

---

## UserFormModal — Fields

| Field | ประเภท | Create | Edit | Required |
|-------|--------|--------|------|----------|
| usercode | text (alphanumeric) | ✅ | ✅ | ✅ |
| pwds | text | ✅ | ❌ ซ่อน | ✅ (create only) |
| username | text | ✅ | ✅ | ✅ |
| shortname | text | ✅ | ✅ | ❌ |
| gendername | select (ຊາຍ/ຍິງ) | ✅ | ✅ | ✅ |
| departmentid | select (search+paginate) | ✅ | ✅ | ✅ |
| groupappdetailid | text (numeric) | ✅ | ✅ | ✅ |
| positionid | select (search+paginate) | ✅ | ✅ | ✅ |
| createby | text (disabled) | ❌ | ✅ แสดงอย่างเดียว | ✅ |
| ipaddress | text | ✅ | ✅ | ✅ |
| branch | select (search+paginate) | ✅ | ✅ | ✅ |

Dropdown ที่ใช้ `useSelectPagination`: **Department, Position, Branch**

---

## วิธีแก้ไขที่พบบ่อย

**เพิ่ม API Update User**
1. เพิ่ม `USERS.UPDATE` ใน `endpoints.js`
2. เพิ่ม `updateUser(payload)` ใน `userservice.js`
3. แก้ `handleSubmitUser` ใน `UserPage.jsx` เพิ่ม `else await updateUser(...)`

**เปลี่ยน search จาก manual เป็น auto**
แก้ `handleSearchChange` ใน `UserPage.jsx` ให้ `setSearchText(v)` แทน `setInputText(v)`
แล้วลบ `onSearch` prop ออกจาก `GenericToolbar`

**เพิ่ม field ใหม่ในฟอร์ม**
1. เพิ่มใน `initialData` ใน `UserFormModal.jsx`
2. เพิ่ม validation (ถ้าจำเป็น)
3. เพิ่ม `<FormInput>` หรือ `<Select>` ใน form JSX

**เปลี่ยน API endpoint**
แก้ใน `src/api/endpoints.js` ที่ `USERS.*`
