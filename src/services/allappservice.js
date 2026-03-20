import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

export async function getAllAllApps(params = {}) {
  const res = await http.get(ENDPOINTS.ALLAPP.GET_ALL, { params });
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch AllApp");
  }
  return res.data.data_id?.data || [];
}

export async function createNewAllApp(payload) {
  const res = await http.post(ENDPOINTS.ALLAPP.NEW, payload);
  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create AllApp");
  }
  return res.data;
}
