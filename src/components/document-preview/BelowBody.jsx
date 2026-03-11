import React from "react";
import TitleTableContent from "./TitleTableContent";
import ClosingContent from "./ClosingContent";

export default function BelowBody({
    titleTableSections,
    remark, setRemark,
    selectedDetailId, storeSetRemark,
    onOpenTitleTable,
    interactive = true,
    partialSections = null,
    showClosing = true,
    remarkOverride,
    showSignature = true,
    showLabel = true,
}) {
    const sectionsToRender = partialSections !== null ? partialSections : titleTableSections;
    const showPlaceholder = titleTableSections.length === 0;

    return (
        <>
            <div
                className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors print:cursor-default print:hover:bg-transparent"
                onClick={interactive ? onOpenTitleTable : undefined}
            >
                <TitleTableContent titleTableSections={sectionsToRender} showPlaceholder={showPlaceholder} />
            </div>
            {showClosing && (
                <ClosingContent
                    remark={remark}
                    setRemark={setRemark}
                    selectedDetailId={selectedDetailId}
                    storeSetRemark={storeSetRemark}
                    interactive={interactive}
                    remarkOverride={remarkOverride}
                    showSignature={showSignature}
                    showLabel={showLabel}
                />
            )}
        </>
    );
}
