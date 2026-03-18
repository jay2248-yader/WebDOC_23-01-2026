import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllPositions(params = {}) {
  const res = await http.get(ENDPOINTS.POSITION.GET_ALL, { params });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch positions");
  }

  const dataId = res.data.data_id || {};
  const dataArray = dataId.data || [];
  const total = dataId.total ?? dataArray.length;
  const limit = Number(params.limit) || 10;

  return {
    data: dataArray,
    total,
    lastPage: dataId.lastPage || dataId.last_page || dataId.totalPages || Math.ceil(total / limit) || 1,
  };
}


//Delete
export async function deletePosition(pid) {
  const res = await http.delete(ENDPOINTS.POSITION.DELETE, {
    data: { pid: pid },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete position");
  }

  return res.data;
}


//Create
export async function createNewPosition(payload) {
  const res = await http.post(ENDPOINTS.POSITION.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create position");
  }

  return res.data;
}


//Update
export async function updatePosition(payload) {
  const res = await http.put(ENDPOINTS.POSITION.UPDATE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update position");
  }

  return res.data;
}
