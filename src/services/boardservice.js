import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.BOARD, "board", "bdid"
);

export const getAllBoards = getAll;
export const createNewBoard = create;
export const updateBoard = update;
export const deleteBoard = remove;
