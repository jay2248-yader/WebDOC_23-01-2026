/**
 * branchservice.js
 *
 * API calls สำหรับ Branch — สร้างจาก createCrudService factory
 * idKey: "brid"
 *
 * Endpoints (ดูค่าจริงใน api/endpoints.js → BRANCH):
 *   getAllBranches  — GET_ALL
 *   createBranch   — NEW
 *   updateBranch   — UPDATE
 *   deleteBranch   — DELETE
 */
import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.BRANCH, "branch", "brid"
);

export const getAllBranches = getAll;
export const createBranch = create;
export const updateBranch = update;
export const deleteBranch = remove;
