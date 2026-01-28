import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllDocumentCategories(params = {}) {
  const res = await http.get(ENDPOINTS.DOCUMENT_CATEGORY.GET_ALL, { params });

  console.log("API Response:", res.data);
  console.log("Success:", res.data?.success);
  console.log("message:", res.data?.message);

  if (!res.data?.success) {
    throw new Error("Failed to fetch document categories");
  }

  // Document category API returns data in 'message' field
  const messageData = res.data?.message || {};
  const dataArray = Array.isArray(messageData.data) ? messageData.data : [];

  return {
    data: dataArray,
    total: messageData.total || dataArray.length,
    currentPage: messageData.currentPage || 1,
    lastPage: messageData.lastPage || 1,
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
