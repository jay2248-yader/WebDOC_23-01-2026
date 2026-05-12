import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import ConfirmProgressDialog from "../components/common/ConfirmProgressDialog";
import DocumentGroupFormModal from "../components/document-groups/DocumentGroupFormModal";
import DocumentGroupDetailsFormModal from "../components/document-group-details/DocumentGroupDetailsFormModal";
import DocumentCategoryFormModal from "../components/document-categories/DocumentCategoryFormModal";
import { updateDocumentCategory } from "../services/documentcategoryservice";
import {
  getDocumentGroupByCategory,
  createNewDocumentGroup,
  updateDocumentGroup,
  deleteDocumentGroup,
} from "../services/documentgroupservice";
import {
  getDocumentGroupDetailsByDocgroupId,
  createNewDocumentGroupDetails,
  updateDocumentGroupDetails,
  deleteDocumentGroupDetails,
} from "../services/documentgroupdetailsservice";

function Pill({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-600 border-gray-200",
    indigo: "bg-[#0F75BC]/10 text-[#0F75BC] border-[#0F75BC]/25",
    blue: "bg-[#0F75BC]/10 text-[#0F75BC] border-[#0F75BC]/25",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}

function IconBtn({ tone = "blue", title, onClick, children }) {
  const tones = {
    blue: "bg-[#0F75BC]/15 text-[#0F75BC] hover:bg-[#0F75BC]/25",
    red: "bg-red-100 text-red-600 hover:bg-red-200",
    indigo: "bg-[#0F75BC] text-white hover:bg-[#0a5fa0]",
  };
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${tones[tone] || tones.blue}`}
    >
      {children}
    </button>
  );
}

const EditIcon = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const TrashIcon = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
  </svg>
);
const PlusIcon = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DocumentCategoryDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState(location.state?.category);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const submitCategory = async (formData) => {
    const updated = await updateDocumentCategory({ dctid: category.dctid, ...formData });
    setCategory((prev) => ({ ...prev, ...formData, ...(updated?.data || {}) }));
  };

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedGroups, setHasLoadedGroups] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [detailsMap, setDetailsMap] = useState({});

  // modals
  const [groupModal, setGroupModal] = useState({ open: false, editing: null });
  const [detailModal, setDetailModal] = useState({ open: false, editing: null });
  const [confirmDel, setConfirmDel] = useState({ open: false, status: "confirm", kind: null, item: null });
  const [blockedGroup, setBlockedGroup] = useState(null); // { dcdid, name, count } — กลุ่มที่ลบไม่ได้เพราะยังมี details

  const fetchDetails = useCallback((dcdid, force = false) => {
    setDetailsMap((prev) => {
      if (!force && prev[dcdid] && !prev[dcdid].error) return prev;
      const next = { ...prev, [dcdid]: { loading: true, error: null, data: [] } };
      getDocumentGroupDetailsByDocgroupId(dcdid)
        .then((res) => setDetailsMap((p) => ({ ...p, [dcdid]: { loading: false, error: null, data: res.data } })))
        .catch((err) => setDetailsMap((p) => ({ ...p, [dcdid]: { loading: false, error: err.message || "ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ", data: [] } })));
      return next;
    });
  }, []);

  const selectGroup = useCallback((dcdid) => {
    setSelectedId(dcdid);
    setBlockedGroup((prev) => (prev && prev.dcdid !== dcdid ? null : prev));
    fetchDetails(dcdid);
  }, [fetchDetails]);

  const refreshGroups = useCallback(async () => {
    if (!category?.dctid) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getDocumentGroupByCategory(category.dctid);
      setGroups([...data].sort((a, b) => (a.levelapprove ?? 0) - (b.levelapprove ?? 0)));
    } catch (err) {
      setError(err.message || "ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
    } finally {
      setLoading(false);
      setHasLoadedGroups(true);
    }
  }, [category.dctid]);

  useEffect(() => {
    if (!category?.dctid) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getDocumentGroupByCategory(category.dctid, controller.signal)
      .then((data) => setGroups([...data].sort((a, b) => (a.levelapprove ?? 0) - (b.levelapprove ?? 0))))
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError(err.message || "ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
        }
      })
      .finally(() => {
        setLoading(false);
        setHasLoadedGroups(true);
      });
    return () => controller.abort();
  }, [category.dctid]);

  // Group CRUD
  const openCreateGroup = () => setGroupModal({ open: true, editing: null });
  const openEditGroup = (g) => setGroupModal({ open: true, editing: g });
  const closeGroupModal = () => setGroupModal({ open: false, editing: null });
  const submitGroup = async (formData) => {
    if (groupModal.editing) {
      await updateDocumentGroup({ dcdid: groupModal.editing.dcdid, ...formData });
    } else {
      await createNewDocumentGroup({ ...formData, dctid: category.dctid });
    }
    await refreshGroups();
  };

  // Detail CRUD
  const openCreateDetail = () => setDetailModal({ open: true, editing: null });
  const openEditDetail = (d) => setDetailModal({ open: true, editing: d });
  const closeDetailModal = () => setDetailModal({ open: false, editing: null });
  const submitDetail = async (formData) => {
    if (detailModal.editing) {
      await updateDocumentGroupDetails({ dcgid: detailModal.editing.dcgid, ...formData });
    } else {
      await createNewDocumentGroupDetails({ ...formData, dcdid: selectedId });
    }
    if (selectedId) fetchDetails(selectedId, true);
  };

  // Delete handlers
  const requestDelete = async (kind, item) => {
    if (kind === "group") {
      let det = detailsMap[item.dcdid];
      if (!det || det.error || det.loading) {
        try {
          const res = await getDocumentGroupDetailsByDocgroupId(item.dcdid);
          setDetailsMap((p) => ({ ...p, [item.dcdid]: { loading: false, error: null, data: res.data } }));
          det = { data: res.data };
        } catch (err) {
          console.error("Failed to load group details:", err);
          det = { data: [] };
        }
      }
      if (det?.data?.length > 0) {
        setSelectedId(item.dcdid);
        setBlockedGroup((prev) => ({
          dcdid: item.dcdid,
          name: item.docgroupname,
          count: det.data.length,
          attempt: (prev?.dcdid === item.dcdid ? prev.attempt || 0 : 0) + 1,
        }));
        return;
      }
    }
    setConfirmDel({ open: true, status: "confirm", kind, item });
  };
  const cancelDelete = () => setConfirmDel({ open: false, status: "confirm", kind: null, item: null });
  const confirmDelete = async () => {
    const { kind, item } = confirmDel;
    setConfirmDel((s) => ({ ...s, status: "loading" }));
    try {
      if (kind === "group") {
        await deleteDocumentGroup(item.dcdid);
        if (selectedId === item.dcdid) setSelectedId(null);
        await refreshGroups();
      } else if (kind === "detail") {
        await deleteDocumentGroupDetails(item.dcgid);
        if (selectedId) fetchDetails(selectedId, true);
      }
      setConfirmDel((s) => ({ ...s, status: "success" }));
    } catch (err) {
      console.error(err);
      setConfirmDel({ open: false, status: "confirm", kind: null, item: null });
    }
  };

  const selectedDet = selectedId ? detailsMap[selectedId] : null;

  useEffect(() => {
    if (
      blockedGroup &&
      selectedId === blockedGroup.dcdid &&
      selectedDet &&
      !selectedDet.loading &&
      !selectedDet.error &&
      selectedDet.data.length === 0
    ) {
      setBlockedGroup(null);
    }
  }, [blockedGroup, selectedId, selectedDet]);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-sm text-gray-500">ບໍ່ພົບຂໍ້ມູນປະເພດເອກະສານ</p>
        <Button fullWidth={false} variant="outline" size="md" onClick={() => navigate("/document-category")}>
          ກັບຄືນ
        </Button>
      </div>
    );
  }

  const selectedGroup = groups.find((g) => g.dcdid === selectedId);
  const isBlockedView = blockedGroup && selectedId === blockedGroup.dcdid;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-3 h-[calc(100vh-7rem)]">
      {/* Top bar: back only */}
      <div className="flex items-center">
        <button
          onClick={() => navigate("/document-category")}
          style={{ boxShadow: "0 0 0 2px #bfdbfe, 0 4px 10px rgba(0, 10, 31, 0.15)" }}
          className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#0F75BC] text-sm font-semibold transition-all duration-200 hover:bg-[#0F75BC] hover:text-white hover:gap-3"
        >
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          ກັບຄືນ
        </button>
      </div>

      {/* Category banner (full width, compact) */}
      <div className="relative rounded-xl bg-[#0F75BC] text-white px-4 py-3 shadow-md flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">ປະເພດເອກະສານ</span>
            <span className="text-[10px] text-white/70 font-mono">#{category.dctid}</span>
          </div>
          <div className="text-base font-bold truncate mt-0.5">{category.doccategoryname || "-"}</div>
          {category.moreinfo && (
            <p className="text-[11px] text-white/80 mt-0.5 leading-snug line-clamp-1">{category.moreinfo}</p>
          )}
        </div>
        <div className="hidden md:flex flex-col items-end text-[11px] text-white/80 shrink-0 pl-3 border-l border-white/20">
          <span className="text-lg font-bold text-white tabular-nums">{loading ? "…" : groups.length}</span>
          <span>ກຸ່ມ</span>
        </div>
        <button
          type="button"
          onClick={() => setCategoryModalOpen(true)}
          title="ແກ້ໄຂປະເພດເອກະສານ"
          className="shrink-0 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors"
        >
          {EditIcon}
          ແກ້ໄຂ
        </button>
      </div>

      {/* Two-column: Groups | Details */}
      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[20rem_1fr] gap-3">

        {/* COLUMN: Groups */}
        <div className="flex flex-col min-h-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0F75BC]" />
              <h3 className="text-xs font-bold text-gray-700">ກຸ່ມເອກະສານ</h3>
              <span className="text-[10px] text-gray-500">({groups.length})</span>
            </div>
            <button
              type="button"
              onClick={openCreateGroup}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#0F75BC] hover:bg-[#0a5fa0] px-2 py-1 rounded-md transition-colors"
              title="ເພີ່ມກຸ່ມເອກະສານ"
            >
              {PlusIcon}
              ເພີ່ມ
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-2 space-y-1.5">
            {(loading || !hasLoadedGroups) && !error && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-full flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 animate-pulse">
                    <div className="w-7 h-7 rounded-md bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="flex gap-1">
                        <div className="h-3 bg-gray-100 rounded-full w-14" />
                        <div className="h-3 bg-gray-100 rounded-full w-20" />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <div className="w-7 h-7 rounded-md bg-gray-100" />
                      <div className="w-7 h-7 rounded-md bg-gray-100" />
                    </div>
                  </div>
                ))}
              </>
            )}
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">{error}</div>}
            {!loading && hasLoadedGroups && !error && groups.length === 0 && (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-xs text-gray-400">
                ຍັງບໍ່ມີກຸ່ມເອກະສານ
              </div>
            )}
            {!loading && hasLoadedGroups && !error && groups.map((g, i) => {
              const isSelected = selectedId === g.dcdid;
              return (
                <div
                  key={g.dcdid}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectGroup(g.dcdid)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectGroup(g.dcdid); } }}
                  className={`w-full flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all cursor-pointer ${isSelected ? "border-[#0F75BC] bg-[#0F75BC]/8 ring-1 ring-[#0F75BC]/30" : "border-gray-200 bg-white hover:border-[#0F75BC]/40 hover:bg-[#0F75BC]/5"}`}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${isSelected ? "bg-[#0F75BC] text-white" : "bg-[#0F75BC]/15 text-[#0F75BC]"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 truncate">{g.docgroupname || "-"}</div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <Pill tone="indigo">ລະດັບ {g.levelapprove ?? "-"}</Pill>
                      <Pill tone={g.comparing === "Y" ? "blue" : "gray"}>ປຽບທຽບ: {g.comparing || "-"}</Pill>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <IconBtn tone="blue" title="ແກ້ໄຂ" onClick={() => openEditGroup(g)}>{EditIcon}</IconBtn>
                    <IconBtn tone="red" title="ລຶບ" onClick={() => requestDelete("group", g)}>{TrashIcon}</IconBtn>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN: Details */}
        <div className="flex flex-col min-h-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {!selectedId && (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <div>
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                <p className="text-xs text-gray-400">ເລືອກກຸ່ມເອກະສານເພື່ອເບິ່ງລາຍລະອຽດ</p>
              </div>
            </div>
          )}

          {selectedId && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-slate-50">
                <span className="w-2 h-2 rounded-full bg-[#0F75BC]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F75BC]">ລາຍລະອຽດຂອງ</span>
                <span className="text-sm font-bold text-gray-800 truncate">{selectedGroup?.docgroupname || "-"}</span>
                {selectedDet && !selectedDet.loading && !selectedDet.error && (
                  <span className="text-[11px] text-gray-500">({selectedDet.data.length})</span>
                )}
                <button
                  type="button"
                  onClick={openCreateDetail}
                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#0F75BC] hover:bg-[#0a5fa0] px-2 py-1 rounded-md transition-colors"
                  title="ເພີ່ມລາຍລະອຽດ"
                >
                  {PlusIcon}
                  ເພີ່ມ
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-auto p-2 space-y-1.5">
                {isBlockedView && (
                  <div
                    key={`blocked-${blockedGroup.dcdid}-${blockedGroup.attempt}`}
                    className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2 animate-slideUp"
                  >
                    <svg className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div className="leading-relaxed">
                      <div className="font-bold">ບໍ່ສາມາດລຶບກຸ່ມ &quot;{blockedGroup.name}&quot; ໄດ້</div>
                      <div>ກະລຸນາລຶບລາຍລະອຽດທັງໝົດ ({blockedGroup.count} ລາຍການ) ດ້ານລຸ່ມກ່ອນ ຈຶ່ງຈະສາມາດລຶບກຸ່ມນີ້ໄດ້</div>
                    </div>
                  </div>
                )}
                {selectedDet?.loading && (
                  <div className="py-6 text-center text-xs text-gray-400">ກຳລັງໂຫຼດ...</div>
                )}
                {selectedDet?.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">{selectedDet.error}</div>
                )}
                {selectedDet && !selectedDet.loading && !selectedDet.error && selectedDet.data.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-xs text-gray-400">
                    ຍັງບໍ່ມີລາຍລະອຽດໃນກຸ່ມນີ້
                  </div>
                )}
                {selectedDet && !selectedDet.loading && !selectedDet.error && selectedDet.data.map((d) => (
                  <div
                    key={isBlockedView ? `${d.dcgid}-shake-${blockedGroup.attempt}` : d.dcgid}
                    className={`rounded-lg border px-2.5 py-2 transition-all duration-300 ${
                      isBlockedView
                        ? "border-red-400 bg-red-50/60 ring-1 ring-red-300 hover:bg-red-50 animate-shake animate-ring-red"
                        : "border-[#0F75BC]/15 bg-[#0F75BC]/3 hover:bg-[#0F75BC]/8"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-md bg-[#0F75BC]/10 text-[#0F75BC] flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-800 font-bold truncate">{d.usersmodel?.username || "-"}</div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-600 mt-0.5 flex-wrap">
                            {d.usersmodel?.usercode && (
                              <span className="font-mono bg-gray-100 px-1.5 rounded">{d.usersmodel.usercode}</span>
                            )}
                            {d.detailsinfo && <span className="truncate">{d.detailsinfo}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5 flex-wrap">
                            <span className="font-mono">#{d.dcgid}</span>
                            {d.usersmodel?.shortname && <><span>•</span><span>{d.usersmodel.shortname}</span></>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {d.maxsignmoney != null && (
                          <span className="text-xs font-bold text-[#0F75BC] tabular-nums whitespace-nowrap">
                            {Number(d.maxsignmoney).toLocaleString()} ₭
                          </span>
                        )}
                        <div className="flex gap-1">
                          <IconBtn tone="blue" title="ແກ້ໄຂ" onClick={() => openEditDetail(d)}>{EditIcon}</IconBtn>
                          <IconBtn tone="red" title="ລຶບ" onClick={() => requestDelete("detail", d)}>{TrashIcon}</IconBtn>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <DocumentCategoryFormModal
        key={`cat-${category?.dctid}`}
        isOpen={categoryModalOpen}
        category={category}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={submitCategory}
      />
      <DocumentGroupFormModal
        key={groupModal.editing?.dcdid || "new-group"}
        isOpen={groupModal.open}
        documentGroup={groupModal.editing}
        lockedDctid={category?.dctid}
        existingLevels={groups.map((g) => g.levelapprove).filter((v) => v != null)}
        onClose={closeGroupModal}
        onSubmit={submitGroup}
      />
      <DocumentGroupDetailsFormModal
        key={detailModal.editing?.dcgid || `new-detail-${selectedId || ""}`}
        isOpen={detailModal.open}
        detail={detailModal.editing}
        lockedDcdid={selectedId}
        onClose={closeDetailModal}
        onSubmit={submitDetail}
      />

      <ConfirmProgressDialog
        isOpen={confirmDel.open}
        status={confirmDel.status}
        danger
        title="ຢືນຢັນການລຶບ"
        message={
          confirmDel.kind === "group"
            ? `ທ່ານຕ້ອງການລຶບກຸ່ມ "${confirmDel.item?.docgroupname || ""}" ແທ້ບໍ?`
            : `ທ່ານຕ້ອງການລຶບລາຍລະອຽດ "${confirmDel.item?.detailsinfo || ""}" ແທ້ບໍ?`
        }
        confirmText="ລຶບ"
        loadingMessage="ກຳລັງລຶບ..."
        successMessage="ລຶບສຳເລັດ"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        onClose={cancelDelete}
      />
    </div>
  );
}
