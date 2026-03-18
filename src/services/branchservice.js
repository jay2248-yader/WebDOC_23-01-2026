import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllBranches(params = {}) {
  const res = await http.get(ENDPOINTS.BRANCH.GET_ALL, { params });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch branches");
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


//Create
export async function createBranch(payload) {
  const res = await http.post(ENDPOINTS.BRANCH.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create branch");
  }

  return res.data;
}


//Delete
export async function deleteBranch(brid) {
  const res = await http.delete(ENDPOINTS.BRANCH.DELETE, {
    data: { brid: brid.toString() },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete branch");
  }

  return res.data;
}


//Update
export async function updateBranch(payload) {
  const res = await http.put(ENDPOINTS.BRANCH.UPDATE, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update branch");
  }

  return res.data;
}



