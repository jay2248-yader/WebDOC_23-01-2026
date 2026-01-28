import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllUsers(params = {}) {
  const res = await http.get(ENDPOINTS.USERS.GET_ALL, { params });

  console.log("API Response:", res.data);
  console.log("Success:", res.data?.success);
  console.log("message:", res.data?.message);

  if (!res.data?.success) {
    throw new Error("Failed to fetch users");
  }

  // Users API returns data in 'message' field
  const messageData = res.data?.message || {};
  const dataArray = Array.isArray(messageData.data) ? messageData.data : [];

  return {
    data: dataArray,
    total: messageData.total || dataArray.length,
    currentPage: messageData.currentPage || 1,
    lastPage: messageData.lastPage || 1,
  };
}


//Create
export async function createNewUser(payload) {
  const res = await http.post(ENDPOINTS.USERS.NEW, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to create user");
  }

  return res.data;
}
