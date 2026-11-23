import type { Book } from "@/data/books";

export type { Book };

export interface User {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
	memberSince: string;
}

export interface Review {
	id: string;
	rating: number;
	body: string;
	createdAt: string;
	author: string;
}

export interface BookDetail {
	book: Book;
	reviews: Review[];
}

export interface BooksResponse {
	books: Book[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface BookQuery {
	search?: string;
	category?: string;
	sort?: "popular" | "rating" | "price-low" | "price-high" | "newest" | "title";
	minRating?: number;
	maxPrice?: number;
	tag?: "bestseller" | "trending" | "new";
	page?: number;
	limit?: number;
}

export interface CategoryCount {
	category: string;
	count: number;
}

export interface CartItem {
	id: string;
	title: string;
	author: string;
	price: number;
	cover: string;
	quantity: number;
}

export interface LibraryBook extends Book {
	progress: number;
	purchasedAt: string;
	lastReadAt: string | null;
}

export interface LibraryResponse {
	books: LibraryBook[];
	stats: {
		owned: number;
		completed: number;
		inProgress: number;
		averageProgress: number;
	};
}

export interface OrderItem {
	id: string;
	title: string;
	price: number;
	quantity: number;
	cover?: string;
}

export interface Order {
	id: string;
	subtotal: number;
	discount: number;
	tax: number;
	total: number;
	couponCode: string | null;
	status: string;
	createdAt: string;
	items: OrderItem[];
}

export interface Coupon {
	code: string;
	label: string;
	type: "percent" | "fixed";
	value: number;
}

export interface StoreStats {
	books: number;
	authors: number;
	reviews: number;
	categories: number;
}
