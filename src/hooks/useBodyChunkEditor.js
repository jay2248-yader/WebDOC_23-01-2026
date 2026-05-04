import { useCallback, useLayoutEffect, useRef } from "react";

export function useBodyChunkEditor({
  bodyChunks,
  setBodyChunks,
  setBodyParagraph,
  rqdid,
  storeSetBodyParagraph,
  body1Ref,
}) {
  const cursorStateRef = useRef({ chunkIdx: null, start: 0, end: 0 });
  const bodyTextareaRefs = useRef([]);

  // Restore cursor after recalcChunks re-splits bodyChunks
  useLayoutEffect(() => {
    const { chunkIdx, start, end } = cursorStateRef.current;
    if (chunkIdx === null) return;
    const ta = chunkIdx === 0 ? body1Ref.current : bodyTextareaRefs.current[chunkIdx];
    if (!ta) return;
    ta.selectionStart = start;
    ta.selectionEnd = end;
  }, [bodyChunks, body1Ref]);

  const handleBodyChange = useCallback(
    (chunkIdx, newChunkValue, cursorStart, cursorEnd) => {
      if (cursorStart !== undefined) {
        cursorStateRef.current = { chunkIdx, start: cursorStart, end: cursorEnd ?? cursorStart };
      }
      const newChunks = [...bodyChunks];
      newChunks[chunkIdx] = newChunkValue;
      setBodyChunks(newChunks);
      const newFull = newChunks.join("");
      setBodyParagraph(newFull);
      if (rqdid) storeSetBodyParagraph(rqdid, newFull);
    },
    [bodyChunks, rqdid, storeSetBodyParagraph, setBodyChunks, setBodyParagraph]
  );

  const handleBodyKeyDown = useCallback(
    (e, chunkIdx) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = "        ";
      const chunk = bodyChunks[chunkIdx] || "";
      const newPos = start + spaces.length;
      handleBodyChange(chunkIdx, chunk.substring(0, start) + spaces + chunk.substring(end), newPos, newPos);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = newPos;
      });
    },
    [bodyChunks, handleBodyChange]
  );

  return { handleBodyChange, handleBodyKeyDown, bodyTextareaRefs };
}
