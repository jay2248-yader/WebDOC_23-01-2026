import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllBoards(params = {}) {
  const res = await http.get(ENDPOINTS.BOARD.GET_ALL, { params });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to fetch boards");
  }

  return res.data.data_id?.data || [];
}


//Delete
export async function deleteBoard(bdid) {
  const res = await http.delete(ENDPOINTS.BOARD.DELETE, {
    data: { bdid: bdid.toString() },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Failed to delete board");
  }

  return res.data;
}
