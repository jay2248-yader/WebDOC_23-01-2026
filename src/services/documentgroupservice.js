import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

// Read - Get all document groups
export async function getAllDocumentGroup(params = {}) {
  const res = await http.get(ENDPOINTS.DOCUMENT_GROUP.GET_ALL, { params });

  console.log("Document Group API Response:", res.data);

  if (!res.data?.success) {
    throw new Error("Failed to fetch document groups");
  }

  // API returns data in 'message.data' field
  const messageData = res.data?.message || {};
  const dataArray = Array.isArray(messageData.data) ? messageData.data : [];

  return {
    data: dataArray,
    total: messageData.total || dataArray.length,
    currentPage: messageData.currentPage || 1,
    lastPage: messageData.lastPage || 1,
  };
}

// Create - New document group
export async function createNewDocumentGroup(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENT_GROUP.NEW, payload);

  console.log("Create Document Group Response:", res.data);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create document group");
  }

  return res.data;
}

// Delete - Delete document group
export async function deleteDocumentGroup(dcdid) {
  const res = await http.delete(ENDPOINTS.DOCUMENT_GROUP.DELETE, {
    data: { dcdid: dcdid.toString() },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete document group");
  }

  return res.data;
}

// Update - Update document group
export async function updateDocumentGroup(payload) {
  const res = await http.put(ENDPOINTS.DOCUMENT_GROUP.UPDATE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update document group");
  }

  return res.data;
}
