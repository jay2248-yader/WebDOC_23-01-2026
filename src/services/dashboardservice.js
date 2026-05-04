import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

export async function getDocumentRequestDashboardPercentByYear(pYear, signal) {
  const res = await http.get(ENDPOINTS.DASHBOARD.PERCENT_BY_YEAR, {
    params: { p_year: pYear },
    signal,
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch dashboard percent by year");
  }

  return Array.isArray(res.data.data_id) ? res.data.data_id : [];
}

export async function getDocumentRequestDashboardFlowchartPercentByYear(pYear, signal) {
  const res = await http.get(ENDPOINTS.DASHBOARD.FLOWCHART_PERCENT_BY_YEAR, {
    params: { p_year: pYear },
    signal,
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch dashboard flowchart percent by year");
  }

  return Array.isArray(res.data.data_id) ? res.data.data_id : [];
}
