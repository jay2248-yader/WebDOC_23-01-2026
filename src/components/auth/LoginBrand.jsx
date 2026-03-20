import logo from "../../assets/Logo/CSC_LOGO_HD.webp";

export default function LoginBrand() {
  return (
    <div className="flex flex-col justify-center items-center text-white">
      <img
        src={logo}
        alt="CSC Logo"
        width="192"
        height="192"
        decoding="async"
        className="w-48 h-48 object-contain mb-8"
      />
      <h2 className="text-4xl font-extrabold text-center">
        ລະບົບເອກະສານ
      </h2>
    </div>
  );
}
