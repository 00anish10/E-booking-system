import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import type { LibraryResponse, Order } from "@/lib/types";

export function useLibrary() {
	const { isAuthenticated } = useAuth();
	return useQuery({
		queryKey: ["library"],
		enabled: isAuthenticated,
		queryFn: async () => {
			const { data } = await api.get<LibraryResponse>("/library");
			return data;
		},
	});
}

export function useUpdateProgress() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ bookId, progress }: { bookId: string; progress: number }) => {
			await api.patch(`/library/${bookId}/progress`, { progress });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["library"] });
		},
	});
}

export function useOrders() {
	const { isAuthenticated } = useAuth();
	return useQuery({
		queryKey: ["orders"],
		enabled: isAuthenticated,
		queryFn: async () => {
			const { data } = await api.get<{ orders: Order[] }>("/orders");
			return data.orders;
		},
	});
}
