import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, CreditCard, Minus, Plus, ShoppingBag, Sparkles, Tag, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { useCoupons } from "@/hooks/use-books";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Coupon, Order } from "@/lib/types";

const CartPage = () => {
	useDocumentTitle("Shopping cart");
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, checkout, isSyncing } = useCart();
	const { toast } = useToast();
	const { data: coupons } = useCoupons();

	const [couponInput, setCouponInput] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

	const subtotal = getTotalPrice();
	const discount = useMemo(() => {
		if (!appliedCoupon) return 0;
		return appliedCoupon.type === "percent"
			? Math.round(((subtotal * appliedCoupon.value) / 100) * 100) / 100
			: Math.min(appliedCoupon.value, subtotal);
	}, [appliedCoupon, subtotal]);
	const total = Math.max(0, subtotal - discount);

	const applyCoupon = (code = couponInput) => {
		const normalized = code.trim().toUpperCase();
		if (!normalized) {
			toast({ type: "error", title: "Enter a coupon code" });
			return;
		}
		const match = coupons?.find((coupon) => coupon.code === normalized);
		if (!match) {
			toast({
				type: "error",
				title: "Invalid coupon",
				description: "Try READ10, READVERSE20, or SAVE5.",
			});
			return;
		}
		setAppliedCoupon(match);
		setCouponInput(match.code);
		toast({ type: "success", title: "Coupon applied", description: match.label });
	};

	const handleCheckout = async () => {
		if (!isAuthenticated) {
			toast({
				type: "info",
				title: "Sign in to checkout",
				description: "Your cart will be waiting for you.",
			});
			navigate("/login?returnTo=/cart");
			return;
		}

		setIsCheckingOut(true);
		try {
			const order = await checkout(appliedCoupon?.code);
			setCompletedOrder(order);
			setAppliedCoupon(null);
			setCouponInput("");
		} catch (error) {
			toast({
				type: "error",
				title: "Checkout failed",
				description: getErrorMessage(error),
			});
		} finally {
			setIsCheckingOut(false);
		}
	};

	if (items.length === 0 && !completedOrder) {
		return (
			<div className="min-h-[70vh] px-4 py-16">
				<div className="mx-auto max-w-2xl">
					<EmptyState
						icon={ShoppingBag}
						title="Your cart is empty"
						description="Browse the catalog and add a few books to start your next reading adventure."
						action={
							<Link
								to="/catalog"
								className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02] hover:opacity-90"
							>
								Browse books <Sparkles className="h-4 w-4" />
							</Link>
						}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-16 pt-10">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" /> Continue shopping
				</button>

				<div className="mb-8 flex flex-wrap items-end justify-between gap-3">
					<div>
						<h1 className="text-4xl font-bold text-foreground">Shopping cart</h1>
						<p className="mt-1 text-muted-foreground">
							{items.length} title{items.length === 1 ? "" : "s"} ready to join your library
						</p>
					</div>
					{isSyncing && (
						<span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
							<Spinner className="h-4 w-4" /> Syncing…
						</span>
					)}
				</div>

				<div className="grid gap-8 lg:grid-cols-[1fr_380px]">
					<div className="space-y-4">
						<AnimatePresence initial={false}>
							{items.map((item) => (
								<motion.div
									key={item.id}
									layout
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, x: -40, height: 0 }}
									className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-elegant sm:gap-6 sm:p-5"
								>
									<Link to={`/book/${item.id}`} className="shrink-0">
										<img src={item.cover} alt={item.title} className="h-32 w-24 rounded-xl object-cover sm:h-36 sm:w-28" />
									</Link>

									<div className="flex min-w-0 flex-1 flex-col">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<Link
													to={`/book/${item.id}`}
													className="line-clamp-2 text-lg font-bold text-foreground transition hover:text-primary"
												>
													{item.title}
												</Link>
												<p className="mt-0.5 text-sm text-muted-foreground">{item.author}</p>
											</div>
											<button
												type="button"
												onClick={() => removeFromCart(item.id)}
												className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
												aria-label={`Remove ${item.title}`}
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>

										<div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
											<div className="inline-flex items-center rounded-xl border border-border bg-background">
												<button
													type="button"
													onClick={() => updateQuantity(item.id, item.quantity - 1)}
													disabled={item.quantity <= 1}
													className="p-2.5 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
													aria-label="Decrease quantity"
												>
													<Minus className="h-4 w-4" />
												</button>
												<span className="w-9 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
												<button
													type="button"
													onClick={() => updateQuantity(item.id, item.quantity + 1)}
													className="p-2.5 text-muted-foreground transition hover:text-foreground"
													aria-label="Increase quantity"
												>
													<Plus className="h-4 w-4" />
												</button>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-primary">{formatCurrency(item.price * item.quantity)}</p>
												<p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</AnimatePresence>

						<div className="flex items-center justify-between">
							<Link to="/catalog" className="text-sm font-medium text-primary hover:underline">
								+ Add more books
							</Link>
							<button
								type="button"
								onClick={() => {
									clearCart();
									toast({ type: "info", title: "Cart cleared" });
								}}
								className="text-sm font-medium text-muted-foreground transition hover:text-red-500"
							>
								Clear cart
							</button>
						</div>

						<div className="rounded-2xl border border-border bg-card p-5">
							<div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
								<Tag className="h-4 w-4 text-primary" /> Have a coupon?
							</div>
							<div className="flex gap-2">
								<input
									type="text"
									value={couponInput}
									onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
									placeholder="Enter code"
									className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground uppercase placeholder:normal-case placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
								<button
									type="button"
									onClick={() => applyCoupon()}
									className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
								>
									Apply
								</button>
							</div>
							{(coupons ?? []).length > 0 && (
								<div className="mt-3 flex flex-wrap gap-2">
									{coupons?.map((coupon) => (
										<button
											key={coupon.code}
											type="button"
											onClick={() => applyCoupon(coupon.code)}
											className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
												appliedCoupon?.code === coupon.code
													? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
													: "border-border bg-muted text-muted-foreground hover:text-foreground"
											}`}
										>
											{coupon.code} · {coupon.label}
										</button>
									))}
								</div>
							)}
							{appliedCoupon && (
								<div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
									<span className="inline-flex items-center gap-2 font-medium">
										<CheckCircle2 className="h-4 w-4" /> {appliedCoupon.code} applied
									</span>
									<button
										type="button"
										onClick={() => {
											setAppliedCoupon(null);
											setCouponInput("");
										}}
										className="rounded p-0.5 hover:bg-emerald-500/10"
										aria-label="Remove coupon"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							)}
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						className="lg:sticky lg:top-24 lg:h-fit"
					>
						<div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
							<h2 className="mb-5 text-xl font-bold text-foreground">Order summary</h2>
							<div className="space-y-3 border-b border-border pb-5 text-sm">
								<div className="flex justify-between text-muted-foreground">
									<span>Subtotal</span>
									<span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
								</div>
								<div className="flex justify-between text-muted-foreground">
									<span>Discount</span>
									<span className={discount > 0 ? "font-medium text-emerald-600 dark:text-emerald-400" : ""}>
										{discount > 0 ? `−${formatCurrency(discount)}` : formatCurrency(0)}
									</span>
								</div>
								<div className="flex justify-between text-muted-foreground">
									<span>Tax</span>
									<span>{formatCurrency(0)}</span>
								</div>
							</div>
							<div className="flex justify-between py-5 text-lg font-bold text-foreground">
								<span>Total</span>
								<span className="text-primary">{formatCurrency(total)}</span>
							</div>

							<button
								type="button"
								onClick={handleCheckout}
								disabled={isCheckingOut}
								className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.01] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isCheckingOut ? (
									<>
										<Spinner className="h-5 w-5" /> Processing…
									</>
								) : (
									<>
										<CreditCard className="h-5 w-5" />
										{isAuthenticated ? "Complete purchase" : "Sign in to checkout"}
									</>
								)}
							</button>

							<p className="mt-4 text-center text-xs text-muted-foreground">
								Secure checkout · Instant access · Lifetime library
							</p>
						</div>
					</motion.div>
				</div>
			</div>

			<AnimatePresence>
				{completedOrder && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
					>
						<motion.div
							initial={{ scale: 0.9, y: 24 }}
							animate={{ scale: 1, y: 0 }}
							transition={{ type: "spring", stiffness: 320, damping: 26 }}
							className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-elegant"
						>
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
								className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500"
							>
								<CheckCircle2 className="h-10 w-10" />
							</motion.div>
							<h2 className="text-2xl font-bold text-foreground">Purchase complete!</h2>
							<p className="mt-2 text-muted-foreground">
								{completedOrder.items.length} book
								{completedOrder.items.length === 1 ? "" : "s"} added to your library.
							</p>
							<div className="my-5 rounded-2xl bg-muted/60 p-4 text-left text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Order total</span>
									<span className="font-semibold text-foreground">{formatCurrency(completedOrder.total)}</span>
								</div>
								{completedOrder.discount > 0 && (
									<div className="mt-1 flex justify-between text-emerald-600 dark:text-emerald-400">
										<span>You saved</span>
										<span>{formatCurrency(completedOrder.discount)}</span>
									</div>
								)}
							</div>
							<div className="flex flex-col gap-2 sm:flex-row">
								<button
									type="button"
									onClick={() => navigate("/library")}
									className="flex-1 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
								>
									Go to library
								</button>
								<button
									type="button"
									onClick={() => setCompletedOrder(null)}
									className="flex-1 rounded-xl border border-border px-5 py-3 font-semibold text-foreground transition hover:bg-muted"
								>
									Keep browsing
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default CartPage;
