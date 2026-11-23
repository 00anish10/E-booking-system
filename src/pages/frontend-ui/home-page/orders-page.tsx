import { motion } from "framer-motion";
import { Package, Receipt, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useOrders } from "@/hooks/use-library";
import { formatCurrency, formatDate } from "@/lib/format";

const OrdersPage = () => {
	useDocumentTitle("Your orders");
	const orders = useOrders();

	return (
		<div className="min-h-screen pb-16 pt-10">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<h1 className="text-4xl font-bold text-foreground">Your orders</h1>
					<p className="mt-2 text-muted-foreground">A permanent record of every book you have purchased.</p>
				</motion.div>

				{orders.isLoading ? (
					<div className="space-y-4">
						{[0, 1, 2].map((index) => (
							<Skeleton key={index} className="h-44 w-full" />
						))}
					</div>
				) : orders.isError ? (
					<ErrorState
						title="Could not load your orders"
						message="Please try again in a moment."
						onRetry={() => orders.refetch()}
					/>
				) : (orders.data ?? []).length === 0 ? (
					<EmptyState
						icon={ShoppingBag}
						title="No orders yet"
						description="When you complete a purchase, your order history will appear here."
						action={
							<Link
								to="/catalog"
								className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
							>
								Browse books
							</Link>
						}
					/>
				) : (
					<div className="space-y-4">
						{orders.data?.map((order, index) => (
							<motion.div
								key={order.id}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.06 }}
								className="rounded-2xl border border-border bg-card p-5 shadow-elegant sm:p-6"
							>
								<div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
									<div className="flex items-center gap-3">
										<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
											<Receipt className="h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-semibold text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
											<p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400">
											{order.status}
										</span>
										<span className="text-lg font-bold text-foreground">{formatCurrency(order.total)}</span>
									</div>
								</div>

								<div className="space-y-3">
									{order.items.map((item) => (
										<div key={item.id} className="flex items-center gap-3">
											{item.cover ? (
												<img src={item.cover} alt={item.title} className="h-16 w-11 rounded object-cover" />
											) : (
												<div className="flex h-16 w-11 items-center justify-center rounded bg-muted">
													<Package className="h-5 w-5 text-muted-foreground" />
												</div>
											)}
											<div className="min-w-0 flex-1">
												<Link
													to={`/book/${item.id}`}
													className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary"
												>
													{item.title}
												</Link>
												<p className="text-xs text-muted-foreground">
													Qty {item.quantity} · {formatCurrency(item.price)}
												</p>
											</div>
											<Link
												to={`/reader/${item.id}`}
												className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
											>
												Read
											</Link>
										</div>
									))}
								</div>

								<div className="mt-4 flex justify-end gap-5 border-t border-border pt-3 text-sm">
									{order.discount > 0 && (
										<span className="text-emerald-600 dark:text-emerald-400">Saved {formatCurrency(order.discount)}</span>
									)}
									<span className="text-muted-foreground">Subtotal {formatCurrency(order.subtotal)}</span>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default OrdersPage;
