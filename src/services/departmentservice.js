/**
 * departmentservice.js
 *
 * API calls สำหรับ Department — สร้างจาก createCrudService factory
 * idKey: "dpid"
 *
 * Endpoints (ดูค่าจริงใน api/endpoints.js → DEPARTMENT):
 *   getAllDepartments  — GET_ALL
 *   createNewDepartment — NEW
 *   updateDepartment  — UPDATE
 *   deleteDepartment  — DELETE
 */
import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.DEPARTMENT, "department", "dpid"
);

export const getAllDepartments = getAll;
export const createNewDepartment = create;
export const updateDepartment = update;
export const deleteDepartment = remove;
