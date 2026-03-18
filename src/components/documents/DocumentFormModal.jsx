import { useState, useRef, useEffect, useCallback } from "react";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";
import { getAllDocumentCategories } from "../../services/documentcategoryservice";
import { getAllUsers } from "../../services/userservice";
import { getAllBranches } from "../../services/branchservice";
import { getAllDepartments } from "../../services/departmentservice";

export default function DocumentFormModal({
    isOpen,
    onClose,
    onSubmit,
    document = null,
}) {
    const [formData, setFormData] = useState({
        doccategoryid: document?.doccategoryid || "",
        req_user: document?.req_user || "",
        req_to: document?.req_to || "",
        req_reason: document?.req_reason || "",
        branchid: document?.branchid || "",
        departmentid: document?.departmentid || "",
        totalmoney: document?.totalmoney || "",
    });

    const [errors, setErrors] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryPage, setCategoryPage] = useState(1);
    const [categoryHasMore, setCategoryHasMore] = useState(false);
    const [categoryLoadingMore, setCategoryLoadingMore] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [users, setUsers] = useState([]);
    const [userPage, setUserPage] = useState(1);
    const [userHasMore, setUserHasMore] = useState(false);
    const [userLoadingMore, setUserLoadingMore] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [branches, setBranches] = useState([]);
    const [branchPage, setBranchPage] = useState(1);
    const [branchHasMore, setBranchHasMore] = useState(false);
    const [branchLoadingMore, setBranchLoadingMore] = useState(false);
    const [branchSearch, setBranchSearch] = useState("");
    const [departments, setDepartments] = useState([]);
    const [departmentPage, setDepartmentPage] = useState(1);
    const [departmentHasMore, setDepartmentHasMore] = useState(false);
    const [departmentLoadingMore, setDepartmentLoadingMore] = useState(false);
    const [departmentSearch, setDepartmentSearch] = useState("");
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        status: "confirm",
    });

    const CATEGORY_LIMIT = 10;
    const USER_LIMIT = 10;
    const BRANCH_LIMIT = 10;
    const DEPARTMENT_LIMIT = 10;

    // Refs for input fields
    const doccategoryidRef = useRef(null);
    const reqUserRef = useRef(null);
    const reqToRef = useRef(null);
    const reqReasonRef = useRef(null);
    const branchidRef = useRef(null);
    const departmentidRef = useRef(null);
    const totalmoneyRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setCategoryPage(1);
            setCategorySearch("");
            getAllDocumentCategories({ page: 1, limit: CATEGORY_LIMIT })
                .then((res) => {
                    setCategories(res.data);
                    setCategoryHasMore(res.data.length === CATEGORY_LIMIT && res.total > CATEGORY_LIMIT);
                })
                .catch(() => {});

            setUserPage(1);
            setUserSearch("");
            getAllUsers({ page: 1, limit: USER_LIMIT })
                .then((res) => {
                    setUsers(res.data);
                    setUserHasMore(res.data.length === USER_LIMIT && res.total > USER_LIMIT);
                })
                .catch(() => {});

            setBranchPage(1);
            setBranchSearch("");
            getAllBranches({ page: 1, limit: BRANCH_LIMIT })
                .then((res) => {
                    setBranches(res.data);
                    setBranchHasMore(res.data.length === BRANCH_LIMIT && res.total > BRANCH_LIMIT);
                })
                .catch(() => {});

            setDepartmentPage(1);
            setDepartmentSearch("");
            getAllDepartments({ page: 1, limit: DEPARTMENT_LIMIT })
                .then((res) => {
                    setDepartments(res.data);
                    setDepartmentHasMore(res.data.length === DEPARTMENT_LIMIT && res.total > DEPARTMENT_LIMIT);
                })
                .catch(() => {});
        }
    }, [isOpen]);

    const handleCategorySearch = useCallback((text) => {
        setCategorySearch(text);
        setCategoryPage(1);
        getAllDocumentCategories({ page: 1, limit: CATEGORY_LIMIT, search: text })
            .then((res) => {
                setCategories(res.data);
                setCategoryHasMore(res.data.length === CATEGORY_LIMIT && res.total > CATEGORY_LIMIT);
            })
            .catch(() => {});
    }, []);

    const handleCategoryLoadMore = () => {
        const nextPage = categoryPage + 1;
        setCategoryLoadingMore(true);
        getAllDocumentCategories({ page: nextPage, limit: CATEGORY_LIMIT, search: categorySearch })
            .then((res) => {
                setCategories((prev) => [...prev, ...res.data]);
                setCategoryPage(nextPage);
                setCategoryHasMore(res.data.length === CATEGORY_LIMIT && (categories.length + res.data.length) < res.total);
            })
            .catch(() => {})
            .finally(() => setCategoryLoadingMore(false));
    };

    const handleUserSearch = useCallback((text) => {
        setUserSearch(text);
        setUserPage(1);
        getAllUsers({ page: 1, limit: USER_LIMIT, search: text })
            .then((res) => {
                setUsers(res.data);
                setUserHasMore(res.data.length === USER_LIMIT && res.total > USER_LIMIT);
            })
            .catch(() => {});
    }, []);

    const handleUserLoadMore = () => {
        const nextPage = userPage + 1;
        setUserLoadingMore(true);
        getAllUsers({ page: nextPage, limit: USER_LIMIT, search: userSearch })
            .then((res) => {
                setUsers((prev) => [...prev, ...res.data]);
                setUserPage(nextPage);
                setUserHasMore(res.data.length === USER_LIMIT && (users.length + res.data.length) < res.total);
            })
            .catch(() => {})
            .finally(() => setUserLoadingMore(false));
    };

    const handleBranchSearch = useCallback((text) => {
        setBranchSearch(text);
        setBranchPage(1);
        getAllBranches({ page: 1, limit: BRANCH_LIMIT, search: text })
            .then((res) => {
                setBranches(res.data);
                setBranchHasMore(res.data.length === BRANCH_LIMIT && res.total > BRANCH_LIMIT);
            })
            .catch(() => {});
    }, []);

    const handleBranchLoadMore = () => {
        const nextPage = branchPage + 1;
        setBranchLoadingMore(true);
        getAllBranches({ page: nextPage, limit: BRANCH_LIMIT, search: branchSearch })
            .then((res) => {
                setBranches((prev) => [...prev, ...res.data]);
                setBranchPage(nextPage);
                setBranchHasMore(res.data.length === BRANCH_LIMIT && (branches.length + res.data.length) < res.total);
            })
            .catch(() => {})
            .finally(() => setBranchLoadingMore(false));
    };

    const handleDepartmentSearch = useCallback((text) => {
        setDepartmentSearch(text);
        setDepartmentPage(1);
        getAllDepartments({ page: 1, limit: DEPARTMENT_LIMIT, search: text })
            .then((res) => {
                setDepartments(res.data);
                setDepartmentHasMore(res.data.length === DEPARTMENT_LIMIT && res.total > DEPARTMENT_LIMIT);
            })
            .catch(() => {});
    }, []);

    const handleDepartmentLoadMore = () => {
        const nextPage = departmentPage + 1;
        setDepartmentLoadingMore(true);
        getAllDepartments({ page: nextPage, limit: DEPARTMENT_LIMIT, search: departmentSearch })
            .then((res) => {
                setDepartments((prev) => [...prev, ...res.data]);
                setDepartmentPage(nextPage);
                setDepartmentHasMore(res.data.length === DEPARTMENT_LIMIT && (departments.length + res.data.length) < res.total);
            })
            .catch(() => {})
            .finally(() => setDepartmentLoadingMore(false));
    };

    // Reset formData and submitDialog when modal opens or document changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                doccategoryid: document?.doccategoryid ? String(document.doccategoryid) : "",
                req_user: document?.req_user ? String(document.req_user) : "",
                req_to: document?.req_to || "",
                req_reason: document?.req_reason || "",
                branchid: document?.branchid ? String(document.branchid) : "",
                departmentid: document?.departmentid ? String(document.departmentid) : "",
                totalmoney: document?.totalmoney || "",
            });
            setSubmitDialog({ open: false, status: "confirm" });
            setErrors({});
        }
    }, [isOpen, document]);

    if (!isOpen && !isClosing) return null;

    // Refs object for easy access
    const inputRefs = {
        doccategoryid: doccategoryidRef,
        req_user: reqUserRef,
        req_to: reqToRef,
        req_reason: reqReasonRef,
        branchid: branchidRef,
        departmentid: departmentidRef,
        totalmoney: totalmoneyRef,
    };

    // Handle Enter key to move to next input
    const handleKeyDown = (nextFieldName) => (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRefs[nextFieldName]?.current?.focus();
        }
    };

    const handleChange = (field) => (e) => {
        let value = e.target.value;

        // Filter numeric fields
        const numericFields = ["totalmoney"];
        if (numericFields.includes(field)) {
            value = value.replace(/[^0-9]/g, "");
        }

        setFormData({ ...formData, [field]: value });

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.doccategoryid) newErrors.doccategoryid = "ກະລຸນາເລືອກປະເພດເອກະສານ";
        if (!formData.req_user) newErrors.req_user = "ກະລຸນາປ້ອນຜູ້ຮ້ອງຂໍ";
        if (!formData.req_to) newErrors.req_to = "ກະລຸນາປ້ອນຮຽນ";
        if (!formData.req_reason) newErrors.req_reason = "ກະລຸນາປ້ອນເຫດຜົນ";
        if (!formData.branchid) newErrors.branchid = "ກະລຸນາເລືອກສາຂາ";
        if (!formData.departmentid) newErrors.departmentid = "ກະລຸນາເລືອກພະແນກ";


        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Convert to numbers before submitting
        const submitData = {
            doccategoryid: parseInt(formData.doccategoryid),
            req_user: parseInt(formData.req_user),
            req_to: formData.req_to,
            req_reason: formData.req_reason,
            branchid: parseInt(formData.branchid),
            departmentid: parseInt(formData.departmentid),
            totalmoney: formData.totalmoney ? parseInt(formData.totalmoney) : 0,
        };

        // Show confirm dialog
        setSubmitDialog({ open: true, status: "confirm", data: submitData });
    };

    const handleConfirmSubmit = async () => {
        try {
            setSubmitDialog({ ...submitDialog, status: "loading" });
            await onSubmit(submitDialog.data);
            setSubmitDialog({ ...submitDialog, status: "success" });
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitDialog({ open: false, status: "confirm" });
            // Show error to user
            alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ"); // Error saving data
        }
    };

    const handleCancelSubmit = () => {
        setSubmitDialog({ open: false, status: "confirm" });
    };

    const handleCloseSubmit = () => {
        setSubmitDialog({ open: false, status: "confirm" });

        // Close form modal
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setErrors({});
            setIsClosing(false);
        }, 300);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setErrors({});
            setIsClosing(false);
        }, 300);
    };

    const handleCancel = () => {
        handleClose();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${isClosing ? "animate-fadeOut" : "animate-fadeIn"
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${isClosing ? "animate-slideDown" : "animate-slideUp"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
                    {document ? "ແກ້ໄຂເອກະສານ" : "ເພີ່ມເອກະສານ"} {/* Edit Document : Add Document */}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {document && (
                        <FormInput
                            label="ລະຫັດ (ID)"
                            theme="light"
                            placeholder="ລະຫັດ"
                            value={document.rqdid}
                            onChange={() => { }}
                            disabled={true}
                        />
                    )}

                    <Select
                        label="ປະເພດເອກະສານ"
                        theme="light"
                        placeholder="ກະລຸນາເລືອກປະເພດເອກະສານ"
                        value={formData.doccategoryid}
                        onChange={handleChange("doccategoryid")}
                        options={categories.map((c) => ({
                            value: String(c.dctid),
                            label: c.doccategoryname,
                        }))}
                        inputRef={doccategoryidRef}
                        error={errors.doccategoryid}
                        hasError={!!errors.doccategoryid}
                        searchable
                        onSearch={handleCategorySearch}
                        hasMore={categoryHasMore}
                        onLoadMore={handleCategoryLoadMore}
                        isLoadingMore={categoryLoadingMore}
                    />

                    <Select
                        label="ຜູ້ຮ້ອງຂໍ"
                        theme="light"
                        placeholder="ກະລຸນາເລືອກຜູ້ຮ້ອງຂໍ"
                        value={formData.req_user}
                        onChange={handleChange("req_user")}
                        options={users.map((u) => ({
                            value: String(u.usid),
                            label: `${u.username} (${u.usercode})`,
                        }))}
                        inputRef={reqUserRef}
                        error={errors.req_user}
                        hasError={!!errors.req_user}
                        searchable
                        onSearch={handleUserSearch}
                        hasMore={userHasMore}
                        onLoadMore={handleUserLoadMore}
                        isLoadingMore={userLoadingMore}
                    />

                    <FormInput
                        label="ຮຽນ"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຮຽນ (ເຊັ່ນ: Director 3)"
                        value={formData.req_to}
                        onChange={handleChange("req_to")}
                        onKeyDown={handleKeyDown("req_reason")}
                        inputRef={reqToRef}
                        error={errors.req_to}
                        hasError={!!errors.req_to}
                    />

                    <FormInput
                        label="ເຫດຜົນ"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນເຫດຜົນ"
                        value={formData.req_reason}
                        onChange={handleChange("req_reason")}
                        onKeyDown={handleKeyDown("branchid")}
                        inputRef={reqReasonRef}
                        error={errors.req_reason}
                        hasError={!!errors.req_reason}
                    />

                    <Select
                        label="ສາຂາ"
                        theme="light"
                        placeholder="ກະລຸນາເລືອກສາຂາ"
                        value={formData.branchid}
                        onChange={handleChange("branchid")}
                        options={branches.map((b) => ({
                            value: String(b.brid),
                            label: b.branchname,
                        }))}
                        inputRef={branchidRef}
                        error={errors.branchid}
                        hasError={!!errors.branchid}
                        searchable
                        onSearch={handleBranchSearch}
                        hasMore={branchHasMore}
                        onLoadMore={handleBranchLoadMore}
                        isLoadingMore={branchLoadingMore}
                    />

                    <Select
                        label="ພະແນກ"
                        theme="light"
                        placeholder="ກະລຸນາເລືອກພະແນກ"
                        value={formData.departmentid}
                        onChange={handleChange("departmentid")}
                        options={departments.map((d) => ({
                            value: String(d.dpid),
                            label: d.departmentname,
                        }))}
                        inputRef={departmentidRef}
                        error={errors.departmentid}
                        hasError={!!errors.departmentid}
                        searchable
                        onSearch={handleDepartmentSearch}
                        hasMore={departmentHasMore}
                        onLoadMore={handleDepartmentLoadMore}
                        isLoadingMore={departmentLoadingMore}
                    />


                    <FormInput
                        label="ຈຳນວນເງິນ (ບໍ່ບັງຄັບ)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຈຳນວນເງິນ"
                        value={formData.totalmoney}
                        onChange={handleChange("totalmoney")}
                        inputRef={totalmoneyRef}
                        error={errors.totalmoney}
                        hasError={!!errors.totalmoney}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            fullWidth={false}
                            variant="secondary"
                            size="md"
                            onClick={handleCancel}
                        >
                            ຍົກເລີກ{/* Cancel */}
                        </Button>
                        <Button
                            type="submit"
                            fullWidth={false}
                            variant="outline"
                            size="md"
                            className="bg-[#0F75BC] text-white hover:bg-blue-700"
                        >
                            ສຳເລັດ{/* Success/Confirm */}
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmProgressDialog
                isOpen={submitDialog.open}
                status={submitDialog.status}
                title={document ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
                message={
                    document
                        ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນເອກະສານ?`
                        : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມເອກະສານຮ້ອງຂໍໃໝ່?`
                }
                confirmText={document ? "ແກ້ໄຂ" : "ເພີ່ມ"}
                cancelText="ຍົກເລີກ"
                loadingMessage={document ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມເອກະສານ..."}
                successMessage={document ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມເອກະສານສຳເລັດແລ້ວ"}
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                onClose={handleCloseSubmit}
            />
        </div>
    );
}
