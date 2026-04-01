/**
 * positionservice.js
 *
 * API calls สำหรับ Position — สร้างจาก createCrudService factory
 * idKey: "pid"
 *
 * Endpoints (ดูค่าจริงใน api/endpoints.js → POSITION):
 *   getAllPositions  — GET_ALL
 *   createNewPosition — NEW
 *   updatePosition  — UPDATE
 *   deletePosition  — DELETE
 */
import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.POSITION, "position", "pid"
);

export const getAllPositions = getAll;
export const createNewPosition = create;
export const updatePosition = update;
export const deletePosition = remove;
