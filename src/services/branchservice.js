import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.BRANCH, "branch", "brid"
);

export const getAllBranches = getAll;
export const createBranch = create;
export const updateBranch = update;
export const deleteBranch = remove;
