import bg from "../../assets/blackguard/bg.svg";

export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="relative w-[90%] max-w-4xl rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {children}
      </div>
    </div>
  );
}
