import { http } from "../api/http";
import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DOCUMENT_GROUP, "document group", "dcdid"
);

export const getAllDocumentGroup = getAll;
export const createNewDocumentGroup = create;
export const updateDocumentGroup = update;
export const deleteDocumentGroup = remove;

export async function getDocumentGroupByCategory(dctid, signal) {
  const res = await http.get(ENDPOINTS.DOCUMENT_GROUP.GET_BY_CATEGORY, {
    params: { dctid },
    signal,
  });
  if (!res.data?.success) throw new Error(res.data?.message || "Failed to fetch document groups by category");
  const raw = res.data.message;
  return Array.isArray(raw) ? raw : [];
}
