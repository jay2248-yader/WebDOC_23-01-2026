import { useState, useEffect, useRef, useCallback } from "react";
import { HEADER_HEIGHT_PX, FOOTER_HEIGHT_PX } from "../components/document-preview/constants";

// ความสูงคงที่ของส่วนลายเซ็น (ດັ່ງນັ້ນ... + ຮຽນມາ... + ຜູ້ສະເໜີ + margins)
const SIGNATURE_HEIGHT_PX = 90;

export function useDocumentPagination({
    bodyParagraph, titleTableSections, reqTo, reqReason, references, remark,
    headerHeight = HEADER_HEIGHT_PX,
    footerHeight = FOOTER_HEIGHT_PX,
}) {
    const [bodyChunks, setBodyChunks] = useState([""]);
    const [tablePageChunks, setTablePageChunks] = useState([]);
    const [remarkChunks, setRemarkChunks] = useState(null); // null = ไม่ split, ใช้ remark เต็ม

    const page1Ref = useRef(null);
    const body1Ref = useRef(null);
    const belowBodyMeasureRef = useRef(null);
    const closingMeasureRef = useRef(null);
    const measureRef = useRef(null);
    const overflowPageRefs = useRef({});
    const extraPageRefs = useRef({});

    // Store latest values in refs so recalcChunks doesn't need them as deps
    const bodyParagraphRef = useRef(bodyParagraph);
    const titleTableSectionsRef = useRef(titleTableSections);
    const remarkRef = useRef(remark);
    const headerHeightRef = useRef(headerHeight);
    const footerHeightRef = useRef(footerHeight);
    useEffect(() => {
        bodyParagraphRef.current = bodyParagraph;
        titleTableSectionsRef.current = titleTableSections;
        remarkRef.current = remark;
        headerHeightRef.current = headerHeight;
        footerHeightRef.current = footerHeight;
    }, [bodyParagraph, titleTableSections, remark, headerHeight, footerHeight]);

    const recalcChunks = useCallback(() => {
        const page1El = page1Ref.current;
        const body1Ta = body1Ref.current;
        const measureDiv = measureRef.current;
        if (!page1El || !body1Ta || !measureDiv) return;

        const currentBodyParagraph = bodyParagraphRef.current;
        const currentTitleTableSections = titleTableSectionsRef.current;
        const currentRemark = remarkRef.current || "";

        const belowBodyEl = belowBodyMeasureRef.current;
        const belowBodyHeight = belowBodyEl ? belowBodyEl.scrollHeight : 0;

        const MM_TO_PX = 96 / 25.4;
        const pageHeightPx = 297 * MM_TO_PX;

        const contentAreaTop = headerHeightRef.current;
        const contentAreaBottom = pageHeightPx - footerHeightRef.current;
        const contentAreaHeight = contentAreaBottom - contentAreaTop;

        const contentEl = page1El.querySelector("[data-content-area]");
        const bodyRect = body1Ta.getBoundingClientRect();
        const contentRect = contentEl ? contentEl.getBoundingClientRect() : page1El.getBoundingClientRect();
        const bodyTopInContent = bodyRect.top - contentRect.top;

        const availP1WithBelow = contentAreaHeight - bodyTopInContent - belowBodyHeight;
        const availP1BodyOnly = contentAreaHeight - bodyTopInContent;
        const availOverflow = contentAreaHeight - 40;

        // ── ล็อก measurement width เป็น 174mm (content area) ──
        const contentWidthMm = 174;
        const cs = getComputedStyle(body1Ta);
        Object.assign(measureDiv.style, {
            width: `${contentWidthMm}mm`,
            font: cs.font,
            fontSize: cs.fontSize,
            fontFamily: cs.fontFamily,
            lineHeight: cs.lineHeight,
            letterSpacing: cs.letterSpacing,
            textIndent: "1.6rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            padding: cs.padding,
            boxSizing: "border-box",
        });

        const text = currentBodyParagraph || "";
        const measureHeight = (str) => {
            measureDiv.textContent = str || "\u00A0";
            return measureDiv.scrollHeight;
        };

        const findSplit = (startIdx, available) => {
            if (available <= 30) return startIdx;
            let lo = startIdx, hi = text.length;
            while (lo < hi) {
                const mid = Math.floor((lo + hi + 1) / 2);
                if (measureHeight(text.substring(startIdx, mid)) <= available) lo = mid;
                else hi = mid - 1;
            }
            let split = lo;
            const nl = text.lastIndexOf("\n", split - 1);
            const sp = text.lastIndexOf(" ", split - 1);
            if (nl >= startIdx && nl > startIdx + (split - startIdx) * 0.95) split = nl + 1;
            else if (sp >= startIdx && sp > startIdx + (split - startIdx) * 0.95) split = sp + 1;
            return split;
        };

        // ── Helper: split remark text across pages ──
        const splitRemarkText = (remarkText, firstPageAvail, overflowAvail) => {
            if (!remarkText) return null;
            // วัด remark ด้วย textIndent: 0 (remark ไม่มี indent)
            measureDiv.style.textIndent = "0";
            const measureRemarkH = (str) => {
                measureDiv.textContent = str || "\u00A0";
                return measureDiv.scrollHeight;
            };
            const fullRemarkH = measureRemarkH(remarkText);
            // Closing = ໝາຍເຫດ label (mt-6=24px + text~24px = ~48px) + remark + signature
            const labelH = 48;
            // First chunk ไม่แสดง signature (showSignature=false) → ไม่ต้อง reserve ที่
            const remarkAvailFirst = firstPageAvail - labelH;

            if (fullRemarkH + labelH + SIGNATURE_HEIGHT_PX <= firstPageAvail) {
                // closing พอดีหน้าปัจจุบัน
                measureDiv.style.textIndent = "1.6rem";
                return null;
            }

            // Binary search split สำหรับ remark
            const findRemarkSplit = (startIdx, available) => {
                if (available <= 20) return startIdx;
                let lo = startIdx, hi = remarkText.length;
                while (lo < hi) {
                    const mid = Math.floor((lo + hi + 1) / 2);
                    if (measureRemarkH(remarkText.substring(startIdx, mid)) <= available) lo = mid;
                    else hi = mid - 1;
                }
                let split = lo;
                const nl = remarkText.lastIndexOf("\n", split - 1);
                const sp = remarkText.lastIndexOf(" ", split - 1);
                if (nl >= startIdx && nl > startIdx + (split - startIdx) * 0.95) split = nl + 1;
                else if (sp >= startIdx && sp > startIdx + (split - startIdx) * 0.95) split = sp + 1;
                return split;
            };

            const chunks = [];
            let cursor = 0;

            // Chunk แรก: ใส่ได้เท่าที่ firstPage มีที่ว่าง
            if (remarkAvailFirst > 20) {
                const split = findRemarkSplit(0, remarkAvailFirst);
                if (split > 0) {
                    chunks.push(remarkText.substring(0, split));
                    cursor = split;
                } else {
                    chunks.push("");
                }
            } else {
                chunks.push("");
            }

            // Chunk ถัดไป: overflow pages (สำรองที่สำหรับ signature ใน chunk สุดท้าย)
            while (cursor < remarkText.length) {
                const remaining = remarkText.substring(cursor);
                const remainingH = measureRemarkH(remaining);
                if (remainingH + SIGNATURE_HEIGHT_PX <= overflowAvail) {
                    chunks.push(remaining);
                    cursor = remarkText.length;
                    break;
                }

                // ยังเหลือเยอะ → split ใส่เต็มหน้า (ไม่ต้องเก็บที่ให้ signature)
                const split = findRemarkSplit(cursor, overflowAvail);
                if (split <= cursor) {
                    chunks.push(remarkText.substring(cursor, cursor + 1));
                    cursor += 1;
                } else {
                    // เช็คว่า remaining หลัง split พอดี signature page หรือยัง
                    const afterSplit = remarkText.substring(split);
                    const afterSplitH = afterSplit ? measureRemarkH(afterSplit) : 0;
                    if (afterSplitH + SIGNATURE_HEIGHT_PX <= overflowAvail) {
                        // remaining จะพอดีหน้าสุดท้าย → split ตรงนี้
                        chunks.push(remarkText.substring(cursor, split));
                        cursor = split;
                    } else {
                        // ยังเหลือเยอะ → ใส่เต็มหน้า
                        chunks.push(remarkText.substring(cursor, split));
                        cursor = split;
                    }
                }
            }

            // Restore textIndent
            measureDiv.style.textIndent = "1.6rem";
            return chunks.length > 1 ? chunks : null;
        };

        // ── Main body splitting logic ──
        if (!text) { setBodyChunks([""]); setTablePageChunks([]); setRemarkChunks(null); return; }

        const fullHeight = measureHeight(text);
        if (fullHeight <= availP1WithBelow) { setBodyChunks([text]); setTablePageChunks([]); setRemarkChunks(null); return; }

        const chunks = [];
        let cursor = 0;

        if (fullHeight <= availP1BodyOnly) {
            chunks.push(text);
            cursor = text.length;
        } else {
            const split1 = findSplit(0, availP1BodyOnly);
            chunks.push(text.substring(0, split1));
            cursor = split1;
        }

        const reserveForBelow = currentTitleTableSections.length === 0 ? belowBodyHeight : 0;
        while (cursor < text.length) {
            const remaining = text.substring(cursor);
            const remainingHeight = measureHeight(remaining);

            if (remainingHeight + reserveForBelow <= availOverflow) {
                chunks.push(remaining);
                cursor = text.length;
                break;
            }

            const split = findSplit(cursor, availOverflow);
            if (split <= cursor) { chunks.push(text.substring(cursor, cursor + 1)); cursor += 1; }
            else { chunks.push(text.substring(cursor, split)); cursor = split; }
        }

        const closingEl = closingMeasureRef.current;
        const closingHeight = closingEl ? closingEl.scrollHeight : 0;

        if (currentTitleTableSections.length === 0) {
            const lastText = chunks[chunks.length - 1] || "";
            const lastTextH = lastText ? measureHeight(lastText) : 0;
            const lastPageAvail = chunks.length === 1 ? availP1BodyOnly : availOverflow;
            const spaceLeft = lastPageAvail - lastTextH;
            const freshPageAvail = availOverflow;

            if (closingHeight <= spaceLeft) {
                // Closing พอดี → ไม่ต้อง split
                setBodyChunks(chunks);
                setTablePageChunks([]);
                setRemarkChunks(null);
                return;
            }

            if (closingHeight <= freshPageAvail) {
                // Closing พอดีหน้าใหม่ → ดันไปหน้าใหม่
                if (chunks[chunks.length - 1] !== "") chunks.push("");
                setBodyChunks(chunks);
                setTablePageChunks([]);
                setRemarkChunks(null);
                return;
            }

            // Closing ไม่พอทั้งหน้าปัจจุบันและหน้าใหม่ → split remark
            const rmChunks = splitRemarkText(currentRemark, spaceLeft, freshPageAvail);
            setBodyChunks(chunks);
            setTablePageChunks([]);
            setRemarkChunks(rmChunks);
            return;
        }

        // ── Table section chunking ──
        const ITEM_BUFFER = 4;
        const getElemH = (el) => el ? (el.offsetHeight || el.getBoundingClientRect().height || el.scrollHeight) + ITEM_BUFFER : 24;
        const belowEl = belowBodyMeasureRef.current;
        const SECTION_GAP_PX = 16;
        const items = [];
        for (let si = 0; si < currentTitleTableSections.length; si++) {
            const section = currentTitleTableSections[si];
            if (si > 0) {
                items.push({ type: 'gap', si, height: SECTION_GAP_PX });
            }
            if (section.title) {
                const el = belowEl?.querySelector(`[data-measure-item="title-${si}"]`);
                items.push({ type: 'title', si, text: section.title, height: getElemH(el) });
            }
            for (let ri = 0; ri < (section.cells || []).length; ri++) {
                const el = belowEl?.querySelector(`tr[data-measure-item="row-${si}-${ri}"]`);
                items.push({ type: 'row', si, ri, data: section.cells[ri], height: getElemH(el) });
            }
            if (section.summaryRow) {
                const el = belowEl?.querySelector(`tr[data-measure-item="summary-${si}"]`);
                items.push({ type: 'summary', si, data: section.summaryRow, height: getElemH(el) });
            }
        }

        const PAGE_BUFFER = 4;
        const lastBodyText = chunks[chunks.length - 1] || "";
        const lastBodyH = lastBodyText ? measureHeight(lastBodyText) : 0;
        const lastBodyPageAvail = chunks.length === 1 ? availP1BodyOnly : availOverflow;
        const spaceOnFirstTablePage = lastBodyPageAvail - lastBodyH - PAGE_BUFFER;

        const totalBelowH = belowBodyHeight;

        if (totalBelowH <= spaceOnFirstTablePage) {
            setBodyChunks(chunks);
            setTablePageChunks([]);
            setRemarkChunks(null);
            return;
        }

        const tableChunksItems = [];
        let curItems = [];
        let curHeight = 0;
        let isFirstPage = true;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const pageAvail = isFirstPage ? spaceOnFirstTablePage : (availOverflow - PAGE_BUFFER);

            const needed = curHeight + item.height;

            if (needed > pageAvail && (curItems.length > 0 || isFirstPage)) {
                tableChunksItems.push([...curItems]);
                curItems = [item];
                curHeight = item.height;
                isFirstPage = false;
            } else {
                curItems.push(item);
                curHeight += item.height;
            }
        }
        if (curItems.length > 0) tableChunksItems.push([...curItems]);

        const lastTableChunkH = tableChunksItems[tableChunksItems.length - 1]?.reduce((s, i) => s + i.height, 0) || 0;
        const lastTablePageAvail = tableChunksItems.length === 1 ? spaceOnFirstTablePage : (availOverflow - PAGE_BUFFER);
        const freshTablePageAvail = availOverflow - PAGE_BUFFER;

        if (lastTableChunkH + closingHeight <= lastTablePageAvail) {
            // Closing พอดีหน้าสุดท้ายของตาราง
            const tpLocal = tableChunksItems.map(il => toSections(il));
            setBodyChunks(chunks);
            setTablePageChunks(tpLocal);
            setRemarkChunks(null);
            return;
        }

        if (closingHeight <= freshTablePageAvail) {
            // Closing พอดีหน้าใหม่ → ดันไปหน้าใหม่
            tableChunksItems.push([]);
            const tpLocal = tableChunksItems.map(il => toSections(il));
            setBodyChunks(chunks);
            setTablePageChunks(tpLocal);
            setRemarkChunks(null);
            return;
        }

        // Closing ไม่พอทั้งสองแบบ → split remark across pages
        const spaceForClosingOnLastTablePage = lastTablePageAvail - lastTableChunkH;
        const rmChunks = splitRemarkText(currentRemark, spaceForClosingOnLastTablePage, freshTablePageAvail);
        const tpLocal = tableChunksItems.map(il => toSections(il));
        setBodyChunks(chunks);
        setTablePageChunks(tpLocal);
        setRemarkChunks(rmChunks);

        function toSections(itemList) {
            const sMap = {};
            for (const item of itemList) {
                if (item.type === 'gap') continue;
                if (!sMap[item.si]) sMap[item.si] = { cells: [] };
                if (item.type === 'title') sMap[item.si].title = item.text;
                else if (item.type === 'row') sMap[item.si].cells.push(item.data);
                else if (item.type === 'summary') sMap[item.si].summaryRow = item.data;
            }
            return Object.values(sMap);
        }
    }, []);

    // ResizeObserver ตั้งครั้งเดียว + debounce
    useEffect(() => {
        const page1El = page1Ref.current;
        if (!page1El) return;
        let debounceId = null;
        const debouncedRecalc = () => {
            if (debounceId) clearTimeout(debounceId);
            debounceId = setTimeout(recalcChunks, 80);
        };
        const observer = new ResizeObserver(debouncedRecalc);
        observer.observe(page1El);
        if (body1Ref.current) observer.observe(body1Ref.current);
        return () => { observer.disconnect(); clearTimeout(debounceId); };
    }, [recalcChunks]);

    // Trigger recalc เมื่อ content เปลี่ยน (รอ font โหลดก่อน ป้องกันวัดผิด)
    useEffect(() => {
        let id;
        let cancelled = false;
        document.fonts.ready.then(() => {
            if (!cancelled) id = setTimeout(recalcChunks, 0);
        });
        return () => { cancelled = true; clearTimeout(id); };
    }, [recalcChunks, bodyParagraph, titleTableSections, reqTo, reqReason, references, remark, headerHeight, footerHeight]);

    return {
        bodyChunks,
        setBodyChunks,
        tablePageChunks,
        remarkChunks,
        page1Ref,
        body1Ref,
        belowBodyMeasureRef,
        closingMeasureRef,
        measureRef,
        overflowPageRefs,
        extraPageRefs
    };
}
