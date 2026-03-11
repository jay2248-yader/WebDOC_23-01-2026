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
        id: "groupapp",
        label: "Groupapp",
        icon: "👥",
        path: "/groupapp",
      },
      {
        id: "allapp",
        label: "AllApp",
        icon: "📱",
        path: "/allapp",
      },
      {
        id: "position",
        label: "ຕຳແໜ່ງ",
        icon: "💼",
        path: "/position",
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
    id: "doc-management",
    label: "ເອກະສານ",
    icon: "📄",
    path: "/documents",
    children: [
      {
        id: "doc-list",
        label: "ເອກະສານ",
        path: "/documents",
      },
      {
        id: "doc-category",
        label: "ປະເພດເອກະສານ",
        path: "/document-category",
      },
      {
        id: "doc-group",
        label: "ກຸ່ມເອກະສານ",
        path: "/document-group",
      },
      {
        id: "doc-group-details",
        label: "ລາຍລະອຽດກຸ່ມເອກະສານ",
        path: "/document-group-details",
      },
    ],
  },



];
