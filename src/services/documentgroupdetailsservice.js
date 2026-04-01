import { http } from "../api/http";
import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DOCUMENT_GROUP_DETAILS, "document group details", "dcgid"
);

export const getAllDocumentGroupDetails = getAll;
export const createNewDocumentGroupDetails = create;
export const updateDocumentGroupDetails = update;
export const deleteDocumentGroupDetails = remove;

export async function getDocumentGroupDetailsByDocgroupId(dcdid, params = {}, signal) {
  const res = await http.get(ENDPOINTS.DOCUMENT_GROUP_DETAILS.GET_BY_DOCGROUP, {
    params: { page: 1, limit: 100, dcdid, ...params },
    signal,
  });
  if (!res.data?.success) throw new Error(res.data?.message || "Failed to fetch document group details");
  const msg = res.data.message || {};
  return {
    data: Array.isArray(msg.data) ? msg.data : [],
    total: msg.total ?? 0,
  };
}
