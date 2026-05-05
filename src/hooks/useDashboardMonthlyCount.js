import { useEffect, useReducer } from "react";
import { getDocumentRequestDashboardFlowchartPercentByYear } from "../services/dashboardservice";

const MONTH_LABELS_LO = [
  "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
  "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ",
];

const initialState = { data: [], loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case "fetch":
      return { data: [], loading: true, error: null };
    case "success":
      return { data: action.payload, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function useDashboardMonthlyCount(year) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!year) return;
    const controller = new AbortController();
    dispatch({ type: "fetch" });
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
        dispatch({ type: "success", payload: normalized });
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError")
          dispatch({ type: "error", payload: err });
      });
    return () => controller.abort();
  }, [year]);

  return state;
}
