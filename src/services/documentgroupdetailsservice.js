import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DOCUMENT_GROUP_DETAILS, "document group details", "dcgid"
);

export const getAllDocumentGroupDetails = getAll;
export const createNewDocumentGroupDetails = create;
export const updateDocumentGroupDetails = update;
export const deleteDocumentGroupDetails = remove;
