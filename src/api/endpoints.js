// รวม path ของ API ทั้งหมดไว้ที่เดียว ป้องกันพิมพ์ผิด

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/users/loginUser",
  },

  USERS: {
    GET_ALL: "/api/users/getAllUser",
    NEW: "/api/users/newUsers",
    UPDATEPASS:"/api/users/updatePwds",
    UPDATEGROUPAPPUSERS:"/api/users/updategroupappusers"
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
    NEW: "/api/board/newBoard",
    UPDATE: "/api/board/updateBoard"
  },

  DEPARTMENT: {
    GET_ALL: "/api/department/getAllDepartment",
    DELETE: "/api/department/deleteDepartment",
    NEW: "/api/department/newDepartment",
    UPDATE: "/api/department/updateDepartment",
  },

  POSITION: {
    GET_ALL: "/api/position/getAllPosition",
    NEW: "/api/position/newPosition",
    DELETE: "/api/position/deletePosition",
    UPDATE: "/api/position/updatePosition",
  },

  DOCUMENT_CATEGORY: {
    GET_ALL: "/api/doccategory/getalldocumentcategory",
    NEW: "/api/doccategory/newdocumentcategory",
    DELETE: "/api/doccategory/deletedocumentcategory",
    UPDATE: "/api/doccategory/updatedocumentcategory"
  },
};