import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Create
export async function createDocumentDetails(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENT_DETAILS.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.statuscode || "Failed to create document details");
  }

  return res.data;
}

//Get All by Document ID
export async function getDocumentDetailsByDocumentId(documentId) {
  const res = await http.post(ENDPOINTS.DOCUMENT_DETAILS.GET_ALL, { documentId });

  if (!res.data?.success) {
    throw new Error(res.data?.statuscode || "Failed to get document details");
  }

  return res.data;
}
