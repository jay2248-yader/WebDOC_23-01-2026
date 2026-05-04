import BelowBody from "./BelowBody";
import PageShell from "./PageShell";

const PAGE_CLASS =
  "max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0";
const PAGE_STYLE = { fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" };

const autosize = (e) => {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
};

export default function BodyOverflowPages({
  bodyChunks,
  headerH,
  footerH,
  overflowPageRefs,
  bodyTextareaRefs,
  handleBodyChange,
  handleBodyKeyDown,
  tablePageChunks,
  belowBodyProps,
  remarkSplitProps,
}) {
  if (bodyChunks.length <= 1) return null;
  const lastChunkIdx = bodyChunks.length - 1;

  return bodyChunks.slice(1).map((chunk, idx) => {
    const chunkIdx = idx + 1;
    const isLastChunk = chunkIdx === lastChunkIdx;
    return (
      <div key={chunkIdx} data-pdf-page className={PAGE_CLASS} style={PAGE_STYLE}>
        <PageShell
          pageRef={(el) => {
            overflowPageRefs.current[idx] = el;
          }}
          extraClass=""
          headerH={headerH}
          footerH={footerH}
        >
          <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
            <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
              <div>
                <textarea
                  ref={(el) => {
                    bodyTextareaRefs.current[chunkIdx] = el;
                  }}
                  value={chunk}
                  onChange={(e) =>
                    handleBodyChange(chunkIdx, e.target.value, e.target.selectionStart, e.target.selectionEnd)
                  }
                  onKeyDown={(e) => handleBodyKeyDown(e, chunkIdx)}
                  placeholder="(ເນື້ອໃນຕໍ່)..."
                  rows={1}
                  onInput={autosize}
                  className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                />
              </div>
              {isLastChunk &&
                (tablePageChunks.length === 0 ? (
                  <BelowBody {...belowBodyProps} {...remarkSplitProps} />
                ) : tablePageChunks[0] && tablePageChunks[0].length > 0 ? (
                  <BelowBody
                    {...belowBodyProps}
                    partialSections={tablePageChunks[0]}
                    showClosing={tablePageChunks.length === 1}
                    {...(tablePageChunks.length === 1 ? remarkSplitProps : {})}
                  />
                ) : null)}
            </div>
          </div>
        </PageShell>
      </div>
    );
  });
}
