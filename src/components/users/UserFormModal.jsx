import { useState, useRef, useEffect, useCallback } from "react";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";
import { getAllDepartments } from "../../services/departmentservice";
import { getAllPositions } from "../../services/positionservice";
import { getAllBranches } from "../../services/branchservice";
import { useAuthStore } from "../../store/authstore";

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
}) {
  const authUser = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    usercode: user?.usercode || "",
    pwds: "",
    username: user?.username || "",
    shortname: user?.shortname || "",
    gendername: user?.gendername || "ຊາຍ",
    departmentid: user?.departmentid ? String(user.departmentid) : "",
    groupappdetailid: user?.groupappdetailid || "",
    positionid: user?.positionid || "",
    createby: user?.createby || authUser?.username || authUser?.usercode || "",
    ipaddress: user?.ipaddress || "",
    branch: user?.branch ? String(user.branch) : "",
  });

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Fetch departments + positions + branches when modal opens
  useEffect(() => {
    if (isOpen) {
      getAllDepartments({ page: 1, limit: 10 }).then((res) => setDepartments(res.data)).catch(() => { });
      getAllPositions({ page: 1, limit: 10 }).then((res) => setPositions(res.data)).catch(() => { });
      getAllBranches({ page: 1, limit: 10 }).then((res) => setBranches(res.data)).catch(() => { });
    }
  }, [isOpen]);

  const handleDepartmentSearch = useCallback((text) => {
    getAllDepartments({ page: 1, limit: 10, search: text }).then((res) => setDepartments(res.data)).catch(() => { });
  }, []);

  const handlePositionSearch = useCallback((text) => {
    getAllPositions({ page: 1, limit: 10, search: text }).then((res) => setPositions(res.data)).catch(() => { });
  }, []);

  const handleBranchSearch = useCallback((text) => {
    getAllBranches({ page: 1, limit: 10, search: text }).then((res) => setBranches(res.data)).catch(() => { });
  }, []);

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        usercode: user?.usercode || "",
        pwds: "",
        username: user?.username || "",
        shortname: user?.shortname || "",
        gendername: user?.gendername || "ຊາຍ",
        departmentid: user?.departmentid ? String(user.departmentid) : "",
        groupappdetailid: user?.groupappdetailid || "",
        positionid: user?.positionid || "",
        createby: user?.createby || authUser?.username || authUser?.usercode || "",
        ipaddress: user?.ipaddress || "",
        branch: user?.branch ? String(user.branch) : "",
      });
      setSubmitDialog({ open: false, status: "confirm" });
      setErrors({});
    }
  }, [isOpen, user]);

  // Refs for input fields
  const pwdsRef = useRef(null);
  const usernameRef = useRef(null);
  const shortnameRef = useRef(null);
  const gendernameRef = useRef(null);
  const groupappdetailidRef = useRef(null);
  const createbyRef = useRef(null);
  const ipaddressRef = useRef(null);
  const branchRef = useRef(null);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    pwds: pwdsRef,
    username: usernameRef,
    shortname: shortnameRef,
    gendername: gendernameRef,
    groupappdetailid: groupappdetailidRef,
    createby: createbyRef,
    ipaddress: ipaddressRef,
    branch: branchRef,
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

    // allow only English letters + numbers for usercode
    if (field === "usercode") {
      value = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    // allow only numbers for ID fields
    if (["groupappdetailid", "branch"].includes(field)) {
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
    if (!formData.usercode) newErrors.usercode = "ກະລຸນາປ້ອນລະຫັດພະນັກງານ";
    if (!user && !formData.pwds) newErrors.pwds = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
    if (!formData.username) newErrors.username = "ກະລຸນາປ້ອນຊື່";
    if (!formData.gendername) newErrors.gendername = "ກະລຸນາເລືອກເພດ";
    if (!formData.departmentid) newErrors.departmentid = "ກະລຸນາປ້ອນລະຫັດພະແນກ";
    if (!formData.groupappdetailid) newErrors.groupappdetailid = "ກະລຸນາປ້ອນລະຫັດກຸ່ມ";
    if (!formData.positionid) newErrors.positionid = "ກະລຸນາປ້ອນລະຫັດຕຳແໜ່ງ";
    if (!formData.createby) newErrors.createby = "ກະລຸນາປ້ອນຜູ້ສ້າງ";
    if (!formData.ipaddress) newErrors.ipaddress = "ກະລຸນາປ້ອນ IP Address";
    if (!formData.branch) newErrors.branch = "ກະລຸນາປ້ອນລະຫັດສາຂາ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show confirm dialog
    setSubmitDialog({ open: true, status: "confirm" });
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitDialog({ open: true, status: "loading" });
      await onSubmit(formData);
      setSubmitDialog({ open: true, status: "success" });
    } catch (error) {
      console.error("Error submitting user:", error);
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
      setSubmitDialog({ open: false, status: "confirm" });
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

  const genderOptions = [
    { value: "ຊາຍ", label: "ຊາຍ" },
    { value: "ຍິງ", label: "ຍິງ" },
  ];

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
        <h3 className="text-lg font-semibold text-gray-900 mb-4  text-center border-b border-blue-400 pb-2">
          {user ? "ແກ້ໄຂຜູ້ໃຊ້" : "ສ້າງຜູ້ໃຊ້"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {user && (
            <FormInput
              label="ລະຫັດພະນັກງານ"
              theme="light"
              placeholder="ລະຫັດພະນັກງານ"
              value={user.usid}
              onChange={() => { }}
              disabled={true}
            />
          )}

          <FormInput
            label="ລະຫັດພະນັກງານ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດພະນັກງານ"
            value={formData.usercode}
            onChange={handleChange("usercode")}
            onKeyDown={handleKeyDown("pwds")}
            error={errors.usercode}
            hasError={!!errors.usercode}
            inputMode="text"
            autoComplete="off"
          />

          {!user && (
            <FormInput
              label="ລະຫັດຜ່ານ"
              theme="light"
              type="text"
              placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານ"
              value={formData.pwds}
              onChange={handleChange("pwds")}
              onKeyDown={handleKeyDown("username")}
              inputRef={pwdsRef}
              error={errors.pwds}
              hasError={!!errors.pwds}
              autoComplete="new-password"
            />
          )}

          <FormInput
            label="ຊື່"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່"
            value={formData.username}
            onChange={handleChange("username")}
            onKeyDown={handleKeyDown("shortname")}
            inputRef={usernameRef}
            error={errors.username}
            hasError={!!errors.username}
          />

          <FormInput
            label="ຊື່ຫຍໍ້"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ຫຍໍ້"
            value={formData.shortname}
            onChange={handleChange("shortname")}
            onKeyDown={handleKeyDown("gendername")}
            inputRef={shortnameRef}
          />

          <Select
            label="ເພດ"
            theme="light"
            value={formData.gendername}
            onChange={handleChange("gendername")}
            options={genderOptions}
            inputRef={gendernameRef}
            error={errors.gendername}
            hasError={!!errors.gendername}
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
            error={errors.departmentid}
            hasError={!!errors.departmentid}
            searchable
            onSearch={handleDepartmentSearch}
          />

          <FormInput
            label="ລະຫັດກຸ່ມ (Group App Detail ID)"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດກຸ່ມ"
            value={formData.groupappdetailid}
            onChange={handleChange("groupappdetailid")}
            onKeyDown={handleKeyDown("positionid")}
            inputRef={groupappdetailidRef}
            error={errors.groupappdetailid}
            hasError={!!errors.groupappdetailid}
            inputMode="numeric"
          />

          <Select
            label="ຕຳແໜ່ງ"
            theme="light"
            placeholder="ກະລຸນາເລືອກຕຳແໜ່ງ"
            value={formData.positionid}
            onChange={handleChange("positionid")}
            options={positions.map((p) => ({
              value: String(p.pid),
              label: p.positionname,
            }))}
            error={errors.positionid}
            hasError={!!errors.positionid}
            searchable
            onSearch={handlePositionSearch}
          />

          {user && (
            <FormInput
              label="ຜູ້ສ້າງ"
              theme="light"
              placeholder="ກະລຸນາປ້ອນຜູ້ສ້າງ"
              value={formData.createby}
              onChange={handleChange("createby")}
              onKeyDown={handleKeyDown("ipaddress")}
              inputRef={createbyRef}
              error={errors.createby}
              hasError={!!errors.createby}
              disabled={true}
            />
          )}

          <FormInput
            label="IP Address"
            theme="light"
            placeholder="ກະລຸນາປ້ອນ IP Address"
            value={formData.ipaddress}
            onChange={handleChange("ipaddress")}
            onKeyDown={handleKeyDown("branch")}
            inputRef={ipaddressRef}
            error={errors.ipaddress}
            hasError={!!errors.ipaddress}
          />

          <Select
            label="ສາຂາ"
            theme="light"
            placeholder="ກະລຸນາເລືອກສາຂາ"
            value={formData.branch}
            onChange={handleChange("branch")}
            options={branches.map((b) => ({
              value: String(b.brid),
              label: b.branchname,
            }))}
            inputRef={branchRef}
            error={errors.branch}
            hasError={!!errors.branch}
            searchable
            onSearch={handleBranchSearch}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              fullWidth={false}
              variant="secondary"
              size="md"
              onClick={handleCancel}
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              variant="outline"
              size="md"
              className="bg-[#0F75BC] text-white hover:bg-blue-700"
            >
              ສຳເລັດ
            </Button>
          </div>
        </form>
      </div>

      <ConfirmProgressDialog
        isOpen={submitDialog.open}
        status={submitDialog.status}
        title={user ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການສ້າງ"}
        message={
          user
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ "${formData.username}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການສ້າງຜູ້ໃຊ້ "${formData.username}"?`
        }
        confirmText={user ? "ແກ້ໄຂ" : "ສ້າງ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={user ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງສ້າງຜູ້ໃຊ້..."}
        successMessage={user ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
