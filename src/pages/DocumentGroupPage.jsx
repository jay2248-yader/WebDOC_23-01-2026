import { useState, useRef, useEffect, useCallback } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentGroupFormModal from "../components/document-groups/DocumentGroupFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllDocumentGroup, createNewDocumentGroup, deleteDocumentGroup, updateDocumentGroup } from "../services/documentgroupservice";

export default function DocumentGroupPage() {
  const [documentGroups, setDocumentGroups] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDocumentGroup, setEditingDocumentGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadDocumentGroups = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const result = await getAllDocumentGroup({ page, limit: pageSize, search: searchText });
      setDocumentGroups(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch document groups:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadDocumentGroups();
  }, [loadDocumentGroups]);

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const handleSearchChange = (v) => setInputText(v);

  const handleSearch = () => {
    setSearchText(inputText);
    setPage(1);
  };

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const handleCreateDocumentGroup = () => {
    setEditingDocumentGroup(null);
    setShowFormModal(true);
  };

  const handleEditDocumentGroup = (documentGroup) => {
    setEditingDocumentGroup(documentGroup);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingDocumentGroup(null);
  };

  const handleSubmitDocumentGroup = async (formData) => {
    if (editingDocumentGroup) {
      await updateDocumentGroup({ dcdid: editingDocumentGroup.dcdid, ...formData });
    } else {
      await createNewDocumentGroup(formData);
    }
    await loadDocumentGroups(true);
  };

  const handleDeleteDocumentGroup = async (documentGroup) => {
    await deleteDocumentGroup(documentGroup.dcdid);
    await loadDocumentGroups(true);
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "center",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "dcdid", label: "ລະຫັດ", align: "left" },
    { key: "docgroupname", label: "ຊື່ກຸ່ມເອກະສານ", align: "left" },
    { key: "levelapprove", label: "ລະດັບອະນຸມັດ", align: "center" },
    {
      key: "comparing",
      label: "ປຽບທຽບ",
      align: "center",
      render: (dg) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${dg.comparing === "Y" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {dg.comparing === "Y" ? "ແມ່ນ" : "ບໍ່ແມ່ນ"}
        </span>
      ),
    },
    {
      key: "doccategoryname",
      label: "ປະເພດເອກະສານ",
      align: "left",
      render: (dg) => dg.documentcategorymodel?.doccategoryname || "-",
    },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "center",
      render: (dg) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditDocumentGroup(dg)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(dg)}
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
        searchText={inputText}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onCreate={handleCreateDocumentGroup}
        searchPlaceholder="ຄົ້ນຫາກຸ່ມເອກະສານ..."
        createButtonText="ເພີ່ມກຸ່ມເອກະສານ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <GenericDataTable
        data={documentGroups}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditDocumentGroup}
        onDelete={handleDeleteDocumentGroup}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ກຸ່ມເອກະສານ"
        getEntityDisplayName={(dg) => dg.docgroupname}
        ref={tableRef}
      />

      <DocumentGroupFormModal
        key={editingDocumentGroup?.dcdid || "new"}
        isOpen={showFormModal}
        documentGroup={editingDocumentGroup}
        onClose={handleCloseModal}
        onSubmit={handleSubmitDocumentGroup}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
