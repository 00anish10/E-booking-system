import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { queryClient } from "@/lib/query-client";
import { api, AUTH_UNAUTHORIZED_EVENT, tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthResponse {
	token: string;
	user: User;
}

interface AuthContextValue {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<User>;
	register: (name: string, email: string, password: string) => Promise<User>;
	logout: () => void;
	setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUserState] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(() => Boolean(tokenStore.get()));

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			if (!tokenStore.get()) {
				setIsLoading(false);
				return;
			}
			try {
				const { data } = await api.get<{ user: User }>("/auth/me");
				if (!cancelled) setUserState(data.user);
			} catch {
				tokenStore.clear();
				if (!cancelled) setUserState(null);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};

		void load();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const handler = () => setUserState(null);
		window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
		return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const { data } = await api.post<AuthResponse>("/auth/login", {
			email,
			password,
		});
		tokenStore.set(data.token);
		setUserState(data.user);
		return data.user;
	}, []);

	const register = useCallback(async (name: string, email: string, password: string) => {
		const { data } = await api.post<AuthResponse>("/auth/register", {
			name,
			email,
			password,
		});
		tokenStore.set(data.token);
		setUserState(data.user);
		return data.user;
	}, []);

	const logout = useCallback(() => {
		tokenStore.clear();
		setUserState(null);
		queryClient.clear();
	}, []);

	const setUser = useCallback((next: User) => setUserState(next), []);

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: Boolean(user),
			isLoading,
			login,
			register,
			logout,
			setUser,
		}),
		[user, isLoading, login, register, logout, setUser],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};
