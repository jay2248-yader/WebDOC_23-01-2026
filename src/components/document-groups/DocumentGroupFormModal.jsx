import { useRef, useEffect } from "react";
import useFormModal from "../../hooks/useFormModal";
import useSelectPagination from "../../hooks/useSelectPagination";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import { getAllDocumentCategories } from "../../services/documentcategoryservice";

export default function DocumentGroupFormModal({
  isOpen,
  onClose,
  onSubmit,
  documentGroup = null,
}) {
  const docgroupnameRef = useRef(null);
  const levelapproveRef = useRef(null);
  const comparingRef = useRef(null);

  const categories = useSelectPagination(getAllDocumentCategories);

  useEffect(() => {
    if (isOpen) categories.reset();
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
      docgroupname: documentGroup?.docgroupname || "",
      levelapprove: documentGroup?.levelapprove || "",
      comparing: documentGroup?.comparing || "N",
      dctid: documentGroup?.dctid ? String(documentGroup.dctid) : "",
    },
    validate: (data) => {
      const e = {};
      if (!data.docgroupname) e.docgroupname = "ກະລຸນາປ້ອນຊື່ກຸ່ມເອກະສານ";
      if (!data.levelapprove) e.levelapprove = "ກະລຸນາປ້ອນລະດັບອະນຸມັດ";
      if (!data.dctid) e.dctid = "ກະລຸນາປ້ອນລະຫັດປະເພດເອກະສານ";
      return e;
    },
    transformData: (data) => ({
      docgroupname: data.docgroupname,
      levelapprove: parseInt(data.levelapprove),
      comparing: data.comparing,
      dctid: parseInt(data.dctid),
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
      isEditing={!!documentGroup}
      entityName="ກຸ່ມເອກະສານ"
      displayName={formData.docgroupname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {documentGroup ? "ແກ້ໄຂກຸ່ມເອກະສານ" : "ເພີ່ມກຸ່ມເອກະສານ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {documentGroup && (
          <FormInput label="ລະຫັດ (dcdid)" theme="light" value={documentGroup.dcdid} disabled />
        )}

        <Select
          label="ປະເພດເອກະສານ"
          theme="light"
          placeholder="ກະລຸນາເລືອກປະເພດເອກະສານ"
          value={formData.dctid}
          onChange={handleChange("dctid")}
          options={categories.items.map((c) => ({ value: String(c.dctid), label: c.doccategoryname }))}
          error={errors.dctid}
          hasError={!!errors.dctid}
          searchable
          onSearch={categories.handleSearch}
          hasMore={categories.hasMore}
          onLoadMore={categories.handleLoadMore}
          isLoadingMore={categories.loadingMore}
        />

        <FormInput
          label="ຊື່ກຸ່ມເອກະສານ (docgroupname)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ກຸ່ມເອກະສານ"
          value={formData.docgroupname}
          onChange={handleChange("docgroupname")}
          onKeyDown={handleKeyDown(() => levelapproveRef)}
          inputRef={docgroupnameRef}
          error={errors.docgroupname}
          hasError={!!errors.docgroupname}
        />

        <FormInput
          label="ລະດັບອະນຸມັດ (levelapprove)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລະດັບອະນຸມັດ (ຕົວເລກ)"
          value={formData.levelapprove}
          onChange={handleChange("levelapprove", (v) => v.replace(/[^0-9]/g, ""))}
          onKeyDown={handleKeyDown(() => comparingRef)}
          inputRef={levelapproveRef}
          error={errors.levelapprove}
          hasError={!!errors.levelapprove}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">ການປຽບທຽບ (comparing)</label>
          <select
            ref={comparingRef}
            value={formData.comparing}
            onChange={handleChange("comparing")}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Y">ແມ່ນ (Y)</option>
            <option value="N">ບໍ່ແມ່ນ (N)</option>
          </select>
        </div>

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
