import Button from "../common/Button";
import Select from "../common/Select";

export default function PaginationBar({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pageSizeOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
  ];

  return (
    <div className="flex flex-col gap-3 px-6 py-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 relative">
        <span>ຈຳນວນລາຍການ</span>
        <div className="w-20 relative z-10">
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            options={pageSizeOptions}
            theme="light"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          fullWidth={false}
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(1)}
          className="rounded-md border-gray-200 px-2 py-1 text-sm text-gray-500 hover:scale-100 hover:shadow-none"
        >
          «
        </Button>

        <Button
          fullWidth={false}
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border-gray-200 px-2 py-1 text-sm text-gray-500 hover:scale-100 hover:shadow-none"
        >
          ‹
        </Button>

        <span className="rounded-md border border-gray-200 px-3 py-1 text-sm">
          {page}
        </span>
        <span>/</span>
        <span>{totalPages}</span>
        <span className="text-gray-400">{totalItems} ລາຍການ</span>

        <Button
          fullWidth={false}
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border-gray-200 px-2 py-1 text-sm text-gray-500 hover:scale-100 hover:shadow-none"
        >
          ›
        </Button>

        <Button
          fullWidth={false}
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(totalPages)}
          className="rounded-md border-gray-200 px-2 py-1 text-sm text-gray-500 hover:scale-100 hover:shadow-none"
        >
          »
        </Button>
      </div>
    </div>
  );
}
