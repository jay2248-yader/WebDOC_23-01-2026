import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllDocuments(params = {}) {
  const res = await http.get(ENDPOINTS.DOCUMENTS.GET_ALL, { params });

  console.log("API Response:", res.data);
  console.log("Success:", res.data?.success);
  console.log("data_id:", res.data?.data_id);

  if (!res.data?.success) {
    throw new Error("Failed to fetch documents");
  }

  // Documents API returns data in 'data_id' field
  const dataId = res.data?.data_id || {};
  const dataArray = Array.isArray(dataId.data) ? dataId.data : [];

  return {
    data: dataArray,
    total: dataId.total || dataArray.length,
    currentPage: dataId.currentPage || 1,
    lastPage: dataId.lastPage || 1,
  };
}


//Create
export async function createNewDocument(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENTS.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create document");
  }

  return res.data;
}
