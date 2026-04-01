import { memo } from "react";
import Button from "./Button";
import FormInput from "./FormInput";
import search from "../../assets/icon/search.svg";

/**
 * GenericToolbar
 *
 * Toolbar มาตรฐานที่ทุกหน้า CRUD ใช้ร่วมกัน ประกอบด้วย:
 *   - Search input (ซ้าย) — กด Enter หรือคลิก icon แว่นขยายเพื่อค้นหา
 *   - ปุ่มสร้าง (ขวา) — เรียก onCreate
 *   - extraButtons (optional) — ปุ่มเพิ่มเติมระหว่าง search กับปุ่มสร้าง
 *
 * Search mode:
 *   - ถ้าส่ง onSearch → search แบบ manual (กด Enter หรือคลิก icon)
 *   - ถ้าไม่ส่ง onSearch → search อัตโนมัติทุกครั้งที่พิมพ์ (ผ่าน onSearchChange)
 *
 * ถ้าต้องการเพิ่มปุ่มพิเศษ → ส่งผ่าน extraButtons prop
 */
function GenericToolbar({
  searchText,
  onSearchChange,
  onSearch,
  onCreate,
  searchPlaceholder = "ຄົ້ນຫາ",
  createButtonText = "ສ້າງ",
  createButtonIcon = null,
  extraButtons = null,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) onSearch();
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-md">
        <FormInput
          label=""
          theme="light"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rightIcon={
            <img
              src={search}
              alt="search"
              className="h-4 w-4 cursor-pointer"
              onClick={onSearch}
              style={{
                filter:
                  "invert(32%) sepia(96%) saturate(1832%) hue-rotate(186deg) brightness(92%) contrast(87%)",
              }}
            />
          }
        />
      </div>

      <div className="flex items-center gap-2">
        {extraButtons}
        <Button
          fullWidth={false}
          variant="ghost"
          size="sm"
          onClick={onCreate}
          className="bg-[#0F75BC] text-white hover:bg-blue-700 hover:scale-100 hover:shadow-none"
        >
          <span className="flex items-center gap-2">
            {createButtonIcon}
            {createButtonText}
          </span>
        </Button>
      </div>
    </div>
  );
}

export default memo(GenericToolbar);
