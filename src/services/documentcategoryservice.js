import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllDocumentCategories(params = {}) {
  const res = await http.get(ENDPOINTS.DOCUMENT_CATEGORY.GET_ALL, { params });

  if (!res.data?.success) {
    throw new Error("Failed to fetch document categories");
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
export async function createNewDocumentCategory(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENT_CATEGORY.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create document category");
  }

  return res.data;
}


//Delete
export async function deleteDocumentCategory(dctid) {
  const res = await http.delete(ENDPOINTS.DOCUMENT_CATEGORY.DELETE, {
    data: { dctid: dctid },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete document category");
  }

  return res.data;
}


//Update
export async function updateDocumentCategory(payload) {
  const res = await http.put(ENDPOINTS.DOCUMENT_CATEGORY.UPDATE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update document category");
  }

  return res.data;
}
