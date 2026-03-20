import { memo, useState, forwardRef, useImperativeHandle } from "react";
import DataTable from "./DataTable";
import Button from "./Button";
import ConfirmProgressDialog from "./ConfirmProgressDialog";
import PaginationBar from "./PaginationBar";

// Fixed skeleton widths per column slot (cycles through 4 patterns)
const SKELETON_WIDTHS = ["75%", "55%", "85%", "65%"];

const GenericDataTable = memo(forwardRef(function GenericDataTable(
  {
    data,
    columns,
    page,
    pageSize,
    totalPages,
    totalItems,
    loading = false,
    error = null,
    rowKey = null,
    onDelete,
    onPageChange,
    onPageSizeChange,
    entityName = "ລາຍການ",
    getEntityDisplayName = (item) => item.name || item.id,
  },
  ref
) {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    status: "confirm",
    item: null,
  });

  const handleDeleteClick = (item) => {
    setDeleteDialog({ open: true, status: "confirm", item });
  };

  useImperativeHandle(ref, () => ({ handleDeleteClick }));

  const handleConfirmDelete = async () => {
    setDeleteDialog((prev) => ({ ...prev, status: "loading" }));
    await onDelete(deleteDialog.item);
    setDeleteDialog((prev) => ({ ...prev, status: "success" }));
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, status: "confirm", item: null });
  };

  const handleCloseDelete = () => {
    setDeleteDialog({ open: false, status: "confirm", item: null });
  };

  const renderBody = () => {
    // ─── Loading skeleton ───────────────────────────────────────────────
    if (loading) {
      return Array.from({ length: Math.min(pageSize, 6) }).map((_, rowIdx) => (
        <tr key={rowIdx} className="border-b border-blue-100 last:border-b-0">
          {columns.map((col, colIdx) => (
            <td key={col.key} className="px-4 py-3">
              <div
                className="h-4 rounded-md bg-gray-200 animate-pulse"
                style={{ width: SKELETON_WIDTHS[(rowIdx + colIdx) % SKELETON_WIDTHS.length] }}
              />
            </td>
          ))}
        </tr>
      ));
    }

    // ─── Error state ────────────────────────────────────────────────────
    if (error) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-4 py-14 text-center">
            <div className="flex flex-col items-center gap-2 text-red-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          </td>
        </tr>
      );
    }

    // ─── Empty state ────────────────────────────────────────────────────
    if (data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length} className="px-4 py-14 text-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium">ຍັງບໍ່ມີຂໍ້ມູນ</p>
              <p className="text-xs text-gray-400">ກົດ &quot;ເພີ່ມ&quot; ດ້ານເທິງເພື່ອເພີ່ມຂໍ້ມູນໃໝ່</p>
            </div>
          </td>
        </tr>
      );
    }

    // ─── Data rows ──────────────────────────────────────────────────────
    return data.map((item, index) => (
      <tr
        key={rowKey ? item[rowKey] : index}
        className="border-b border-blue-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
      >
        {columns.map((column) => (
          <td
            key={column.key}
            className={`px-4 py-3 ${
              column.align === "center"
                ? "text-center"
                : column.align === "right"
                ? "text-right"
                : ""
            }`}
          >
            {column.render ? column.render(item, index, page, pageSize) : item[column.key]}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <DataTable
      footer={
        <PaginationBar
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    >
      <table className="min-w-full text-sm">
        <thead className="bg-[#0F75BC] text-white rounded-t-xl">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-semibold ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                    ? "text-right"
                    : "text-left"
                } ${index === 0 ? "rounded-tl-xl" : ""} ${
                  index === columns.length - 1 ? "rounded-tr-xl" : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-gray-700">{renderBody()}</tbody>
      </table>

      <ConfirmProgressDialog
        isOpen={deleteDialog.open}
        status={deleteDialog.status}
        title="ຢືນຢັນການລົບ"
        message={
          <>
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບ{entityName}{" "}
            <span className="font-semibold">
              {deleteDialog.item ? getEntityDisplayName(deleteDialog.item) : ""}
            </span>
            ?
          </>
        }
        confirmText="ລົບ"
        cancelText="ຍົກເລີກ"
        loadingMessage="ກຳລັງລົບຂໍ້ມູນ..."
        successMessage="ລົບຂໍ້ມູນສຳເລັດແລ້ວ"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={handleCloseDelete}
        danger={true}
      />
    </DataTable>
  );
}));

export default GenericDataTable;
export { Button };
