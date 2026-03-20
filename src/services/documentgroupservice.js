import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DOCUMENT_GROUP, "document group", "dcdid"
);

export const getAllDocumentGroup = getAll;
export const createNewDocumentGroup = create;
export const updateDocumentGroup = update;
export const deleteDocumentGroup = remove;
