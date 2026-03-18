import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllDepartments(params = {}) {
    const res = await http.get(ENDPOINTS.DEPARTMENT.GET_ALL, { params });

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch departments");
    }

    const dataId = res.data.data_id || {};
    const dataArray = dataId.data || [];
    const total = dataId.total ?? dataArray.length;
    const limit = Number(params.limit) || 10;

    return {
        data: dataArray,
        total,
        lastPage: dataId.lastPage || dataId.last_page || dataId.totalPages || Math.ceil(total / limit) || 1,
    };
}


//Delete
export async function deleteDepartment(dpid) {
    const res = await http.delete(ENDPOINTS.DEPARTMENT.DELETE, {
        data: { dpid: dpid },
    });

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to delete department");
    }

    return res.data;
}


//Create
export async function createNewDepartment(payload) {
    const res = await http.post(ENDPOINTS.DEPARTMENT.NEW, payload);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to create department");
    }

    return res.data;
}


//Update
export async function updateDepartment(payload) {
    const res = await http.put(ENDPOINTS.DEPARTMENT.UPDATE, payload);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to update department");
    }

    return res.data;
}
