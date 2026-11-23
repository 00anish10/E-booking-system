import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { api, getErrorMessage } from "@/lib/api";
import type { CartItem, Order } from "@/lib/types";

const GUEST_CART_KEY = "readverse.cart";

export type NewCartItem = Omit<CartItem, "quantity">;

interface CartContextValue {
	items: CartItem[];
	isSyncing: boolean;
	addToCart: (item: NewCartItem, quantity?: number) => Promise<void>;
	removeFromCart: (id: string) => Promise<void>;
	updateQuantity: (id: string, quantity: number) => Promise<void>;
	clearCart: () => Promise<void>;
	getTotalPrice: () => number;
	getItemCount: () => number;
	checkout: (couponCode?: string) => Promise<Order>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const readGuestCart = (): CartItem[] => {
	try {
		const raw = localStorage.getItem(GUEST_CART_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as CartItem[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

const writeGuestCart = (items: CartItem[]) => {
	localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
	const [items, setItems] = useState<CartItem[]>(readGuestCart);
	const [isSyncing, setIsSyncing] = useState(false);
	const { user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const refresh = useCallback(async () => {
		const { data } = await api.get<{ items: CartItem[] }>("/cart");
		setItems(data.items);
	}, []);

	useEffect(() => {
		let cancelled = false;

		const sync = async () => {
			if (!user) {
				setItems(readGuestCart());
				return;
			}

			setIsSyncing(true);
			try {
				const guestItems = readGuestCart();
				if (guestItems.length) {
					await Promise.all(
						guestItems.map((item) =>
							api.post("/cart", {
								bookId: item.id,
								quantity: item.quantity,
							}),
						),
					);
					localStorage.removeItem(GUEST_CART_KEY);
				}
				if (!cancelled) await refresh();
			} catch (error) {
				if (!cancelled) {
					toast({
						type: "error",
						title: "Could not sync your cart",
						description: getErrorMessage(error),
					});
				}
			} finally {
				if (!cancelled) setIsSyncing(false);
			}
		};

		void sync();
		return () => {
			cancelled = true;
		};
	}, [user, refresh, toast]);

	useEffect(() => {
		if (!user) writeGuestCart(items);
	}, [items, user]);

	const addToCart = useCallback(
		async (item: NewCartItem, quantity = 1) => {
			setItems((current) => {
				const existing = current.find((entry) => entry.id === item.id);
				if (existing) {
					return current.map((entry) =>
						entry.id === item.id
							? {
									...entry,
									quantity: Math.min(20, entry.quantity + quantity),
								}
							: entry,
					);
				}
				return [...current, { ...item, quantity }];
			});

			if (user) {
				try {
					await api.post("/cart", { bookId: item.id, quantity });
				} catch (error) {
					toast({
						type: "error",
						title: "Could not update your cart",
						description: getErrorMessage(error),
					});
					await refresh();
				}
			}
		},
		[user, toast, refresh],
	);

	const removeFromCart = useCallback(
		async (id: string) => {
			setItems((current) => current.filter((item) => item.id !== id));
			if (user) {
				try {
					await api.delete(`/cart/${id}`);
				} catch (error) {
					toast({
						type: "error",
						title: "Could not remove the book",
						description: getErrorMessage(error),
					});
					await refresh();
				}
			}
		},
		[user, toast, refresh],
	);

	const updateQuantity = useCallback(
		async (id: string, quantity: number) => {
			const next = Math.max(1, Math.min(20, quantity));
			setItems((current) => current.map((item) => (item.id === id ? { ...item, quantity: next } : item)));
			if (user) {
				try {
					await api.patch(`/cart/${id}`, { quantity: next });
				} catch (error) {
					toast({
						type: "error",
						title: "Could not update quantity",
						description: getErrorMessage(error),
					});
					await refresh();
				}
			}
		},
		[user, toast, refresh],
	);

	const clearCart = useCallback(async () => {
		setItems([]);
		if (user) {
			try {
				await api.delete("/cart");
			} catch {
				await refresh();
			}
		}
	}, [user, refresh]);

	const checkout = useCallback(
		async (couponCode?: string) => {
			if (!user) {
				throw new Error("Please sign in to complete your purchase");
			}
			const { data } = await api.post<{ order: Order }>("/orders", {
				couponCode: couponCode?.trim() || null,
			});
			setItems([]);
			localStorage.removeItem(GUEST_CART_KEY);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["library"] }),
				queryClient.invalidateQueries({ queryKey: ["orders"] }),
			]);
			return data.order;
		},
		[user, queryClient],
	);

	const getTotalPrice = useCallback(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);

	const getItemCount = useCallback(() => items.reduce((count, item) => count + item.quantity, 0), [items]);

	const value = useMemo(
		() => ({
			items,
			isSyncing,
			addToCart,
			removeFromCart,
			updateQuantity,
			clearCart,
			getTotalPrice,
			getItemCount,
			checkout,
		}),
		[items, isSyncing, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getItemCount, checkout],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
	const context = useContext(CartContext);
	if (!context) throw new Error("useCart must be used within CartProvider");
	return context;
};
