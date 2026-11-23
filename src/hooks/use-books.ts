import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BookDetail, BookQuery, BooksResponse, CategoryCount, Coupon, StoreStats } from "@/lib/types";

export function useBooks(params: BookQuery = {}) {
	return useQuery({
		queryKey: ["books", params],
		queryFn: async () => {
			const { data } = await api.get<BooksResponse>("/books", { params });
			return data;
		},
		placeholderData: keepPreviousData,
	});
}

export function useBook(bookId?: string) {
	return useQuery({
		queryKey: ["book", bookId],
		enabled: Boolean(bookId),
		queryFn: async () => {
			const { data } = await api.get<BookDetail>(`/books/${bookId}`);
			return data;
		},
	});
}

export function useCategories() {
	return useQuery({
		queryKey: ["categories"],
		staleTime: 5 * 60_000,
		queryFn: async () => {
			const { data } = await api.get<{ categories: CategoryCount[] }>("/books/categories");
			return data.categories;
		},
	});
}

export function useStoreStats() {
	return useQuery({
		queryKey: ["stats"],
		staleTime: 5 * 60_000,
		queryFn: async () => {
			const { data } = await api.get<{ stats: StoreStats }>("/meta/stats");
			return data.stats;
		},
	});
}

export function useCoupons() {
	return useQuery({
		queryKey: ["coupons"],
		staleTime: 10 * 60_000,
		queryFn: async () => {
			const { data } = await api.get<{ coupons: Coupon[] }>("/meta/coupons");
			return data.coupons;
		},
	});
}
