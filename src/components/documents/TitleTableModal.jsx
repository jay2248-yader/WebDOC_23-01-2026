import { useState, useEffect, useRef, useCallback } from "react";
import Button from "../common/Button";

// Cell: { value, colspan, rowspan } or null (hidden by merge)
const makeCell = (value = "") => ({ value, colspan: 1, rowspan: 1 });

const createEmptySection = () => ({
  title: "",
  colCount: 3,
  cells: [
    [makeCell("ລຳດັບ"), makeCell("ລາຍລະອຽດ"), makeCell("ລວມເປັນເງິນ (ກີບ)")],
    [makeCell("1"), makeCell(""), makeCell("")],
  ],
  summaryRow: null,
});

// Convert any old format → new format (all rows in cells)
const normalizeSection = (s) => {
  let cells;
  let colCount = s.colCount;

  // New format: cells already contains cell objects (all rows)
  if (s.cells && s.cells[0] && typeof s.cells[0][0] === "object" && s.cells[0][0] !== null) {
    cells = s.cells.map((r) => r.map((c) => (c ? { ...c } : null)));
    colCount = s.colCount || cells[0].length;
  } else if (s.headerRow) {
    // Old format: separate headerRow + cells
    const headerRow = s.headerRow.map((c) => (c ? { ...c } : null));
    const dataCells = (s.cells || []).map((r) => r.map((c) => (c ? { ...c } : null)));
    cells = [headerRow, ...dataCells];
    colCount = s.colCount || headerRow.length;
  } else if (s.columns) {
    // Legacy format: columns (strings) + rows (strings)
    const headers = s.columns;
    colCount = headers.length;
    const headerRow = headers.map((h) => makeCell(h));
    const dataCells = (s.rows || []).map((r) =>
      r.map((v) => makeCell(typeof v === "string" ? v : v?.value || ""))
    );
    cells = [headerRow, ...dataCells];
  } else {
    cells = [[makeCell(""), makeCell(""), makeCell("")]];
    colCount = 3;
  }

  return {
    title: s.title,
    colCount,
    cells,
    summaryRow: s.summaryRow ? { ...s.summaryRow, values: [...s.summaryRow.values] } : null,
  };
};

export default function TitleTableModal({ isOpen, onClose, onSave, initialSections = [] }) {
  const [isClosing, setIsClosing] = useState(false);
  const [sections, setSections] = useState([createEmptySection()]);
  const [sel, setSel] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  // openPicker: null | "bg-{si}" | "color-{si}"
  const [openPicker, setOpenPicker] = useState(null);
  const tableRefs = useRef({});
  const pickerRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      setSections(
        initialSections.length > 0
          ? initialSections.map(normalizeSection)
          : [createEmptySection()]
      );
      setSel(null);
      setCtxMenu(null);
      setOpenPicker(null);
    }
  }, [isOpen]);

  // Close context menu on scroll/click
  useEffect(() => {
    const handler = () => setCtxMenu(null);
    if (ctxMenu) {
      window.addEventListener("click", handler);
      window.addEventListener("scroll", handler, true);
    }
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [ctxMenu]);

  // Close picker when clicking outside
  useEffect(() => {
    if (!openPicker) return;
    const handler = (e) => {
      const ref = pickerRefs.current[openPicker];
      if (ref && !ref.contains(e.target)) {
        setOpenPicker(null);
      }
    };
    // Use mousedown so it fires before button onClick
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [openPicker]);

  // Clear drag on mouseup
  useEffect(() => {
    const handler = () => setIsDragging(false);
    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        if (openPicker) {
          setOpenPicker(null);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isClosing, handleClose, openPicker]);

  if (!isOpen && !isClosing) return null;

  const handleSave = () => {
    const output = sections.map((s) => ({
      title: s.title,
      colCount: s.colCount,
      columns: s.cells[0] ? s.cells[0].map((c) => c?.value || "") : [],
      rows: s.cells.slice(1).map((row) => row.map((c) => c?.value || "")),
      cells: s.cells,
      summaryRow: s.summaryRow,
    }));
    onSave(output);
    handleClose();
  };

  const update = (si, patch) => {
    setSections((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  };

  // ── Section actions ──
  const addSection = () => setSections((prev) => [...prev, createEmptySection()]);
  const removeSection = (si) =>
    setSections((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== si)));
  const duplicateSection = (si) => {
    setSections((prev) => {
      const copy = normalizeSection(JSON.parse(JSON.stringify(prev[si])));
      const next = [...prev];
      next.splice(si + 1, 0, copy);
      return next;
    });
  };

  // ── Column actions ──
  const addColumnAt = (si, ci) => {
    const s = sections[si];
    const cells = s.cells.map((row) => {
      const r = [...row];
      r.splice(ci, 0, makeCell(""));
      return r;
    });
    let summaryRow = null;
    if (s.summaryRow) {
      const { label, labelColspan, values } = s.summaryRow;
      if (ci < labelColspan) {
        summaryRow = { label, labelColspan: labelColspan + 1, values: [...values] };
      } else {
        const newValues = [...values];
        const insertAt = Math.min(ci - labelColspan, newValues.length);
        newValues.splice(insertAt, 0, "");
        summaryRow = { label, labelColspan, values: newValues };
      }
    }
    update(si, { colCount: s.colCount + 1, cells, summaryRow });
  };

  const removeColumnAt = (si, ci) => {
    const s = sections[si];
    if (s.colCount <= 1) return;
    const cells = s.cells.map((row) => row.filter((_, i) => i !== ci));
    let summaryRow = null;
    if (s.summaryRow) {
      let { label, labelColspan, values } = s.summaryRow;
      if (ci < labelColspan) {
        labelColspan = Math.max(1, labelColspan - 1);
        const newValCount = s.colCount - 1 - labelColspan;
        summaryRow = {
          label,
          labelColspan,
          values: Array(newValCount).fill("").map((_, i) => values[i] ?? ""),
        };
      } else {
        const vi = ci - labelColspan;
        const newValues = values.filter((_, i) => i !== vi);
        summaryRow = { label, labelColspan, values: newValues };
      }
    }
    update(si, { colCount: s.colCount - 1, cells, summaryRow });
  };

  // ── Row actions ──
  const addRowAt = (si, ri) => {
    const s = sections[si];
    const newRow = Array.from({ length: s.colCount }, () => makeCell(""));
    const cells = [...s.cells];
    cells.splice(ri, 0, newRow);
    update(si, { cells });
  };

  const removeRowAt = (si, ri) => {
    const s = sections[si];
    if (s.cells.length <= 1) return;
    update(si, { cells: s.cells.filter((_, i) => i !== ri) });
  };

  const moveRow = (si, ri, dir) => {
    const cells = [...sections[si].cells];
    const t = ri + dir;
    if (t < 0 || t >= cells.length) return;
    [cells[ri], cells[t]] = [cells[t], cells[ri]];
    update(si, { cells });
  };

  const updateCellAt = (si, ri, ci, value) => {
    const cells = sections[si].cells.map((r) => r.map((c) => (c ? { ...c } : null)));
    if (cells[ri] && cells[ri][ci]) cells[ri][ci].value = value;
    update(si, { cells });
  };

  // ── Selection helpers ──
  const getSelRange = () => {
    if (!sel) return null;
    return {
      si: sel.si,
      r1: Math.min(sel.startR, sel.endR),
      r2: Math.max(sel.startR, sel.endR),
      c1: Math.min(sel.startC, sel.endC),
      c2: Math.max(sel.startC, sel.endC),
    };
  };

  const isCellSelected = (si, ri, ci) => {
    const range = getSelRange();
    if (!range || range.si !== si) return false;
    return ri >= range.r1 && ri <= range.r2 && ci >= range.c1 && ci <= range.c2;
  };

  const handleCellMouseDown = (si, ri, ci, e) => {
    if (e.button === 2) return;
    setIsDragging(true);
    setSel({ si, startR: ri, startC: ci, endR: ri, endC: ci });
    setOpenPicker(null);
  };

  const handleCellMouseEnter = (si, ri, ci) => {
    if (isDragging && sel && sel.si === si) {
      setSel((prev) => ({ ...prev, endR: ri, endC: ci }));
    }
  };

  // ── Merge / Unmerge ──
  const canMerge = () => {
    const range = getSelRange();
    if (!range) return false;
    return range.r2 > range.r1 || range.c2 > range.c1;
  };

  const mergeCells = () => {
    const range = getSelRange();
    if (!range) return;
    const { si, r1, r2, c1, c2 } = range;
    const s = sections[si];
    const cells = s.cells.map((r) => r.map((c) => (c ? { ...c } : null)));

    const texts = [];
    for (let r = r1; r <= r2; r++) {
      if (!cells[r]) continue;
      for (let c = c1; c <= c2; c++) {
        if (cells[r][c]?.value) texts.push(cells[r][c].value);
      }
    }

    if (cells[r1] && cells[r1][c1]) {
      cells[r1][c1] = {
        value: texts.join(" "),
        colspan: c2 - c1 + 1,
        rowspan: r2 - r1 + 1,
      };
    }

    for (let r = r1; r <= r2; r++) {
      if (!cells[r]) continue;
      for (let c = c1; c <= c2; c++) {
        if (r === r1 && c === c1) continue;
        cells[r][c] = null;
      }
    }

    update(si, { cells });
    setSel(null);
  };

  const unmergeCells = () => {
    const range = getSelRange();
    if (!range) return;
    const { si, r1, r2, c1, c2 } = range;
    const s = sections[si];
    const cells = s.cells.map((r) => r.map((c) => (c ? { ...c } : null)));

    const toRestore = new Map();
    for (let r = r1; r <= r2; r++) {
      if (!cells[r]) continue;
      for (let c = c1; c <= c2; c++) {
        const cell = cells[r][c];
        if (cell && (cell.colspan > 1 || cell.rowspan > 1)) {
          for (let dr = 0; dr < cell.rowspan; dr++) {
            for (let dc = 0; dc < cell.colspan; dc++) {
              toRestore.set(`${r + dr},${c + dc}`, dr === 0 && dc === 0 ? cell.value : "");
            }
          }
        }
        if (!cell) {
          toRestore.set(`${r},${c}`, "");
        }
      }
    }

    toRestore.forEach((value, key) => {
      const [r, c] = key.split(",").map(Number);
      if (cells[r]) cells[r][c] = makeCell(value);
    });

    update(si, { cells });
    setSel(null);
  };

  // ── Cell coloring ──
  const BG_COLORS = [
    { label: "ບໍ່ມີສີ", value: "" },
    { label: "ຟ້າ", value: "#0F75BC" },
    { label: "ຟ້າອ່ອນ", value: "#DBEAFE" },
    { label: "ເຫຼືອງ", value: "#FEF9C3" },
    { label: "ຂຽວ", value: "#DCFCE7" },
    { label: "ແດງ", value: "#FEE2E2" },
    { label: "ເທົາ", value: "#F3F4F6" },
    { label: "ດຳ", value: "#1F2937" },
  ];

  const TEXT_COLORS = [
    { label: "ດຳ", value: "" },
    { label: "ຂາວ", value: "#FFFFFF" },
    { label: "ຟ້າ", value: "#0F75BC" },
    { label: "ແດງ", value: "#DC2626" },
    { label: "ຂຽວ", value: "#16A34A" },
    { label: "ເທົາ", value: "#6B7280" },
  ];

  const applyColorToSelection = (prop, color) => {
    const range = getSelRange();
    if (!range) return;
    const { si, r1, r2, c1, c2 } = range;
    const cells = sections[si].cells.map((r) => r.map((c) => (c ? { ...c } : null)));
    for (let r = r1; r <= r2; r++) {
      if (!cells[r]) continue;
      for (let c = c1; c <= c2; c++) {
        if (cells[r][c]) cells[r][c][prop] = color;
      }
    }
    update(si, { cells });
    setOpenPicker(null);
  };

  const hasMergedInSelection = () => {
    const range = getSelRange();
    if (!range) return false;
    const { si, r1, r2, c1, c2 } = range;
    const s = sections[si];
    for (let r = r1; r <= r2; r++) {
      if (!s.cells[r]) continue;
      for (let c = c1; c <= c2; c++) {
        const cell = s.cells[r][c];
        if (!cell) return true;
        if (cell.colspan > 1 || cell.rowspan > 1) return true;
      }
    }
    return false;
  };

  // ── Keyboard navigation ──
  const handleKeyDown = (si, ri, ci, e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (openPicker) {
        setOpenPicker(null);
      } else {
        handleClose();
      }
      return;
    }

    const s = sections[si];
    if (e.key === "Tab") {
      e.preventDefault();
      const dir = e.shiftKey ? -1 : 1;
      let nr = ri;
      let nc = ci + dir;

      if (nc >= s.colCount) { nr++; nc = 0; }
      if (nc < 0) { nr--; nc = s.colCount - 1; }
      if (nr < 0) return;

      setSections((prev) => {
        const curr = prev[si];
        let updatedSections = prev;
        if (nr >= curr.cells.length) {
          const newRow = Array.from({ length: curr.colCount }, () => makeCell(""));
          const newCells = [...curr.cells, newRow];
          updatedSections = prev.map((sec, i) => (i === si ? { ...sec, cells: newCells } : sec));
        }
        requestAnimationFrame(() => {
          const target = updatedSections[si];
          let fr = nr, fc = nc;
          const maxAttempts = target.cells.length * target.colCount;
          let attempts = 0;
          while (attempts < maxAttempts) {
            if (!target.cells[fr]) break;
            if (target.cells[fr][fc]) break;
            fc += dir;
            if (fc >= target.colCount) { fr++; fc = 0; }
            if (fc < 0) { fr--; fc = target.colCount - 1; }
            if (fr >= target.cells.length || fr < 0) break;
            attempts++;
          }
          tableRefs.current[`${si}-${fr}-${fc}`]?.focus();
        });
        return updatedSections;
      });
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const nr = ri + 1;
      setSections((prev) => {
        const curr = prev[si];
        let updatedSections = prev;
        if (nr >= curr.cells.length) {
          const newRow = Array.from({ length: curr.colCount }, () => makeCell(""));
          const newCells = [...curr.cells, newRow];
          updatedSections = prev.map((sec, i) => (i === si ? { ...sec, cells: newCells } : sec));
        }
        requestAnimationFrame(() => {
          tableRefs.current[`${si}-${nr}-${ci}`]?.focus();
        });
        return updatedSections;
      });
    }
  };

  // ── Context menu ──
  const handleContextMenu = (si, ri, ci, e) => {
    e.preventDefault();
    const menuWidth = 180;
    const menuHeight = 280;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);

    setCtxMenu({ x, y, si, ri, ci });
    setOpenPicker(null);
    if (!isCellSelected(si, ri, ci)) {
      setSel({ si, startR: ri, startC: ci, endR: ri, endC: ci });
    }
  };

  // ── Summary row ──
  const toggleSummaryRow = (si) => {
    const s = sections[si];
    if (s.summaryRow) {
      update(si, { summaryRow: null });
      return;
    }
    const lc = Math.min(3, s.colCount);
    update(si, {
      summaryRow: {
        label: "ລວມມູນຄ່າທັງໝົດ/ກີບ",
        labelColspan: lc,
        values: Array(s.colCount - lc).fill(""),
      },
    });
  };

  const getSelForSection = (si) => {
    if (!sel || sel.si !== si) return { selRi: 0, selCi: 0, hasSelection: false };
    return {
      selRi: Math.min(sel.startR, sel.endR),
      selCi: Math.min(sel.startC, sel.endC),
      hasSelection: true,
    };
  };

  // ── Render cell ──
  const renderCell = (si, ri, cell, ci) => {
    if (!cell) return null;
    const selected = isCellSelected(si, ri, ci);
    const cellStyle = {};
    if (cell.bg) cellStyle.backgroundColor = cell.bg;
    if (cell.color) cellStyle.color = cell.color;
    return (
      <td
        key={ci}
        colSpan={cell.colspan}
        rowSpan={cell.rowspan}
        className={`border border-gray-400 p-0 ${
          selected ? "ring-2 ring-blue-400 ring-inset" : ""
        }`}
        style={!selected ? cellStyle : { ...cellStyle, backgroundColor: undefined }}
        onMouseDown={(e) => handleCellMouseDown(si, ri, ci, e)}
        onMouseEnter={() => handleCellMouseEnter(si, ri, ci)}
        onContextMenu={(e) => handleContextMenu(si, ri, ci, e)}
      >
        <textarea
          ref={(el) => {
            tableRefs.current[`${si}-${ri}-${ci}`] = el;
          }}
          value={cell.value}
          onChange={(e) => updateCellAt(si, ri, ci, e.target.value)}
          onKeyDown={(e) => handleKeyDown(si, ri, ci, e)}
          rows={1}
          className={`w-full min-w-15 px-2 py-1.5 text-xs focus:outline-none resize-none ${
            selected ? "bg-blue-100" : "bg-transparent"
          }`}
          style={{ color: cell.color || undefined }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />
      </td>
    );
  };

  // ── Toolbar button ──
  const TBtn = ({ onClick, title, children, disabled = false, danger = false, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 text-xs rounded border cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "border-red-300 text-red-600 hover:bg-red-50"
          : active
          ? "border-blue-400 text-blue-700 bg-blue-50"
          : "border-gray-300 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );

  // ── Color Picker Dropdown (click-based) ──
  const ColorPickerDropdown = ({ pickerKey, colors, onSelect, triggerLabel, disabled, previewStyle }) => {
    const isOpen = openPicker === pickerKey;

    const handleToggle = (e) => {
      e.stopPropagation();
      if (disabled) return;
      setOpenPicker(isOpen ? null : pickerKey);
    };

    return (
      <div
        className="relative"
        ref={(el) => { pickerRefs.current[pickerKey] = el; }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          title={triggerLabel}
          className={`px-2 py-1 text-xs rounded border cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 ${
            isOpen
              ? "border-blue-400 text-blue-700 bg-blue-50"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {previewStyle}
          {triggerLabel}
          <span className="ml-0.5 text-[9px]">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex gap-1 z-[9999] flex-wrap"
            style={{ minWidth: "9rem" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {colors.map((c) => (
              <button
                key={c.value || "none"}
                type="button"
                title={c.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(c.value);
                }}
                className="w-7 h-7 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center relative"
                style={{ backgroundColor: c.value || "#fff" }}
              >
                {!c.value && (
                  <span className="text-red-400 text-[10px] font-bold leading-none">✕</span>
                )}
              </button>
            ))}
            {/* Color labels row */}
            <div className="w-full pt-1 border-t border-gray-100 mt-1">
              {colors.map((c) => (
                <button
                  key={`lbl-${c.value || "none"}`}
                  type="button"
                  title={c.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(c.value);
                  }}
                  className="w-full text-left px-1 py-0.5 text-[10px] text-gray-600 hover:bg-gray-50 rounded flex items-center gap-1.5"
                >
                  <span
                    className="w-3 h-3 rounded-sm border border-gray-300 inline-block shrink-0"
                    style={{ backgroundColor: c.value || "#fff" }}
                  />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={() => {
        setOpenPicker(null);
        handleClose();
      }}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-[#0F75BC] pb-3">
          ສ້າງ Title + Table
        </h3>

        <div className="space-y-8">
          {sections.map((section, si) => {
            const { selRi, selCi, hasSelection } = getSelForSection(si);
            const bgPickerKey = `bg-${si}`;
            const colorPickerKey = `color-${si}`;

            // Current selected cell colors for preview
            const selCell = hasSelection ? section.cells[selRi]?.[selCi] : null;
            const currentBg = selCell?.bg || "";
            const currentColor = selCell?.color || "";

            return (
              <div key={si} className="border border-gray-200 rounded-lg p-4">
                {/* Section header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#0F75BC]">Section {si + 1}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => duplicateSection(si)}
                      className="text-[#0F75BC] hover:underline text-xs cursor-pointer"
                    >
                      ສຳເນົາ
                    </button>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSection(si)}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        ລົບ
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => update(si, { title: e.target.value })}
                    className="w-full rounded-lg border border-blue-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BC]"
                    placeholder="ປ້ອນ Title... (ເຊັ່ນ: ສະຫຼຸບການນຳໃຊ້ງົບປະມານ)"
                  />
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 flex-wrap mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <TBtn
                    onClick={() => addRowAt(si, hasSelection ? selRi : 0)}
                    title="ເພີ່ມແຖວດ້ານເທິງ"
                  >
                    ▲ ແຖວ
                  </TBtn>
                  <TBtn
                    onClick={() =>
                      addRowAt(
                        si,
                        hasSelection
                          ? Math.max(sel.startR, sel.endR) + 1
                          : section.cells.length
                      )
                    }
                    title="ເພີ່ມແຖວດ້ານລຸ່ມ"
                  >
                    ▼ ແຖວ
                  </TBtn>
                  <span className="w-px h-5 bg-gray-300 mx-1" />
                  <TBtn
                    onClick={() => addColumnAt(si, hasSelection ? selCi : 0)}
                    title="ເພີ່ມຄໍລຳດ້ານຊ້າຍ"
                  >
                    ◀ ຄໍລຳ
                  </TBtn>
                  <TBtn
                    onClick={() =>
                      addColumnAt(
                        si,
                        hasSelection ? Math.max(sel.startC, sel.endC) + 1 : section.colCount
                      )
                    }
                    title="ເພີ່ມຄໍລຳດ້ານຂວາ"
                  >
                    ▶ ຄໍລຳ
                  </TBtn>
                  <span className="w-px h-5 bg-gray-300 mx-1" />
                  <TBtn
                    onClick={() => hasSelection && removeRowAt(si, selRi)}
                    title="ລົບແຖວ"
                    disabled={!hasSelection || section.cells.length <= 1}
                    danger
                  >
                    ລົບແຖວ
                  </TBtn>
                  <TBtn
                    onClick={() => hasSelection && removeColumnAt(si, selCi)}
                    title="ລົບຄໍລຳ"
                    disabled={!hasSelection || section.colCount <= 1}
                    danger
                  >
                    ລົບຄໍລຳ
                  </TBtn>
                  <span className="w-px h-5 bg-gray-300 mx-1" />
                  <TBtn onClick={mergeCells} title="ລວມເຊລ (Merge)" disabled={!canMerge()}>
                    ⊞ Merge
                  </TBtn>
                  <TBtn
                    onClick={unmergeCells}
                    title="ແຍກເຊລ (Unmerge)"
                    disabled={!hasMergedInSelection()}
                  >
                    ⊟ Unmerge
                  </TBtn>
                  <span className="w-px h-5 bg-gray-300 mx-1" />
                  <TBtn onClick={() => toggleSummaryRow(si)}>
                    {section.summaryRow ? "⊖ ລົບສະຫຼຸບ" : "⊕ ສະຫຼຸບ"}
                  </TBtn>
                  {section.summaryRow && (
                    <>
                      <span className="text-xs text-gray-500 ml-1">Merge:</span>
                      <input
                        type="number"
                        min={1}
                        max={section.colCount - 1}
                        value={section.summaryRow.labelColspan}
                        onChange={(e) => {
                          const n = Math.max(
                            1,
                            Math.min(section.colCount - 1, Number(e.target.value) || 1)
                          );
                          const old = section.summaryRow.values;
                          update(si, {
                            summaryRow: {
                              ...section.summaryRow,
                              labelColspan: n,
                              values: Array(section.colCount - n)
                                .fill("")
                                .map((_, i) => old[i] ?? ""),
                            },
                          });
                        }}
                        className="w-10 rounded border border-gray-300 px-1 py-0.5 text-xs text-center"
                      />
                    </>
                  )}
                  <span className="w-px h-5 bg-gray-300 mx-1" />

                  {/* Background color picker — click to open */}
                  <ColorPickerDropdown
                    pickerKey={bgPickerKey}
                    colors={BG_COLORS}
                    onSelect={(color) => applyColorToSelection("bg", color)}
                    triggerLabel="ສີພື້ນ"
                    disabled={!hasSelection}
                    previewStyle={
                      <span
                        className="w-3 h-3 rounded border border-gray-400 shrink-0"
                        style={{ backgroundColor: currentBg || "#fff" }}
                      />
                    }
                  />

                  {/* Text color picker — click to open */}
                  <ColorPickerDropdown
                    pickerKey={colorPickerKey}
                    colors={TEXT_COLORS}
                    onSelect={(color) => applyColorToSelection("color", color)}
                    triggerLabel="ສີຕົວໜັງສື"
                    disabled={!hasSelection}
                    previewStyle={
                      <span
                        className="font-bold text-[11px] shrink-0"
                        style={{ color: currentColor || "#000" }}
                      >
                        A
                      </span>
                    }
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-gray-400 rounded">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      {section.cells.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => renderCell(si, ri, cell, ci))}
                        </tr>
                      ))}
                      {section.summaryRow && (
                        <tr className="bg-gray-100 font-bold">
                          <td
                            colSpan={section.summaryRow.labelColspan}
                            className="border border-gray-400 p-0"
                          >
                            <input
                              type="text"
                              value={section.summaryRow.label}
                              onChange={(e) =>
                                update(si, {
                                  summaryRow: { ...section.summaryRow, label: e.target.value },
                                })
                              }
                              className="w-full px-2 py-1.5 text-xs font-bold focus:outline-none focus:bg-blue-50 bg-gray-100"
                            />
                          </td>
                          {section.summaryRow.values.map((val, vi) => (
                            <td key={vi} className="border border-gray-400 p-0">
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => {
                                  const v = [...section.summaryRow.values];
                                  v[vi] = e.target.value;
                                  update(si, {
                                    summaryRow: { ...section.summaryRow, values: v },
                                  });
                                }}
                                className="w-full px-2 py-1.5 text-xs font-bold focus:outline-none focus:bg-blue-50 bg-gray-100"
                              />
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-gray-400 mt-1">
                  Tab = ເຊລຕໍ່ໄປ | Enter = ແຖວຖັດໄປ | ຄິກລາກ = ເລືອກເຊລ | ຄິກຂວາ = ເມນູ | Esc =
                  ປິດ | ທາສີ header ເອງ
                </p>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addSection}
          className="mt-4 w-full border-2 border-dashed border-[#0F75BC] text-[#0F75BC] rounded-lg py-2 text-sm font-bold hover:bg-blue-50 cursor-pointer"
        >
          + ເພີ່ມ Section
        </button>

        <div className="flex justify-between pt-6">
          <Button type="button" fullWidth={false} variant="outline" size="md" onClick={handleClose}>
            ຍົກເລີກ
          </Button>
          <Button
            type="button"
            fullWidth={false}
            variant="outline"
            size="md"
            className="bg-[#0F75BC] text-white border-[#0F75BC] hover:bg-[#0d65a3]"
            onClick={handleSave}
          >
            ບັນທຶກ
          </Button>
        </div>
      </div>

      {/* Context Menu */}
      {ctxMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999] min-w-45"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <CtxItem
            onClick={() => {
              addRowAt(ctxMenu.si, ctxMenu.ri);
              setCtxMenu(null);
            }}
          >
            ▲ ເພີ່ມແຖວດ້ານເທິງ
          </CtxItem>
          <CtxItem
            onClick={() => {
              addRowAt(ctxMenu.si, ctxMenu.ri + 1);
              setCtxMenu(null);
            }}
          >
            ▼ ເພີ່ມແຖວດ້ານລຸ່ມ
          </CtxItem>
          <CtxItem
            onClick={() => {
              addColumnAt(ctxMenu.si, ctxMenu.ci);
              setCtxMenu(null);
            }}
          >
            ◀ ເພີ່ມຄໍລຳດ້ານຊ້າຍ
          </CtxItem>
          <CtxItem
            onClick={() => {
              addColumnAt(ctxMenu.si, ctxMenu.ci + 1);
              setCtxMenu(null);
            }}
          >
            ▶ ເພີ່ມຄໍລຳດ້ານຂວາ
          </CtxItem>
          <div className="border-t border-gray-200 my-1" />
          {canMerge() && (
            <CtxItem
              onClick={() => {
                mergeCells();
                setCtxMenu(null);
              }}
            >
              ⊞ ລວມເຊລ (Merge)
            </CtxItem>
          )}
          {hasMergedInSelection() && (
            <CtxItem
              onClick={() => {
                unmergeCells();
                setCtxMenu(null);
              }}
            >
              ⊟ ແຍກເຊລ (Unmerge)
            </CtxItem>
          )}
          <div className="border-t border-gray-200 my-1" />
          <CtxItem
            onClick={() => {
              moveRow(ctxMenu.si, ctxMenu.ri, -1);
              setCtxMenu(null);
            }}
            disabled={ctxMenu.ri === 0}
          >
            ↑ ຍ້າຍແຖວຂຶ້ນ
          </CtxItem>
          <CtxItem
            onClick={() => {
              moveRow(ctxMenu.si, ctxMenu.ri, 1);
              setCtxMenu(null);
            }}
            disabled={ctxMenu.ri >= sections[ctxMenu.si].cells.length - 1}
          >
            ↓ ຍ້າຍແຖວລົງ
          </CtxItem>
          <div className="border-t border-gray-200 my-1" />
          <CtxItem
            onClick={() => {
              removeRowAt(ctxMenu.si, ctxMenu.ri);
              setCtxMenu(null);
            }}
            danger
            disabled={sections[ctxMenu.si].cells.length <= 1}
          >
            ລົບແຖວ
          </CtxItem>
          <CtxItem
            onClick={() => {
              removeColumnAt(ctxMenu.si, ctxMenu.ci);
              setCtxMenu(null);
            }}
            danger
            disabled={sections[ctxMenu.si].colCount <= 1}
          >
            ລົບຄໍລຳ
          </CtxItem>
        </div>
      )}
    </div>
  );
}

function CtxItem({ onClick, children, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-1.5 text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}