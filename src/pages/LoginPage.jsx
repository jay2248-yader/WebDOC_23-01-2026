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
