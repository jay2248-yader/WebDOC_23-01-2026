import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";
import { useAuthStore } from "../store/authstore";
import { ENV } from "../config/env";

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

//Upload file — filename = {rddid}_{rqdid}.{ext} so image can be fetched by IDs later
export async function uploadDocumentFile(file, rddid, rqdid) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const renamedFile = new File([file], `${rddid}_${rqdid}.${ext}`, { type: file.type });

  const formData = new FormData();
  formData.append("productImage", renamedFile);

  // ใช้ fetch โดยตรง — browser auto-set Content-Type: multipart/form-data; boundary=... ให้เอง
  const token = useAuthStore.getState().token;
  const response = await fetch(`${ENV.API_BASE_URL}${ENDPOINTS.DOCUMENTS.UPLOAD}?rqdid=${rqdid}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed (${response.status}): ${text.substring(0, 200)}`);
  }

  const json = await response.json();
  if (!json?.success) {
    throw new Error(json?.message || "Failed to upload file");
  }

  console.log("[uploadDocumentFile] path:", json?.message?.path);
  return json;
}

//Get datatable header list
export async function getDatatableHeaders(rqdid) {
  const res = await http.get(ENDPOINTS.DOCUMENTS.GET_DATATABLE_HEADER, { params: { rqdid } });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to get datatable headers");
  }

  return res.data?.data_id ?? [];
}

//Add datatable header
export async function addDatatableHeader(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENTS.ADD_DATATABLE_HEADER, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to add datatable header");
  }

  return res.data;
}

//Update datatable header
export async function updateDatatableHeader(payload) {
  const res = await http.put(ENDPOINTS.DOCUMENTS.UPDATE_DATATABLE_HEADER, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update datatable header");
  }

  return res.data;
}

//Get datatable list by rqdid
export async function getDatatables(rqdid) {
  const res = await http.get(ENDPOINTS.DOCUMENTS.GET_DATATABLE, { params: { rqdid } });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to get datatables");
  }

  console.log("[getDatatables] raw data_id:", res.data?.data_id);
  return res.data?.data_id ?? [];
}

//Add datatable (table with headers and rows)
export async function addDatatable(payload) {
  const res = await http.post(ENDPOINTS.DOCUMENTS.ADD_DATATABLE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to add datatable");
  }

  return res.data;
}

//Update datatable (table with headers and rows) by id
export async function updateDatatable(payload) {
  const res = await http.put(ENDPOINTS.DOCUMENTS.UPDATE_DATATABLE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update datatable");
  }

  return res.data;
}

//Success Finished
export async function successFinishedDocument(rqdid) {
  const res = await http.put(ENDPOINTS.DOCUMENTS.SUCCESS_FINISHED, { rqdid });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to finish document");
  }

  return res.data;
}
