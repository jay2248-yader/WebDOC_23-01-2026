
export default function TitleTableContent({ titleTableSections, showPlaceholder = true }) {
    return titleTableSections.length > 0 ? (
        titleTableSections.map((section, si) => (
            <div key={si} className={si > 0 ? "mt-4" : ""}>
                {section.title && (
                    <p data-measure-item={"title-" + si} className="text-sm font-bold mb-2">
                        <span className="mr-2">➤</span>{section.title}
                    </p>
                )}
                <table className="w-full border-collapse border border-black text-sm">
                    <tbody>
                        {(section.cells || []).map((row, ri) => (
                            <tr key={ri} data-measure-item={"row-" + si + "-" + ri}>
                                {row.map((cell, ci) => {
                                    if (!cell) return null;
                                    return (
                                        <td key={ci} colSpan={cell.colspan || 1} rowSpan={cell.rowspan || 1}
                                            className="border border-black px-2 py-1 text-center whitespace-pre-wrap"
                                            style={{ backgroundColor: cell.bg || undefined, color: cell.color || undefined }}>
                                            {cell.value ?? (typeof cell === "string" || typeof cell === "number" ? cell : "")}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {section.summaryRow && (
                            <tr data-measure-item={"summary-" + si} className="font-bold">
                                <td colSpan={section.summaryRow.labelColspan} className="border border-black px-2 py-1 text-center">{section.summaryRow.label}</td>
                                {(section.summaryRow.values || []).map((val, vi) => <td key={vi} className="border border-black px-2 py-1 text-center">{val}</td>)}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        ))
    ) : showPlaceholder ? (
        <div className="text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg py-6 text-sm print:hidden">
            ກົດເພື່ອເພີ່ມ Title + Table
        </div>
    ) : null;
}
