import { useState, forwardRef, useImperativeHandle } from "react";
import DataTable from "./DataTable";
import Button from "./Button";
import ConfirmProgressDialog from "./ConfirmProgressDialog";
import PaginationBar from "./PaginationBar";

const GenericDataTable = forwardRef(function GenericDataTable({
  data,
  columns,
  page,
  pageSize,
  totalPages,
  totalItems,
  onDelete,
  onPageChange,
  onPageSizeChange,
  entityName = "ລາຍການ",
  getEntityDisplayName = (item) => item.name || item.id,
}, ref) {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    status: "confirm",
    item: null,
  });

  const handleDeleteClick = (item) => {
    setDeleteDialog({ open: true, status: "confirm", item });
  };

  // Expose handleDeleteClick via ref
  useImperativeHandle(ref, () => ({
    handleDeleteClick,
  }));

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
      <table className="min-w-full text-sm ">
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
                } ${index === 0 ? "rounded-tl-xl" : ""} ${index === columns.length - 1 ? "rounded-tr-xl" : ""}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-gray-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-500"
              >
                ບໍ່ພົບຂໍ້ມູນ
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id || index}
                className="border-b border-blue-100 last:border-b-0"
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
                    {column.render
                      ? column.render(item, index, page, pageSize)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
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
});

export default GenericDataTable;

// Export Button component for use in column renders
export { Button };
