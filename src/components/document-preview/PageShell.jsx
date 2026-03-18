import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import { HEADER_HEIGHT_PX, FOOTER_HEIGHT_PX } from "./constants";

export default function PageShell({ children, pageRef, extraClass = "", isFirstPage = false, headerH = HEADER_HEIGHT_PX, footerH = FOOTER_HEIGHT_PX }) {
    const headerScale = headerH / HEADER_HEIGHT_PX;
    const footerScale = footerH / FOOTER_HEIGHT_PX;

    return (
        <div
            ref={pageRef}
            className={`doc-print-page relative overflow-hidden ${isFirstPage ? "" : "print:break-before-page"} ${extraClass}`}
            style={{ width: "210mm", height: "297mm" }}
        >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: headerH, overflow: "hidden", zIndex: 10 }}>
                <PageHeader scale={headerScale} />
            </div>

            <div
                style={{
                    position: "absolute",
                    top: headerH,
                    left: "18mm",
                    right: "18mm",
                    bottom: footerH,
                    overflow: "hidden",
                }}
            >
                {children}
            </div>

            <PageFooter scale={footerScale} />
        </div>
    );
}
