import { useEffect, useState } from "react";
import { getDocumentRequestDashboardPercentByYear } from "../services/dashboardservice";

export function useDashboardCategoryPercent(year) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getDocumentRequestDashboardPercentByYear(year, controller.signal)
      .then((rows) => {
        const normalized = rows.map((r) => ({
          label: r.doc_category_name,
          count: Number(r.category_count ?? 0),
          percent: Number(String(r.percent_of_year ?? "0").replace("%", "")),
        }));
        setData(normalized);
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [year]);

  return { data, loading, error };
}
