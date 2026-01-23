/**
 * Navigation menu items for sidebar
 */
import HomeIcon from "../assets/icon/house-solid.svg";
import UsersIcon from "../assets/icon/Users.svg";


export const MENU_ITEMS = [
  {
    id: "home",
    label: "ໜ້າຫຼັກ",
    icon: HomeIcon,
    path: "/dashboard",
  },
  {
    id: "basic-info",
    label: "ຈັດການຂໍ້ມູນພື້ນຖານ",
    icon: "🗂️",
    path: "/basic-info", // Parent path (optional depending on sidebar implementation)
    children: [
      {
        id: "branch",
        label: "ສາຂາ",
        icon: "🏢",
        path: "/branch",
      },
      {
        id: "board",
        label: "ຄະນະກໍາມະການ",
        icon: "👥",
        path: "/board",
      },
      {
        id: "department",
        label: "ພະແນກ",
        icon: "🏛️",
        path: "/department",
      },
      {
        id: "position",
        label: "ຕຳແໜ່ງ",
        icon: "💼",
        path: "/position",
      },
      {
        id: "document-category",
        label: "ປະເພດເອກະສານ",
        icon: "📂",
        path: "/document-category",
      },
    ],
  },
  {
    id: "users",
    label: "ຈັດການຜູ້ໃຊ້",
       icon: UsersIcon,
    path: "/users",
  },
  {
    id: "documents",
    label: "ຮ້ອງຂໍເອກະສານ",
    icon: "📄",
    path: "/documents",
    children: [
      {
        id: "request-doc",
        label: "ສາທາດປ້ອງເອກູ",
        path: "/documents/request",
      },
      {
        id: "approve-doc",
        label: "ອົນຸມັດເອກະເອກສານ",
        path: "/documents/approve",
      },
    ],
  },
  {
    id: "reports",
    label: "ລາຍງານ",
    icon: "📊",
    path: "/reports",
    children: [
      {
        id: "report-list",
        label: "ແຜນການ",
        path: "/reports/plans",
      },
      {
        id: "summary",
        label: "ຊຳນານ",
        path: "/reports/summary",
      },
    ],
  },
  {
    id: "admin",
    label: "ຊຳນານ",
    icon: "⚙️",
    path: "/admin",
    children: [
      {
        id: "manage-users",
        label: "ການບໍລິຫານຜູ້ອະນຸຍາດ",
        path: "/admin/permissions",
      },
      {
        id: "manage-docs",
        label: "ການບໍລິຫານເອກສານ",
        path: "/admin/documents",
      },
      {
        id: "settings",
        label: "ການຕັ້ງຄ່າ",
        path: "/admin/settings",
      },
    ],
  },
];
