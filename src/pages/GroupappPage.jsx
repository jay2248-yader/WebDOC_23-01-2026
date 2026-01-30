import { useState, useMemo, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import GroupappFormModal from "../components/groupapps/GroupappFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllGroupapps, deleteGroupapp, createNewGroupapp, updateGroupapp } from "../services/groupappservice";


export default function GroupappPage() {
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingGroupapp, setEditingGroupapp] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [groupapps, setGroupapps] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Reference to the delete handler from GenericDataTable
    const tableRef = useRef(null);

    // Fetch groupapps on mount
    useEffect(() => {
        const fetchGroupapps = async () => {
            try {
                setLoadingData(true);
                const params = { page, limit: pageSize, search: searchText };
                const data = await getAllGroupapps(params);
                setGroupapps(data);
            } catch (error) {
                console.error("Failed to fetch groupapps:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchGroupapps();
    }, [page, pageSize, searchText]);

    // 1) Filter groupapps
    const filtered = useMemo(() => {
        if (!searchText) return groupapps;
        const lower = searchText.toLowerCase();
        return groupapps.filter(
            (g) =>
                g.gid.toString().includes(lower) ||
                g.groupname.toLowerCase().includes(lower) ||
                (g.groupinfo && g.groupinfo.toLowerCase().includes(lower)) ||
                g.createby.toLowerCase().includes(lower)
        );
    }, [searchText, groupapps]);

    // 2) Total pages
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;

    // 3) Safe page
    const safePage = Math.min(Math.max(page, 1), totalPages);

    // 4) Paginate
    const pageGroupapps = useMemo(
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

    const handleCreateGroupapp = () => {
        setIsLoading(true);
        setEditingGroupapp(null);

        setTimeout(() => {
            setIsLoading(false);
            setShowFormModal(true);
        }, 500);
    };

    const handleEditGroupapp = (groupapp) => {
        setIsLoading(true);
        setEditingGroupapp(groupapp);

        setTimeout(() => {
            setIsLoading(false);
            setShowFormModal(true);
        }, 500);
    };

    const handleCloseModal = () => {
        setShowFormModal(false);
        setEditingGroupapp(null);
    };

    const handleSubmitGroupapp = async (formData) => {
        const isEdit = !!editingGroupapp;

        try {
            if (isEdit) {
                // Update existing groupapp
                await updateGroupapp({
                    gid: editingGroupapp.gid,
                    ...formData,
                });
            } else {
                // Create new groupapp
                await createNewGroupapp(formData);
            }

            // Refresh data after successful create/update
            const params = { page, limit: pageSize, search: searchText };
            const data = await getAllGroupapps(params);
            setGroupapps(data);

            // Don't close modal here - let the success dialog show first
            // Modal will close when user clicks the close button on success dialog
        } catch (error) {
            console.error("Failed to submit groupapp:", error);
            throw error;
        }
    };

    const handleDeleteGroupapp = async (groupapp) => {
        try {
            await deleteGroupapp(groupapp.gid);

            // Refresh data หลังจากลบสำเร็จ
            const params = { page, limit: pageSize, search: searchText };
            const data = await getAllGroupapps(params);
            setGroupapps(data);
        } catch (error) {
            console.error("Failed to delete groupapp:", error);
            throw error;
        }
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
            key: "gid",
            label: "ລະຫັດ",
            align: "left",
        },
        {
            key: "groupname",
            label: "ຊື່",
            align: "left",
        },
        {
            key: "createdate",
            label: "ວັນທີສ້າງ",
            align: "left",
        },
        {
            key: "groupinfo",
            label: "ລາຍລະອຽດເພີ່ມເຕີມ",
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
            align: "left",
            render: (groupapp) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${groupapp.statustype === "ADD"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {groupapp.statustype}
                </span>
            ),
        },
        {
            key: "actions",
            label: "ຈັດການ",
            align: "left",
            render: (groupapp) => (
                <div className="flex items-center gap-2">
                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGroupapp(groupapp)}
                        className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
                    >
                        ແກ້ໄຂ
                    </Button>

                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => tableRef.current?.handleDeleteClick?.(groupapp)}
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
                onCreate={handleCreateGroupapp}
                searchPlaceholder="ຄົ້ນຫາ Groupapp..."
                createButtonText="ເພີ່ມ Groupapp"
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
                data={pageGroupapps}
                columns={columns}
                page={safePage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={filtered.length}
                onEdit={handleEditGroupapp}
                onDelete={handleDeleteGroupapp}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                entityName="Groupapp"
                getEntityDisplayName={(groupapp) => groupapp.groupname}
                ref={tableRef}
            />

            <GroupappFormModal
                key={editingGroupapp?.gid || "new"}
                isOpen={showFormModal}
                groupapp={editingGroupapp}
                onClose={handleCloseModal}
                onSubmit={handleSubmitGroupapp}
            />

            <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
        </div>
    );
}
