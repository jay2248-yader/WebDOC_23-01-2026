import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

// Read - Get all document group details
export async function getAllDocumentGroupDetails(params = {}) {
  const res = await http.get(ENDPOINTS.DOCUMENT_GROUP_DETAILS.GET_ALL, { params });

  console.log("Document Group Details API Response:", res.data);

  if (!res.data?.success) {
    throw new Error("Failed to fetch document group details");
  }

  const messageData = res.data?.message || {};
  const dataArray = Array.isArray(messageData.data) ? messageData.data : [];

  return {
    data: dataArray,
    total: messageData.total || dataArray.length,
    currentPage: messageData.currentPage || 1,
    lastPage: messageData.lastPage || 1,
  };
}

// Create - New document group details
export async function createNewDocumentGroupDetails(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENT_GROUP_DETAILS.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create document group details");
  }

  return res.data;
}

// Delete - Delete document group details
export async function deleteDocumentGroupDetails(dcgid) {
  const res = await http.delete(ENDPOINTS.DOCUMENT_GROUP_DETAILS.DELETE, {
    data: { dcgid: dcgid.toString() },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete document group details");
  }

  return res.data;
}

// Update - Update document group details
export async function updateDocumentGroupDetails(payload) {
  const res = await http.put(ENDPOINTS.DOCUMENT_GROUP_DETAILS.UPDATE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update document group details");
  }

  return res.data;
}
