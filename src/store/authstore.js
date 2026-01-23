import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

/**
 * เก็บ auth state กลางของทั้งแอพ
 * - user: โปรไฟล์ที่ได้จาก login (data_id)
 * - token: ใช้แนบ Authorization ทุก request
 * - setAuth/logout: actions
 */
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,

        isAuthed: () => Boolean(get().token),

          setAuth: (data) => {
          if (!data) {
            return set({ user: null, token: null });
          }
          // แยก token ออกจาก user data
          const { token, ...userInfo } = data;
          set({
            user: userInfo,
            token: token || null,
          });
        },

        logout: () => set({ user: null, token: null }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user, token: state.token }),
      }
    ),
    { name: "AuthStore" }
  )
);
