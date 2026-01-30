import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllAllApps(params = {}) {
    const res = await http.get(ENDPOINTS.ALLAPP.GET_ALL, { params });

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch AllApps");
    }

    // Based on screenshot: res.data.data_id.data
    return res.data.data_id?.data || [];
}


//Delete
export async function deleteAllApp(ids) {
    const res = await http.delete(ENDPOINTS.ALLAPP.DELETE, {
        data: { ids: ids.toString() },
    });

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to delete AllApp");
    }

    return res.data;
}


//Create
export async function createNewAllApp(payload) {
    // Map to API expected format (camelCase assumption)
    const apiPayload = {
        appName: payload.appname,
        appLink: payload.applink,
        moreInfo: payload.moreinfo
    };

    const res = await http.post(ENDPOINTS.ALLAPP.NEW, apiPayload);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to create AllApp");
    }

    return res.data;
}


//Update
export async function updateAllApp(payload) {
    // Map to API expected format
    const apiPayload = {
        ids: payload.ids,
        appName: payload.appname,
        appLink: payload.applink,
        moreInfo: payload.moreinfo
    };

    const res = await http.put(ENDPOINTS.ALLAPP.UPDATE, apiPayload);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to update AllApp");
    }

    return res.data;
}
