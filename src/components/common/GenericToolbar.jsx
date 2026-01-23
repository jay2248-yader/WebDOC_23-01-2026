import Button from "./Button";
import FormInput from "./FormInput";
import search from "../../assets/icon/search.svg";

/**
 * Generic Toolbar component for search and create actions
 * @param {Object} props
 * @param {string} props.searchText - Current search text
 * @param {Function} props.onSearchChange - Search change handler
 * @param {Function} props.onCreate - Create button click handler
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.createButtonText - Text for create button
 * @param {JSX.Element} props.createButtonIcon - Icon for create button
 */
export default function GenericToolbar({
  searchText,
  onSearchChange,
  onCreate,
  searchPlaceholder = "ຄົ້ນຫາ",
  createButtonText = "ສ້າງ",
  createButtonIcon = null,
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-md">
        <FormInput
          label=""
          theme="light"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          rightIcon={
            <img
              src={search}
              alt="search"
              className="h-4 w-4"
              style={{
                filter:
                  "invert(32%) sepia(96%) saturate(1832%) hue-rotate(186deg) brightness(92%) contrast(87%)",
              }}
            />
          }
        />
      </div>

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
  );
}
