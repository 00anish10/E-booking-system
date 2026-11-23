import axios, { isAxiosError } from "axios";

const TOKEN_KEY = "readverse.token";
export const AUTH_UNAUTHORIZED_EVENT = "readverse:unauthorized";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api",
	timeout: 15_000,
});

export const tokenStore = {
	get: () => localStorage.getItem(TOKEN_KEY),
	set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
	clear: () => localStorage.removeItem(TOKEN_KEY),
};

api.interceptors.request.use((config) => {
	const token = tokenStore.get();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (isAxiosError(error) && error.response?.status === 401) {
			const isAuthRequest = error.config?.url?.includes("/auth/login");
			if (!isAuthRequest) {
				tokenStore.clear();
				window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
			}
		}
		return Promise.reject(error);
	},
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
	if (isAxiosError(error)) {
		const data = error.response?.data as { message?: string } | undefined;
		if (data?.message) return data.message;
		if (error.code === "ECONNABORTED") {
			return "The request took too long. Please try again.";
		}
		if (!error.response) {
			return "Cannot reach the ReadVerse API. Is the server running?";
		}
	}
	if (error instanceof Error && error.message) return error.message;
	return fallback;
}
