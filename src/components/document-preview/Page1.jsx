import BelowBody from "./BelowBody";
import DocNumberRow from "./DocNumberRow";
import PageShell from "./PageShell";

const PAGE_CLASS =
  "relative max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0 mb-4 print:mb-0";
const PAGE_STYLE = { fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" };

const autosize = (e) => {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
};

function formatDate(dateStr) {
  if (!dateStr) return "......./......./.......";
  const [y, m, d] = dateStr.split(" ")[0].split("-");
  return `${d}/${m}/${y}`;
}

export default function Page1({
  docData,
  headerH,
  footerH,
  page1Ref,
  body1Ref,
  rqdid,
  reqTo,
  setReqTo,
  storeSetReqTo,
  reqReason,
  setReqReason,
  storeSetReqReason,
  references,
  setReferences,
  storeSetReferences,
  datatableHeaders = [],
  forsItems = [],
  onChangeForsItem,
  onAddForsItem,
  onDeleteForsItem,
  onChangeDatatableHeader,
  bodyChunks,
  handleBodyChange,
  handleBodyKeyDown,
  tablePageChunks,
  belowBodyProps,
  remarkSplitProps,
}) {
  return (
    <div data-pdf-page className={PAGE_CLASS} style={PAGE_STYLE}>
      <div
        style={{
          position: "absolute",
          top: Math.round(0.52 * headerH + 20),
          left: 8,
          right: 8,
          zIndex: 15,
          pointerEvents: "none",
        }}
      >
        <DocNumberRow
          reqNo={docData.req_no}
          date={formatDate(docData.createdate)}
          shortboard={docData.req_shortboard}
        />
      </div>
      <PageShell pageRef={page1Ref} isFirstPage extraClass="" headerH={headerH} footerH={footerH}>
        <div data-content-area className="h-full overflow-hidden print:overflow-hidden">
          <h1
            className="text-center text-xl font-bold text-black mb-2"
            style={{ marginTop: Math.max(4, Math.round(61 - 0.48 * headerH)) }}
          >
            {docData.documentcategorymodel?.doccategoryname || "ໃບສະເໜີ"}
          </h1>

          <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
            {/* ຮຽນ */}
            <div className="flex">
              <span className="font-bold text-black whitespace-nowrap">ຮຽນ :&nbsp;</span>
              <textarea
                value={reqTo}
                onChange={(e) => {
                  setReqTo(e.target.value);
                  if (rqdid) storeSetReqTo(rqdid, e.target.value);
                }}
                placeholder="ພິມຊື່ຜູ້ຮັບ..."
                rows={1}
                onInput={autosize}
                className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
              />
            </div>

            {/* ເລື່ອງ */}
            <div className="flex">
              <span className="font-bold text-black whitespace-nowrap">ເລື່ອງ :&nbsp;</span>
              <textarea
                value={reqReason}
                onChange={(e) => {
                  setReqReason(e.target.value);
                  if (rqdid) storeSetReqReason(rqdid, e.target.value);
                }}
                placeholder="ພິມເລື່ອງ..."
                rows={1}
                onInput={autosize}
                className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
              />
            </div>

            {/* ອີງຕາມ — from datatableHeaders (forsItems split by L2) */}
            {datatableHeaders.length > 0 || onAddForsItem ? (
              <div>
                <ul className="list-none space-y-1">
                  {forsItems.map((fors, index) => (
                    <li key={index} className="flex items-start">
                      <span className="whitespace-nowrap">ອີງຕາມ :&nbsp;</span>
                      {onChangeForsItem ? (
                        <textarea
                          value={fors}
                          onChange={(e) => onChangeForsItem(index, e.target.value)}
                          rows={1}
                          onInput={autosize}
                          className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                        />
                      ) : (
                        <span className="text-gray-800 break-all">{fors}</span>
                      )}
                      {onDeleteForsItem && forsItems.length > 1 && (
                        <button
                          onClick={() => onDeleteForsItem(index)}
                          className="text-red-400 hover:text-red-600 ml-1 print:hidden"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {onAddForsItem && (
                  <button
                    onClick={onAddForsItem}
                    className="text-blue-500 hover:text-blue-700 text-xs mt-1 print:hidden"
                  >
                    + ເພີ່ມອີງຕາມ
                  </button>
                )}
              </div>
            ) : (
              <div className={references.every((r) => !r.trim()) ? "print:hidden" : ""}>
                <ul className="list-none space-y-1">
                  {references.map((item, index) => (
                    <li
                      key={index}
                      className="relative before:content-['-'] before:absolute before:-left-4 flex items-start"
                    >
                      <span className="whitespace-nowrap">ອີງຕາມ :&nbsp;</span>
                      <textarea
                        value={item}
                        onChange={(e) => {
                          const updated = [...references];
                          updated[index] = e.target.value;
                          setReferences(updated);
                          if (rqdid) storeSetReferences(rqdid, updated);
                        }}
                        placeholder="ພິມອີງຕາມ..."
                        rows={1}
                        onInput={autosize}
                        className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                      />
                      {references.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = references.filter((_, i) => i !== index);
                            setReferences(updated);
                            if (rqdid) storeSetReferences(rqdid, updated);
                          }}
                          className="text-red-400 hover:text-red-600 ml-1 print:hidden"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const updated = [...references, ""];
                    setReferences(updated);
                    if (rqdid) storeSetReferences(rqdid, updated);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-xs mt-1 print:hidden"
                >
                  + ເພີ່ມອີງຕາມ
                </button>
              </div>
            )}

            {/* Body chunk 0 / ເນຶ້ອໃນ from datatableHeaders */}
            {datatableHeaders.length > 0 ? (
              <div ref={body1Ref}>
                {datatableHeaders.map((item) => (
                  onChangeDatatableHeader ? (
                    <textarea
                      key={item.ids}
                      value={item.details ?? ""}
                      onChange={(e) => onChangeDatatableHeader(item.ids, { details: e.target.value })}
                      rows={1}
                      onInput={autosize}
                      style={{ textIndent: "1.6rem" }}
                      className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                    />
                  ) : (
                    <p key={item.ids} className="text-gray-800 break-all" style={{ textIndent: "1.6rem" }}>
                      {item.details}
                    </p>
                  )
                ))}
              </div>
            ) : (
              <div className={!(bodyChunks[0] ?? "").trim() ? "print:hidden" : ""}>
                <textarea
                  ref={body1Ref}
                  value={bodyChunks[0] ?? ""}
                  onChange={(e) => handleBodyChange(0, e.target.value, e.target.selectionStart, e.target.selectionEnd)}
                  onKeyDown={(e) => handleBodyKeyDown(e, 0)}
                  placeholder="ພິມເນື້ອໃນ..."
                  rows={1}
                  onInput={autosize}
                  style={{ textIndent: "1.6rem" }}
                  className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                />
              </div>
            )}

            {bodyChunks.length === 1 &&
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
}
