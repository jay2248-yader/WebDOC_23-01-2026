import React from "react";
import PageHeader from "./PageHeader";
import PageFooter from "./PageFooter";
import { HEADER_HEIGHT_PX, FOOTER_HEIGHT_PX } from "./constants";

export default function PageShell({ children, pageRef, extraClass = "", isFirstPage = false }) {
    return (
        <div
            ref={pageRef}
            className={`doc-print-page relative overflow-hidden ${isFirstPage ? "" : "print:break-before-page"} ${extraClass}`}
            style={{
                height: "297mm",
            }}
        >
            {/* ── HEADER: ล็อกบนสุด ── */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
                <PageHeader />
            </div>

            {/* ── CONTENT: อยู่ระหว่าง header และ footer ── */}
            <div
                style={{
                    position: "absolute",
                    top: HEADER_HEIGHT_PX,
                    left: "18mm",
                    right: "18mm",
                    bottom: FOOTER_HEIGHT_PX,
                    overflow: "hidden",
                }}
            >
                {children}
            </div>

            {/* ── FOOTER: ล็อกล่างสุด ── */}
            <PageFooter />
        </div>
    );
}
