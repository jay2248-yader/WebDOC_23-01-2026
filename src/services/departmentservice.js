import { http } from "../api/http";
import { ENDPOINTS } from "../api/endpoints";

//Read
export async function getAllDepartments(params = {}) {
    const res = await http.get(ENDPOINTS.DEPARTMENT.GET_ALL, { params });

    console.log("API Response:", res.data);
    console.log("Success:", res.data?.success);
    console.log("data_id:", res.data?.data_id);
    console.log("Final data:", res.data.data_id?.data);

    if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to fetch departments");
    }

    return res.data.data_id?.data || [];
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
