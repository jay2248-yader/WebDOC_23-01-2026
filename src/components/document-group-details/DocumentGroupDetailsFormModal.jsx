import { useRef, useEffect } from "react";
import useFormModal from "../../hooks/useFormModal";
import useSelectPagination from "../../hooks/useSelectPagination";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import { getAllDocumentGroup } from "../../services/documentgroupservice";
import { getAllUsers } from "../../services/userservice";

export default function DocumentGroupDetailsFormModal({
  isOpen,
  onClose,
  onSubmit,
  detail = null,
}) {
  const detailsinfoRef = useRef(null);
  const maxsignmoneyRef = useRef(null);

  const groups = useSelectPagination(getAllDocumentGroup);
  const users = useSelectPagination(getAllUsers);

  useEffect(() => {
    if (isOpen) {
      groups.reset();
      users.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    formData,
    errors,
    isClosing,
    submitDialog,
    shouldRender,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleCloseSubmit,
    handleClose,
  } = useFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData: {
      dcdid: detail?.dcdid ? String(detail.dcdid) : "",
      userid: detail?.userid ? String(detail.userid) : "",
      detailsinfo: detail?.detailsinfo || "",
      maxsignmoney: detail?.maxsignmoney || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.dcdid) e.dcdid = "ກະລຸນາປ້ອນລະຫັດກຸ່ມເອກະສານ";
      if (!data.userid) e.userid = "ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້";
      if (!data.detailsinfo) e.detailsinfo = "ກະລຸນາປ້ອນລາຍລະອຽດ";
      if (!data.maxsignmoney) e.maxsignmoney = "ກະລຸນາປ້ອນຈຳນວນເງິນສູງສຸດ";
      return e;
    },
    transformData: (data) => ({
      dcdid: parseInt(data.dcdid),
      userid: parseInt(data.userid),
      detailsinfo: data.detailsinfo,
      maxsignmoney: parseInt(data.maxsignmoney),
    }),
  });

  const handleKeyDown = (getRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getRef().current?.focus();
    }
  };

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={!!detail}
      entityName="ລາຍລະອຽດກຸ່ມເອກະສານ"
      displayName={formData.detailsinfo}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {detail ? "ແກ້ໄຂລາຍລະອຽດກຸ່ມເອກະສານ" : "ເພີ່ມລາຍລະອຽດກຸ່ມເອກະສານ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {detail && (
          <FormInput label="ລະຫັດ (dcgid)" theme="light" value={detail.dcgid} disabled />
        )}

        <Select
          label="ກຸ່ມເອກະສານ"
          theme="light"
          placeholder="ກະລຸນາເລືອກກຸ່ມເອກະສານ"
          value={formData.dcdid}
          onChange={handleChange("dcdid")}
          options={groups.items.map((g) => ({ value: String(g.dcdid), label: g.docgroupname }))}
          error={errors.dcdid}
          hasError={!!errors.dcdid}
          searchable
          onSearch={groups.handleSearch}
          hasMore={groups.hasMore}
          onLoadMore={groups.handleLoadMore}
          isLoadingMore={groups.loadingMore}
        />

        <Select
          label="ຜູ້ໃຊ້"
          theme="light"
          placeholder="ກະລຸນາເລືອກຜູ້ໃຊ້"
          value={formData.userid}
          onChange={handleChange("userid")}
          options={users.items.map((u) => ({ value: String(u.usid), label: `${u.username} (${u.usercode})` }))}
          error={errors.userid}
          hasError={!!errors.userid}
          searchable
          onSearch={users.handleSearch}
          hasMore={users.hasMore}
          onLoadMore={users.handleLoadMore}
          isLoadingMore={users.loadingMore}
        />

        <FormInput
          label="ລາຍລະອຽດ (detailsinfo)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
          value={formData.detailsinfo}
          onChange={handleChange("detailsinfo")}
          onKeyDown={handleKeyDown(() => maxsignmoneyRef)}
          inputRef={detailsinfoRef}
          error={errors.detailsinfo}
          hasError={!!errors.detailsinfo}
        />

        <FormInput
          label="ຈຳນວນເງິນສູງສຸດ (maxsignmoney)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຈຳນວນເງິນສູງສຸດ"
          value={formData.maxsignmoney}
          onChange={handleChange("maxsignmoney", (v) => v.replace(/[^0-9]/g, ""))}
          inputRef={maxsignmoneyRef}
          error={errors.maxsignmoney}
          hasError={!!errors.maxsignmoney}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" fullWidth={false} variant="secondary" size="md" onClick={handleClose}>
            ຍົກເລີກ
          </Button>
          <Button type="submit" fullWidth={false} variant="outline" size="md" className="bg-[#0F75BC] text-white hover:bg-blue-700">
            ສຳເລັດ
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
}
