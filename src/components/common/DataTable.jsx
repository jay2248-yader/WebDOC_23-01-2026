export default function DataTable({ children, footer }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
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
