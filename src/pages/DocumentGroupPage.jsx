import { useState, useMemo, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentGroupFormModal from "../components/document-groups/DocumentGroupFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllDocumentGroup, createNewDocumentGroup, deleteDocumentGroup, updateDocumentGroup } from "../services/documentgroupservice";

export default function DocumentGroupPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDocumentGroup, setEditingDocumentGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentGroups, setDocumentGroups] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // Fetch document groups on mount
  useEffect(() => {
    const fetchDocumentGroups = async () => {
      try {
        setLoadingData(true);
        const params = { page, limit: pageSize, search: searchText };
        const result = await getAllDocumentGroup(params);
        setDocumentGroups(result.data);
      } catch (error) {
        console.error("Failed to fetch document groups:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDocumentGroups();
  }, [page, pageSize, searchText]);

  // 1) Filter document groups
  const filtered = useMemo(() => {
    if (!searchText) return documentGroups;
    const lower = searchText.toLowerCase();
    return documentGroups.filter(
      (dg) =>
        dg.dcdid?.toString().includes(lower) ||
        dg.docgroupname?.toLowerCase().includes(lower) ||
        dg.createby?.toLowerCase().includes(lower)
    );
  }, [searchText, documentGroups]);

  // 2) Total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) Safe page
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) Paginate
  const pageDocumentGroups = useMemo(
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

  const handleCreateDocumentGroup = () => {
    setIsLoading(true);
    setEditingDocumentGroup(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditDocumentGroup = (documentGroup) => {
    setIsLoading(true);
    setEditingDocumentGroup(documentGroup);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingDocumentGroup(null);
  };

  const handleSubmitDocumentGroup = async (formData) => {
    const isEdit = !!editingDocumentGroup;

    try {
      if (isEdit) {
        await updateDocumentGroup({ dcdid: editingDocumentGroup.dcdid, ...formData });
      } else {
        // Create new document group
        await createNewDocumentGroup(formData);
      }

      // Refresh data after successful create/update
      const params = { page, limit: pageSize, search: searchText };
      const result = await getAllDocumentGroup(params);
      setDocumentGroups(result.data);
    } catch (error) {
      console.error("Failed to submit document group:", error);
      throw error;
    }
  };

  const handleDeleteDocumentGroup = async (documentGroup) => {
    try {
      await deleteDocumentGroup(documentGroup.dcdid);

      // Refresh data after successful delete
      const params = { page, limit: pageSize, search: searchText };
      const result = await getAllDocumentGroup(params);
      setDocumentGroups(result.data);
    } catch (error) {
      console.error("Failed to delete document group:", error);
      throw error;
    }
  };

  // Define columns configuration
  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "center",
      render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "dcdid",
      label: "ລະຫັດ",
      align: "left",
    },
    {
      key: "docgroupname",
      label: "ຊື່ກຸ່ມເອກະສານ",
      align: "left",
    },
    {
      key: "levelapprove",
      label: "ລະດັບອະນຸມັດ",
      align: "center",
    },
    {
      key: "comparing",
      label: "ປຽບທຽບ",
      align: "center",
      render: (dg) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            dg.comparing === "Y"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
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
    {
      key: "createdate",
      label: "ວັນທີສ້າງ",
      align: "left",
    },
    {
      key: "createby",
      label: "ສ້າງໂດຍ",
      align: "left",
    },
    {
      key: "statustype",
      label: "ສະຖານະ",
      align: "center",
      render: (dg) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            dg.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {dg.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "center",
      render: (dg) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditDocumentGroup(dg)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(dg)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"
          >
            ລົບ
          </Button>
        </div>
      ),
    },
  ];

  if (loadingData) {
    return <LoadingDialog isOpen={true} message="ກຳລັງໂຫຼດຂໍ້ມູນ..." />;
  }

  return (
    <div className="space-y-6">
      <GenericToolbar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onCreate={handleCreateDocumentGroup}
        searchPlaceholder="ຄົ້ນຫາກຸ່ມເອກະສານ..."
        createButtonText="ເພີ່ມກຸ່ມເອກະສານ"
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
        data={pageDocumentGroups}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
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
