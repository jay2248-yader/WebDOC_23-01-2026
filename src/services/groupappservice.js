import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllGroupapps(params = {}) {
    const res = await http.get(ENDPOINTS.GROUPAPP.GET_ALL, { params });

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch groupapps");
    }

    // Adjusted to match the screenshot structure: res.data.message.data
    return res.data.message?.data || [];
}


//Delete
export async function deleteGroupapp(gid) {
    const res = await http.delete(ENDPOINTS.GROUPAPP.DELETE, {
        data: { gid: gid.toString() },
    });

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to delete groupapp");
    }

    return res.data;
}


//Create
export async function createNewGroupapp(payload) {
    // Map to API expected format (camelCase) based on screenshot
    const apiPayload = {
        groupName: payload.groupname,
        groupInfo: payload.groupinfo
    };

    const res = await http.post(ENDPOINTS.GROUPAPP.NEW, apiPayload);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to create groupapp");
    }

    return res.data;
}


//Update
export async function updateGroupapp(payload) {
    // Map to API expected format (camelCase) based on screenshot
    const apiPayload = {
        gid: payload.gid,
        groupName: payload.groupname,
        groupInfo: payload.groupinfo
    };

    const res = await http.put(ENDPOINTS.GROUPAPP.UPDATE, apiPayload);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to update groupapp");
    }

    return res.data;
}
