import { useState, useRef, useEffect, useCallback } from "react";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";
import { getAllDocumentGroup } from "../../services/documentgroupservice";
import { getAllUsers } from "../../services/userservice";

export default function DocumentGroupDetailsFormModal({
  isOpen,
  onClose,
  onSubmit,
  detail = null,
}) {
  const [formData, setFormData] = useState({
    dcdid: detail?.dcdid || "",
    userid: detail?.userid || "",
    detailsinfo: detail?.detailsinfo || "",
    maxsignmoney: detail?.maxsignmoney || "",
  });

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [documentGroups, setDocumentGroups] = useState([]);
  const [groupPage, setGroupPage] = useState(1);
  const [groupHasMore, setGroupHasMore] = useState(false);
  const [groupLoadingMore, setGroupLoadingMore] = useState(false);
  const [groupSearch, setGroupSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(false);
  const [userLoadingMore, setUserLoadingMore] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  const GROUP_LIMIT = 10;
  const USER_LIMIT = 10;

  const dcdidRef = useRef(null);
  const useridRef = useRef(null);
  const detailsinfoRef = useRef(null);
  const maxsignmoneyRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setGroupPage(1);
      setGroupSearch("");
      getAllDocumentGroup({ page: 1, limit: GROUP_LIMIT })
        .then((res) => {
          setDocumentGroups(res.data);
          setGroupHasMore(res.data.length === GROUP_LIMIT && res.total > GROUP_LIMIT);
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
    }
  }, [isOpen]);

  const handleGroupSearch = useCallback((text) => {
    setGroupSearch(text);
    setGroupPage(1);
    getAllDocumentGroup({ page: 1, limit: GROUP_LIMIT, search: text })
      .then((res) => {
        setDocumentGroups(res.data);
        setGroupHasMore(res.data.length === GROUP_LIMIT && res.total > GROUP_LIMIT);
      })
      .catch(() => {});
  }, []);

  const handleGroupLoadMore = () => {
    const nextPage = groupPage + 1;
    setGroupLoadingMore(true);
    getAllDocumentGroup({ page: nextPage, limit: GROUP_LIMIT, search: groupSearch })
      .then((res) => {
        setDocumentGroups((prev) => [...prev, ...res.data]);
        setGroupPage(nextPage);
        setGroupHasMore(res.data.length === GROUP_LIMIT && (documentGroups.length + res.data.length) < res.total);
      })
      .catch(() => {})
      .finally(() => setGroupLoadingMore(false));
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

  useEffect(() => {
    if (isOpen) {
      setFormData({
        dcdid: detail?.dcdid ? String(detail.dcdid) : "",
        userid: detail?.userid ? String(detail.userid) : "",
        detailsinfo: detail?.detailsinfo || "",
        maxsignmoney: detail?.maxsignmoney || "",
      });
      setSubmitDialog({ open: false, status: "confirm" });
      setErrors({});
    }
  }, [isOpen, detail]);

  if (!isOpen && !isClosing) return null;

  const inputRefs = {
    dcdid: dcdidRef,
    userid: useridRef,
    detailsinfo: detailsinfoRef,
    maxsignmoney: maxsignmoneyRef,
  };

  const handleKeyDown = (nextFieldName) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs[nextFieldName]?.current?.focus();
    }
  };

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (field === "userid" || field === "maxsignmoney") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.dcdid) newErrors.dcdid = "ກະລຸນາປ້ອນລະຫັດກຸ່ມເອກະສານ";
    if (!formData.userid) newErrors.userid = "ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້";
    if (!formData.detailsinfo) newErrors.detailsinfo = "ກະລຸນາປ້ອນລາຍລະອຽດ";
    if (!formData.maxsignmoney) newErrors.maxsignmoney = "ກະລຸນາປ້ອນຈຳນວນເງິນສູງສຸດ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitDialog({ open: true, status: "confirm" });
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitDialog({ open: true, status: "loading" });

      const submitData = {
        dcdid: parseInt(formData.dcdid),
        userid: parseInt(formData.userid),
        detailsinfo: formData.detailsinfo,
        maxsignmoney: parseInt(formData.maxsignmoney),
      };

      await onSubmit(submitData);
      setSubmitDialog({ open: true, status: "success" });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitDialog({ open: false, status: "confirm" });
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
    }
  };

  const handleCancelSubmit = () => {
    setSubmitDialog({ open: false, status: "confirm" });
  };

  const handleCloseSubmit = () => {
    setSubmitDialog({ open: false, status: "confirm" });
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
          {detail ? "ແກ້ໄຂລາຍລະອຽດກຸ່ມເອກະສານ" : "ເພີ່ມລາຍລະອຽດກຸ່ມເອກະສານ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {detail && (
            <FormInput
              label="ລະຫັດ (dcgid)"
              theme="light"
              placeholder="ລະຫັດ"
              value={detail.dcgid}
              onChange={() => { }}
              disabled={true}
            />
          )}

          <Select
            label="ກຸ່ມເອກະສານ"
            theme="light"
            placeholder="ກະລຸນາເລືອກກຸ່ມເອກະສານ"
            value={formData.dcdid}
            onChange={handleChange("dcdid")}
            options={documentGroups.map((g) => ({
              value: String(g.dcdid),
              label: g.docgroupname,
            }))}
            inputRef={dcdidRef}
            error={errors.dcdid}
            hasError={!!errors.dcdid}
            searchable
            onSearch={handleGroupSearch}
            hasMore={groupHasMore}
            onLoadMore={handleGroupLoadMore}
            isLoadingMore={groupLoadingMore}
          />

          <Select
            label="ຜູ້ໃຊ້"
            theme="light"
            placeholder="ກະລຸນາເລືອກຜູ້ໃຊ້"
            value={formData.userid}
            onChange={handleChange("userid")}
            options={users.map((u) => ({
              value: String(u.usid),
              label: `${u.username} (${u.usercode})`,
            }))}
            inputRef={useridRef}
            error={errors.userid}
            hasError={!!errors.userid}
            searchable
            onSearch={handleUserSearch}
            hasMore={userHasMore}
            onLoadMore={handleUserLoadMore}
            isLoadingMore={userLoadingMore}
          />

          <FormInput
            label="ລາຍລະອຽດ (detailsinfo)"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
            value={formData.detailsinfo}
            onChange={handleChange("detailsinfo")}
            onKeyDown={handleKeyDown("maxsignmoney")}
            inputRef={detailsinfoRef}
            error={errors.detailsinfo}
            hasError={!!errors.detailsinfo}
          />

          <FormInput
            label="ຈຳນວນເງິນສູງສຸດ (maxsignmoney)"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຈຳນວນເງິນສູງສຸດ"
            value={formData.maxsignmoney}
            onChange={handleChange("maxsignmoney")}
            inputRef={maxsignmoneyRef}
            error={errors.maxsignmoney}
            hasError={!!errors.maxsignmoney}
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
        title={detail ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          detail
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນລາຍລະອຽດກຸ່ມເອກະສານ?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມລາຍລະອຽດກຸ່ມເອກະສານ?`
        }
        confirmText={detail ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={detail ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມລາຍລະອຽດ..."}
        successMessage={detail ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມລາຍລະອຽດສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
