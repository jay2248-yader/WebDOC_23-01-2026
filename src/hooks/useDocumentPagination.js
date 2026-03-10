import { useState, useEffect, useRef, useCallback } from "react";
import { HEADER_HEIGHT_PX, FOOTER_HEIGHT_PX } from "../components/document-preview/constants";

export function useDocumentPagination({ bodyParagraph, titleTableSections, reqTo, reqReason, references, remark }) {
    const [bodyChunks, setBodyChunks] = useState([""]);
    const [tablePageChunks, setTablePageChunks] = useState([]);

    const page1Ref = useRef(null);
    const body1Ref = useRef(null);
    const belowBodyMeasureRef = useRef(null);
    const closingMeasureRef = useRef(null);
    const measureRef = useRef(null);
    const overflowPageRefs = useRef({});
    const extraPageRefs = useRef({});

    const recalcChunks = useCallback(() => {
        const page1El = page1Ref.current;
        const body1Ta = body1Ref.current;
        const measureDiv = measureRef.current;
        if (!page1El || !body1Ta || !measureDiv) return;

        const belowBodyEl = belowBodyMeasureRef.current;
        const belowBodyHeight = belowBodyEl ? belowBodyEl.scrollHeight : 0;

        // ── ล็อกขนาดตาม A4 เสมอ (ไม่ขึ้นกับจอ) ──
        // CSS: 1mm = 96/25.4 px (ค่าคงที่ตามมาตรฐาน CSS)
        const MM_TO_PX = 96 / 25.4;
        const pageHeightPx = 297 * MM_TO_PX;

        const contentAreaTop = HEADER_HEIGHT_PX;
        const contentAreaBottom = pageHeightPx - FOOTER_HEIGHT_PX;
        const contentAreaHeight = contentAreaBottom - contentAreaTop;

        const contentEl = page1El.querySelector("[data-content-area]");
        const bodyRect = body1Ta.getBoundingClientRect();
        const contentRect = contentEl ? contentEl.getBoundingClientRect() : page1El.getBoundingClientRect();
        const bodyTopInContent = bodyRect.top - contentRect.top;

        const availP1WithBelow = contentAreaHeight - bodyTopInContent - belowBodyHeight;
        const availP1BodyOnly = contentAreaHeight - bodyTopInContent;

        const availOverflow = contentAreaHeight - 30;

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

        const text = bodyParagraph || "";
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

        if (!text) { setBodyChunks([""]); setTablePageChunks([]); return; }

        const fullHeight = measureHeight(text);
        if (fullHeight <= availP1WithBelow) { setBodyChunks([text]); setTablePageChunks([]); return; }

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

        const reserveForBelow = titleTableSections.length === 0 ? belowBodyHeight : 0;
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

        if (titleTableSections.length === 0) {
            const lastText = chunks[chunks.length - 1] || "";
            const lastTextH = lastText ? measureHeight(lastText) : 0;
            const lastPageAvail2 = chunks.length === 1 ? availP1BodyOnly : availOverflow;
            const spaceLeft = lastPageAvail2 - lastTextH;
            if (closingHeight > spaceLeft && chunks[chunks.length - 1] !== "") {
                chunks.push("");
            }
            setBodyChunks(chunks);
            setTablePageChunks([]);
            return;
        }

        const ITEM_BUFFER = 4;
        const getElemH = (el) => el ? (el.offsetHeight || el.getBoundingClientRect().height || el.scrollHeight) + ITEM_BUFFER : 24;
        const belowEl = belowBodyMeasureRef.current;
        const items = [];
        for (let si = 0; si < titleTableSections.length; si++) {
            const section = titleTableSections[si];
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
            return;
        }

        const tableChunksItems = [];
        let curItems = [];
        let curHeight = 0;
        let isFirstPage = true;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const pageAvail = isFirstPage ? (spaceOnFirstTablePage - PAGE_BUFFER) : (availOverflow - PAGE_BUFFER);

            const needed = curHeight + item.height;

            if (needed > pageAvail && (curItems.length > 0 || isFirstPage)) {
                tableChunksItems.push([...curItems]);
                curItems = isFirstPage && needed > pageAvail ? [item] : [item];
                curHeight = item.height;
                isFirstPage = false;
            } else {
                curItems.push(item);
                curHeight += item.height;
            }
        }
        if (curItems.length > 0) tableChunksItems.push([...curItems]);

        const lastTableChunkH = tableChunksItems[tableChunksItems.length - 1]?.reduce((s, i) => s + i.height, 0) || 0;
        const lastTablePageAvail = tableChunksItems.length === 1 ? (spaceOnFirstTablePage - PAGE_BUFFER) : (availOverflow - PAGE_BUFFER);
        if (lastTableChunkH + closingHeight > lastTablePageAvail) {
            tableChunksItems.push([]);
        }

        const toSections = (itemList) => {
            const sMap = {};
            for (const item of itemList) {
                if (!sMap[item.si]) sMap[item.si] = { cells: [] };
                if (item.type === 'title') sMap[item.si].title = item.text;
                else if (item.type === 'row') sMap[item.si].cells.push(item.data);
                else if (item.type === 'summary') sMap[item.si].summaryRow = item.data;
            }
            return Object.values(sMap);
        };

        const tablePageChunksLocal = tableChunksItems.map(itemList => toSections(itemList));
        setBodyChunks(chunks);
        setTablePageChunks(tablePageChunksLocal);
    }, [bodyParagraph, titleTableSections, reqTo, reqReason, references, remark]);

    useEffect(() => {
        const page1El = page1Ref.current;
        if (!page1El) return;
        const observer = new ResizeObserver(recalcChunks);
        observer.observe(page1El);
        if (body1Ref.current) observer.observe(body1Ref.current);
        return () => observer.disconnect();
    }, [recalcChunks]);

    useEffect(() => {
        const id = setTimeout(recalcChunks, 0);
        return () => clearTimeout(id);
    }, [recalcChunks]);

    return {
        bodyChunks,
        setBodyChunks,
        tablePageChunks,
        page1Ref,
        body1Ref,
        belowBodyMeasureRef,
        closingMeasureRef,
        measureRef,
        overflowPageRefs,
        extraPageRefs
    };
}
