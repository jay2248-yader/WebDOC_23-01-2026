/**
 * Navigation menu items for sidebar
 */
import HomeIcon from "../assets/icon/house-solid.svg";
import UsersIcon from "../assets/icon/Users.svg";
import FileIcon from "../assets/icon/file-solid-full.svg";
import FolderIcon from "../assets/icon/folder-solid-full.svg";


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
    icon: FolderIcon,
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
        label: "ຝ່າຍ",
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
    icon: FileIcon,
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
    ],
  },



];
