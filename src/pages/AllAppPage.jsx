import { useState, useMemo, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import AllAppFormModal from "../components/allapps/AllAppFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllAllApps, deleteAllApp, createNewAllApp, updateAllApp } from "../services/allappservice";


export default function AllAppPage() {
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingAllApp, setEditingAllApp] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [allApps, setAllApps] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Reference to the delete handler from GenericDataTable
    const tableRef = useRef(null);

    // Fetch allApps on mount
    useEffect(() => {
        const fetchAllApps = async () => {
            try {
                setLoadingData(true);
                const params = { page, limit: pageSize, search: searchText };
                const data = await getAllAllApps(params);
                setAllApps(data);
            } catch (error) {
                console.error("Failed to fetch allApps:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchAllApps();
    }, [page, pageSize, searchText]);

    // 1) Filter allApps
    const filtered = useMemo(() => {
        if (!searchText) return allApps;
        const lower = searchText.toLowerCase();
        return allApps.filter(
            (a) =>
                a.ids.toString().includes(lower) ||
                a.appname.toLowerCase().includes(lower) ||
                (a.applink && a.applink.toLowerCase().includes(lower)) ||
                (a.moreinfo && a.moreinfo.toLowerCase().includes(lower))
        );
    }, [searchText, allApps]);

    // 2) Total pages
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;

    // 3) Safe page
    const safePage = Math.min(Math.max(page, 1), totalPages);

    // 4) Paginate
    const pageAllApps = useMemo(
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

    const handleCreateAllApp = () => {
        setIsLoading(true);
        setEditingAllApp(null);

        setTimeout(() => {
            setIsLoading(false);
            setShowFormModal(true);
        }, 500);
    };

    const handleEditAllApp = (allApp) => {
        setIsLoading(true);
        setEditingAllApp(allApp);

        setTimeout(() => {
            setIsLoading(false);
            setShowFormModal(true);
        }, 500);
    };

    const handleCloseModal = () => {
        setShowFormModal(false);
        setEditingAllApp(null);
    };

    const handleSubmitAllApp = async (formData) => {
        const isEdit = !!editingAllApp;

        try {
            if (isEdit) {
                // Update existing allApp
                await updateAllApp({
                    ids: editingAllApp.ids,
                    ...formData,
                });
            } else {
                // Create new allApp
                await createNewAllApp(formData);
            }

            // Refresh data after successful create/update
            const params = { page, limit: pageSize, search: searchText };
            const data = await getAllAllApps(params);
            setAllApps(data);

            // Don't close modal here - let the success dialog show first
            // Modal will close when user clicks the close button on success dialog
        } catch (error) {
            console.error("Failed to submit allApp:", error);
            throw error;
        }
    };

    const handleDeleteAllApp = async (allApp) => {
        try {
            await deleteAllApp(allApp.ids);

            // Refresh data หลังจากลบสำเร็จ
            const params = { page, limit: pageSize, search: searchText };
            const data = await getAllAllApps(params);
            setAllApps(data);
        } catch (error) {
            console.error("Failed to delete allApp:", error);
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
            key: "ids",
            label: "ລະຫັດ",
            align: "left",
        },
        {
            key: "appname",
            label: "ຊື່ແອັບ",
            align: "left",
        },
        {
            key: "applink",
            label: "ລິ້ງແອັບ",
            align: "left",
            render: (allApp) => (
                <a href={allApp.applink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {allApp.applink}
                </a>
            ),
        },
        {
            key: "moreinfo",
            label: "ລາຍລະອຽດເພີ່ມເຕີມ",
            align: "left",
        },
        {
            key: "statustype",
            label: "ສະຖານະ",
            align: "left",
            render: (allApp) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${allApp.statustype === "ADD"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                >
                    {allApp.statustype}
                </span>
            ),
        },
        {
            key: "actions",
            label: "ຈັດການ",
            align: "left",
            render: (allApp) => (
                <div className="flex items-center gap-2">
                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAllApp(allApp)}
                        className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
                    >
                        ແກ້ໄຂ
                    </Button>

                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => tableRef.current?.handleDeleteClick?.(allApp)}
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
                onCreate={handleCreateAllApp}
                searchPlaceholder="ຄົ້ນຫາ AllApp..."
                createButtonText="ເພີ່ມ AllApp"
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
                data={pageAllApps}
                columns={columns}
                page={safePage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={filtered.length}
                onEdit={handleEditAllApp}
                onDelete={handleDeleteAllApp}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                entityName="AllApp"
                getEntityDisplayName={(allApp) => allApp.appname}
                ref={tableRef}
            />

            <AllAppFormModal
                key={editingAllApp?.ids || "new"}
                isOpen={showFormModal}
                allApp={editingAllApp}
                onClose={handleCloseModal}
                onSubmit={handleSubmitAllApp}
            />

            <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
        </div>
    );
}
