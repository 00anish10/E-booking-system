import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import type { Book } from "@/lib/types";

const GUEST_WISHLIST_KEY = "readverse.wishlist";

const readGuestWishlist = (): string[] => {
	try {
		const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
		const parsed = raw ? (JSON.parse(raw) as string[]) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

export function useWishlist() {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [guestIds, setGuestIds] = useState<string[]>(readGuestWishlist);
	const mergedGuestWishlist = useRef(false);

	const query = useQuery({
		queryKey: ["wishlist"],
		enabled: isAuthenticated,
		queryFn: async () => {
			const { data } = await api.get<{ books: Book[] }>("/wishlist");
			return data.books;
		},
	});

	useEffect(() => {
		if (!isAuthenticated) {
			mergedGuestWishlist.current = false;
			localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestIds));
		}
	}, [guestIds, isAuthenticated]);

	useEffect(() => {
		if (!isAuthenticated || mergedGuestWishlist.current) return;
		mergedGuestWishlist.current = true;
		if (guestIds.length === 0) return;

		const mergeGuestWishlist = async () => {
			await Promise.allSettled(guestIds.map((bookId) => api.post(`/wishlist/${bookId}`)));
			localStorage.removeItem(GUEST_WISHLIST_KEY);
			setGuestIds([]);
			await queryClient.invalidateQueries({ queryKey: ["wishlist"] });
		};

		void mergeGuestWishlist();
	}, [guestIds, isAuthenticated, queryClient]);

	const mutation = useMutation({
		mutationFn: async ({ bookId, add }: { bookId: string; add: boolean }) => {
			if (add) {
				await api.post(`/wishlist/${bookId}`);
			} else {
				await api.delete(`/wishlist/${bookId}`);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["wishlist"] });
		},
	});

	const serverIds = query.data?.map((book) => book.id) ?? [];

	const isWishlisted = useCallback(
		(bookId: string) => (isAuthenticated ? serverIds.includes(bookId) : guestIds.includes(bookId)),
		[isAuthenticated, serverIds, guestIds],
	);

	const toggle = useCallback(
		async (bookId: string) => {
			if (!isAuthenticated) {
				setGuestIds((current) => (current.includes(bookId) ? current.filter((id) => id !== bookId) : [...current, bookId]));
				return;
			}
			await mutation.mutateAsync({
				bookId,
				add: !serverIds.includes(bookId),
			});
		},
		[isAuthenticated, mutation, serverIds],
	);

	return {
		wishlist: query.data ?? [],
		guestWishlistIds: guestIds,
		isWishlisted,
		toggle,
		isPending: mutation.isPending,
		isAuthenticated,
	};
}
