import { useEffect, useReducer } from "react";
import { getDocumentRequestDashboardPercentByYear } from "../services/dashboardservice";

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

export function useDashboardCategoryPercent(year) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!year) return;
    const controller = new AbortController();
    dispatch({ type: "fetch" });
    getDocumentRequestDashboardPercentByYear(year, controller.signal)
      .then((rows) => {
        const normalized = rows.map((r) => ({
          label: r.doc_category_name,
          count: Number(r.category_count ?? 0),
          percent: Number(String(r.percent_of_year ?? "0").replace("%", "")),
        }));
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
