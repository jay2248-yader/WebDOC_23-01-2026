import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllPositions(params = {}) {
  const res = await http.get(ENDPOINTS.POSITION.GET_ALL, { params });

  console.log("API Response:", res.data);
  console.log("Success:", res.data?.success);
  console.log("data_id:", res.data?.data_id);
  console.log("Final data:", res.data.data_id);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch positions");
  }

  return {
    data: res.data.data_id?.data || [],
    total: res.data.data_id?.total || 0,
    currentPage: res.data.data_id?.currentPage || 1,
    lastPage: res.data.data_id?.lastPage || 1,
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
