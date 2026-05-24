import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser } from "@/modules/auth/services/auth.helpers";

type AuthState = {
	token: string | null;
	user: AuthUser | null;
	role: string | null;
	isAuthenticated: boolean;
	setAuth: (auth: { token: string; user: AuthUser | null; role: string | null }) => void;
	logout: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			role: null,
			isAuthenticated: false,
			setAuth: ({ token, user, role }) =>
				set({
					token,
					user,
					role,
					isAuthenticated: Boolean(token),
				}),
			logout: () =>
				set({
					token: null,
					user: null,
					role: null,
					isAuthenticated: false,
				}),
		}),
		{
			name: "auth-store",
			storage: createJSONStorage(() => localStorage),
		},
	),
);

