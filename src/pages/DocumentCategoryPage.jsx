import { useState, useMemo } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentCategoryFormModal from "../components/document-categories/DocumentCategoryFormModal";
import LoadingDialog from "../components/common/LoadingDialog";

const documentCategories = [
  {
    dctid: 3,
    doccategoryname: "ໜັງສືສະເໜີຂໍຈັດຊື້ອາໄຫຼ່ລົດບໍລິຫານ",
    moreinfo: "ສໍາລັບ ໜັງສືສະເໜີຂໍຈັດຊື້ອາໄຫຼ່ລົດບໍລິຫານ",
    statustype: "ADD",
    createby: "1111982",
    createdate: "2025-11-25 08:50:54",
  },
  {
    dctid: 4,
    doccategoryname: "ເອກະສານການເງິນ",
    moreinfo: "ເອກະສານທີ່ກ່ຽວຂ້ອງກັບການເບີກຈ່າຍ",
    statustype: "ADD",
    createby: "1111982",
    createdate: "2025-11-26 09:30:00",
  },
  {
    dctid: 5,
    doccategoryname: "ເອກະສານບຸກຄະລາກອນ",
    moreinfo: "ຂໍ້ມູນພະນັກງານ ແລະ ການລາພັກ",
    statustype: "ADD",
    createby: "1111982",
    createdate: "2025-11-27 10:15:20",
  },
];

export default function DocumentCategoryPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the delete handler from GenericDataTable
  const [tableRef, setTableRef] = useState({ handleDeleteClick: null });

  // 1) Filter categories
  const filtered = useMemo(() => {
    if (!searchText) return documentCategories;
    const lower = searchText.toLowerCase();
    return documentCategories.filter(
      (c) =>
        c.doccategoryname.toLowerCase().includes(lower) ||
        c.moreinfo.toLowerCase().includes(lower) ||
        String(c.dctid).includes(lower)
    );
  }, [searchText]);

  // 2) Total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) Safe page
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) Paginate
  const pageCategories = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

  const handleSearchChange = (v) => {
    setSearchText(v);
    setPage(1);
  };

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(clamped);
  };

  const handleCreateCategory = () => {
    setIsLoading(true);
    setEditingCategory(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditCategory = (category) => {
    setIsLoading(true);
    setEditingCategory(category);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (formData) => {
    const isEdit = !!editingCategory;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isEdit) {
      console.log("update category", editingCategory.dctid, formData);
    } else {
      console.log("create category", formData);
    }
  };

  const handleDeleteCategory = async (category) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("delete category", category);
  };

  // Define columns configuration
  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "dctid",
      label: "ລະຫັດ (ID)",
      align: "left",
    },
    {
      key: "doccategoryname",
      label: "ຊື່ປະເພດເອກະສານ",
      align: "left",
    },
    {
      key: "moreinfo",
      label: "ລາຍລະອຽດ",
      align: "left",
    },
    {
      key: "createdate",
      label: "ວັນທີສ້າງ",
      align: "left",
    },
    {
      key: "createby",
      label: "ຜູ້ສ້າງ",
      align: "left",
    },
    {
      key: "statustype",
      label: "ສະຖານະ",
      align: "left",
      render: (category) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            category.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (category) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditCategory(category)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.handleDeleteClick?.(category)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"
          >
            ລົບ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <GenericToolbar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onCreate={handleCreateCategory}
        searchPlaceholder="ຄົ້ນຫາປະເພດເອກະສານ..."
        createButtonText="ເພີ່ມປະເພດ"
        createButtonIcon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        }
      />

      <GenericDataTable
        data={pageCategories}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ປະເພດເອກະສານ"
        getEntityDisplayName={(category) => category.doccategoryname}
        ref={(ref) => {
          if (ref && !tableRef.handleDeleteClick) {
            setTableRef({ handleDeleteClick: ref.handleDeleteClick });
          }
        }}
      />

      <DocumentCategoryFormModal
        key={editingCategory?.doccategoryid || "new"}
        isOpen={showFormModal}
        category={editingCategory}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
