import ClosingContent from "./ClosingContent";
import PageShell from "./PageShell";

const PAGE_CLASS =
  "max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0";
const PAGE_STYLE = { fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" };

export default function RemarkOverflowPages({ remarkChunks, headerH, footerH, closingProps }) {
  if (!remarkChunks || remarkChunks.length <= 1) return null;

  return remarkChunks.slice(1).map((rmChunk, idx) => {
    const isLastRemarkChunk = idx === remarkChunks.length - 2;
    return (
      <div key={"remark-" + idx} data-pdf-page className={PAGE_CLASS} style={PAGE_STYLE}>
        <PageShell extraClass="" headerH={headerH} footerH={footerH}>
          <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
            <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
              <ClosingContent
                {...closingProps}
                interactive={false}
                remarkOverride={rmChunk}
                showLabel={false}
                showSignature={isLastRemarkChunk}
              />
            </div>
          </div>
        </PageShell>
      </div>
    );
  });
}
