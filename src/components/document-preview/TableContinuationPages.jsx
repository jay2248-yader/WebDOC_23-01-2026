import BelowBody from "./BelowBody";
import PageShell from "./PageShell";

const PAGE_CLASS =
  "max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0";
const PAGE_STYLE = { fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" };

export default function TableContinuationPages({
  tablePageChunks,
  headerH,
  footerH,
  belowBodyProps,
  remarkSplitProps,
}) {
  if (tablePageChunks.length <= 1) return null;

  return tablePageChunks.slice(1).map((sections, idx) => {
    const isLastTablePage = idx === tablePageChunks.length - 2;
    return (
      <div key={"table-" + idx} data-pdf-page className={PAGE_CLASS} style={PAGE_STYLE}>
        <PageShell extraClass="" headerH={headerH} footerH={footerH}>
          <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
            <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
              <BelowBody
                {...belowBodyProps}
                partialSections={sections}
                showClosing={isLastTablePage}
                {...(isLastTablePage ? remarkSplitProps : {})}
              />
            </div>
          </div>
        </PageShell>
      </div>
    );
  });
}
