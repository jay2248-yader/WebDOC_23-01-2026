export default function DataTable({ children, footer, elevated = true }) {
  const elevatedStyle = elevated
    ? {
        boxShadow:
          "0 0 0 1px rgba(15, 117, 188, 0.2), 0 8px 20px rgba(0, 10, 31, 0.08)",
      }
    : undefined;

  return (
    <div
      className={`rounded-xl border border-blue-100 bg-white ${elevated ? "" : "shadow-sm"}`}
      style={elevatedStyle}
    >
      <div className="overflow-hidden">{children}</div>
      {footer ? (
        <div className="overflow-visible">
          <hr className="mx-6 border-blue-400" />
          <div>{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
