import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

/**
 * ยิง login API
 * payload ตัวอย่าง: { usercode: "111198", pwds: "1234" }
 *
 * response ตามรูป:
 * {
 *   success: true,
 *   statuscode: 200,
 *   message: "...",
 *   data_id: { ..., token: "...." }
 * }
 */
export async function loginUser(payload) {
  const res = await http.post(ENDPOINTS.AUTH.LOGIN, payload);

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Login failed");
  }

  return res.data.data_id; // คืน object ที่มี token + profile
}
