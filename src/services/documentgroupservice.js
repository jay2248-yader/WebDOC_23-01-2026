import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

// Read - Get all document groups
export async function getAllDocumentGroup(params = {}) {
  const res = await http.get(ENDPOINTS.DOCUMENT_GROUP.GET_ALL, { params });

  if (!res.data?.success) {
    throw new Error("Failed to fetch document groups");
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

// Create - New document group
export async function createNewDocumentGroup(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENT_GROUP.NEW, payload);

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
