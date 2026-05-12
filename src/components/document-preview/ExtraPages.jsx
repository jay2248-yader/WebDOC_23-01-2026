import PageShell from "./PageShell";

const PAGE_CLASS =
  "max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0";
const PAGE_STYLE = { fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" };

const autosize = (e) => {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
};

export default function ExtraPages({
  extraPages,
  setExtraPages,
  rqdid,
  storeSetExtraPages,
  headerH,
  footerH,
  extraPageRefs,
  renderedPageCount,
}) {
  const persist = (updated) => {
    setExtraPages(updated);
    if (rqdid) storeSetExtraPages(rqdid, updated);
  };

  return (
    <>
      {extraPages.map((page, idx) => (
        <div key={page.id} data-pdf-page className={PAGE_CLASS} style={PAGE_STYLE}>
          <PageShell
            pageRef={(el) => {
              extraPageRefs.current[page.id] = el;
            }}
            extraClass=""
            headerH={headerH}
            footerH={footerH}
          >
            <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 print:text-transparent">
                  ໜ້າ {renderedPageCount + 1 + idx}
                </span>
                <button
                  onClick={() => persist(extraPages.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600 text-sm print:hidden"
                >
                  ລຶບໜ້ານີ້
                </button>
              </div>
              <div className="text-sm text-gray-800 leading-relaxed">
                <textarea
                  value={page.body}
                  onChange={(e) =>
                    persist(extraPages.map((p, i) => (i === idx ? { ...p, body: e.target.value } : p)))
                  }
                  placeholder="ພິມເນື້ອໃນ..."
                  rows={10}
                  onInput={autosize}
                  onKeyDown={(e) => {
                    if (e.key !== "Tab") return;
                    e.preventDefault();
                    const start = e.target.selectionStart;
                    const end = e.target.selectionEnd;
                    const spaces = "        ";
                    const newValue = page.body.substring(0, start) + spaces + page.body.substring(end);
                    persist(extraPages.map((p, i) => (i === idx ? { ...p, body: newValue } : p)));
                    requestAnimationFrame(() => {
                      e.target.selectionStart = e.target.selectionEnd = start + spaces.length;
                    });
                  }}
                  style={{ textIndent: "1.6rem" }}
                  className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                />
              </div>
            </div>
          </PageShell>
        </div>
      ))}
    </>
  );
}
