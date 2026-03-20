import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DEPARTMENT, "department", "dpid"
);

export const getAllDepartments = getAll;
export const createNewDepartment = create;
export const updateDepartment = update;
export const deleteDepartment = remove;
