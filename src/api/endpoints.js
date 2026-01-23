// รวม path ของ API ทั้งหมดไว้ที่เดียว ป้องกันพิมพ์ผิด

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/users/loginUser",
  },

  USERS: {
    GET_ALL: "/api/users/getAllUser",
  },

  BRANCH: {
    GET_ALL: "/api/branch/getAllBranch",
    NEW: "/api/branch/newBranch",
    DELETE: "/api/branch/deleteBranch",
    UPDATE: "/api/branch/updateBranch",
  },

  BOARD: {
    GET_ALL: "/api/board/getAllBoard",
    DELETE: "/api/board/deleteBoard",
  },

  DEPARTMENT: {
    GET_ALL: "/api/department/getAllDepartment",
  },

  POSITION: {
    GET_ALL: "/api/position/getAllPosition",
  },

  DOCUMENT_CATEGORY: {
    GET_ALL: "/api/documentcategory/getAllDocumentCategory",
  },
};
