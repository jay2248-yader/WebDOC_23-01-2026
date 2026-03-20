import createCrudService from "./createCrudService";
import { ENDPOINTS } from "../api/endpoints";

const transformPayload = (payload) => ({
  ...(payload.gid && { gid: payload.gid }),
  groupName: payload.groupname,
  groupInfo: payload.groupinfo,
});

const { getAll, create, update, remove } = createCrudService(
  ENDPOINTS.GROUPAPP, "groupapp", "gid",
  {
    parseGetAll: (res) => res.data.message?.data || [],
    transformCreate: transformPayload,
    transformUpdate: transformPayload,
  }
);

export const getAllGroupapps = getAll;
export const createNewGroupapp = create;
export const updateGroupapp = update;
export const deleteGroupapp = remove;
