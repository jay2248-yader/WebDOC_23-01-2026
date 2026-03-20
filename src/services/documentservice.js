import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllDocuments(params = {}, signal) {
  const res = await http.get(ENDPOINTS.DOCUMENTS.GET_ALL, { params, signal });

  if (!res.data?.success) {
    throw new Error("Failed to fetch documents");
  }

  const dataId = res.data.data_id || res.data.message || {};
  const dataArray = Array.isArray(dataId.data) ? dataId.data : [];
  const total = dataId.total ?? dataArray.length;
  const limit = Number(params.limit) || 10;

  return {
    data: dataArray,
    total,
    lastPage: dataId.lastPage || dataId.last_page || dataId.totalPages || Math.ceil(total / limit) || 1,
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
