import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.POSITION, "position", "pid"
);

export const getAllPositions = getAll;
export const createNewPosition = create;
export const updatePosition = update;
export const deletePosition = remove;
