import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllUsers(params = {}, signal) {
  const res = await http.get(ENDPOINTS.USERS.GET_ALL, { params, signal });
  if (!res.data?.success) {
    throw new Error("Failed to fetch users");
  }

  // Users API returns data in 'message' field
  const messageData = res.data?.message || {};
  const dataArray = Array.isArray(messageData.data) ? messageData.data : [];
  const total = messageData.total || dataArray.length;
  const limit = Number(params.limit) || 10;
  const computedLastPage = Math.ceil(total / limit) || 1;

  return {
    data: dataArray,
    total,
    currentPage: messageData.currentPage || 1,
    lastPage: messageData.lastPage || messageData.totalPages || messageData.last_page || computedLastPage,
  };
}


//Update Password
export async function updatePwds({ usercode, pwds }) {
  const res = await http.post(ENDPOINTS.USERS.UPDATEPASS, { usercode, pwds });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to update password");
  }

  return res.data;
}

//Create
export async function createNewUser(payload) {
  const res = await http.post(ENDPOINTS.USERS.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create user");
  }

  return res.data;
}
