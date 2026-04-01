/**
 * LoginPage
 *
 * หน้า Login ของระบบ — ประกอบด้วย 2 ส่วนหลัก:
 *   - LoginBrand  : โลโก้ + ชื่อระบบ (ฝั่งซ้าย)
 *   - LoginForm   : ฟอร์มกรอก Employee ID + Password (ฝั่งขวา)
 *
 * Layout ถูกจัดการโดย AuthLayout (2 คอลัมน์, glass-morphism background)
 * ถ้าต้องการเพิ่ม element ใหม่ใน login screen ให้เพิ่มใน AuthLayout หรือสร้าง component ใหม่แล้ววางตรงนี้
 */
import AuthLayout from "../components/auth/AuthLayout";
import LoginBrand from "../components/auth/LoginBrand";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginBrand />
      <LoginForm />
    </AuthLayout>
  );
}
