import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Create — returns rddid of the newly created row
export async function createDocumentDetails(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENT_DETAILS.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create document details");
  }

  // backend ไม่คืน rddid ใน create response → fetch list แล้วหา row ใหม่
  const listRes = await http.post(ENDPOINTS.DOCUMENT_DETAILS.GET_ALL, {
    documentId: payload.rqdid,
  });
  const details = listRes.data?.data_id?.data || [];
  const newRecord = details
    .filter((d) => d.req_title === payload.req_title && !d.req_attachfile)
    .sort((a, b) => Number(b.rddid) - Number(a.rddid))[0];

  return { ...res.data, rddid: newRecord?.rddid ?? null };
}

//Upload image attachment
export async function uploadRequestImageDetails(rddid, file) {
  const formData = new FormData();
  formData.append("productImage", file);
  const res = await http.post(
    `${ENDPOINTS.DOCUMENT_DETAILS.UPLOAD_IMAGE}?rddid=${rddid}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to upload image");
  }

  return res.data;
}

//Get All by Document ID
export async function getDocumentDetailsByDocumentId(documentId) {
  const res = await http.post(ENDPOINTS.DOCUMENT_DETAILS.GET_ALL, { documentId });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to get document details");
  }

  return res.data;
}
