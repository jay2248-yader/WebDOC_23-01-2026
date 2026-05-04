import { useEffect, useState } from "react";
import { getDocumentRequestDashboardFlowchartPercentByYear } from "../services/dashboardservice";

const MONTH_LABELS_LO = [
  "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
  "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ",
];

export function useDashboardMonthlyCount(year) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!year) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getDocumentRequestDashboardFlowchartPercentByYear(year, controller.signal)
      .then((rows) => {
        const normalized = rows
          .map((r) => ({
            month_num: Number(r.month_num),
            label: MONTH_LABELS_LO[Number(r.month_num) - 1] || String(r.month_name).trim(),
            value: Number(r.total_count ?? 0),
            percent: Number(String(r.percent_of_total_year ?? "0").replace("%", "")),
          }))
          .sort((a, b) => a.month_num - b.month_num);
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
