import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

// Approve request document
export async function approveRequestDocument(payload) {
  const res = await http.post(ENDPOINTS.APPROVAL_DOCUMENT.APPROVE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to approve request document");
  }

  return res.data;
}

// Reject request document
export async function rejectRequestDocument(payload) {
  const res = await http.post(ENDPOINTS.APPROVAL_DOCUMENT.REJECT, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to reject request document");
  }

  return res.data;
}

// Edit request document details
export async function editRequestDocumentDetails(payload) {
  const res = await http.post(ENDPOINTS.APPROVAL_DOCUMENT.EDIT_REQUEST_DETAILS, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to edit request document details");
  }

  return res.data;
}

// Get approval document details by rqdid
export async function getApprovalDetailsByRqid(rqdid, params = {}, signal) {
  const res = await http.get(ENDPOINTS.APPROVAL_DOCUMENT.GET_BY_RQID, {
    params: { page: 1, limit: 100, rqdid, ...params },
    signal,
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch approval document details");
  }

  const dataId = res.data.data_id || {};
  const dataArray = Array.isArray(dataId.data) ? dataId.data : [];
  const total = dataId.total ?? dataArray.length;
  const limit = Number(params.limit) || 100;

  return {
    data: dataArray,
    total,
    lastPage: dataId.last_page || Math.ceil(total / limit) || 1,
  };
}
