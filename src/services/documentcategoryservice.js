import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DOCUMENT_CATEGORY, "document category", "dctid"
);

export const getAllDocumentCategories = getAll;
export const createNewDocumentCategory = create;
export const updateDocumentCategory = update;
export const deleteDocumentCategory = remove;
