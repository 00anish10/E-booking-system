import { motion } from "framer-motion";
import {
	ArrowUpRight,
	BarChart3,
	BookMarked,
	CheckCircle2,
	Clock,
	CreditCard,
	Library,
	TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useBooks } from "@/hooks/use-books";
import { useLibrary, useOrders } from "@/hooks/use-library";
import { formatCurrency, formatDate } from "@/lib/format";

const DashboardPage = () => {
	useDocumentTitle("Reading dashboard");
	const { user } = useAuth();
	const library = useLibrary();
	const orders = useOrders();
	const recommendations = useBooks({ sort: "rating", limit: 4 });

	const books = library.data?.books ?? [];
	const stats = library.data?.stats;
	const totalSpent = (orders.data ?? []).reduce((sum, order) => sum + order.total, 0);

	const categoryData = useMemo(() => {
		const counts = new Map<string, number>();
		for (const book of books) {
			counts.set(book.category, (counts.get(book.category) ?? 0) + 1);
		}
		return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
	}, [books]);

	const maxCategory = Math.max(1, ...categoryData.map(([, count]) => count));

	const readingNow = [...books]
		.filter((book) => book.progress > 0 && book.progress < 100)
		.sort((a, b) => b.progress - a.progress)
		.slice(0, 5);

	const statCards = [
		{
			icon: BookMarked,
			label: "Owned",
			value: stats?.owned ?? 0,
			accent: "bg-primary/10 text-primary",
		},
		{
			icon: CheckCircle2,
			label: "Completed",
			value: stats?.completed ?? 0,
			accent: "bg-emerald-500/10 text-emerald-500",
		},
		{
			icon: Clock,
			label: "In progress",
			value: stats?.inProgress ?? 0,
			accent: "bg-sky-500/10 text-sky-500",
		},
		{
			icon: CreditCard,
			label: "Total spent",
			value: formatCurrency(totalSpent),
			accent: "bg-accent/20 text-amber-600 dark:text-accent",
		},
	];

	return (
		<div className="min-h-screen pb-16 pt-10">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: -12 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8 flex flex-wrap items-end justify-between gap-4"
				>
					<div>
						<p className="mb-1 text-sm font-medium text-primary">Reading dashboard</p>
						<h1 className="text-4xl font-bold text-foreground md:text-5xl">
							{user ? `${user.name.split(" ")[0]}'s insights` : "Your insights"}
						</h1>
						<p className="mt-2 text-muted-foreground">A quick look at your library, progress, and spending.</p>
					</div>
					<Link
						to="/library"
						className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
					>
						<Library className="h-4 w-4" /> Open library
					</Link>
				</motion.div>

				<div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
					{statCards.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							className="rounded-2xl border border-border bg-card p-5 shadow-elegant"
						>
							<div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.accent}`}>
								<stat.icon className="h-5 w-5" />
							</div>
							<div className="text-2xl font-bold text-foreground">{stat.value}</div>
							<div className="text-sm text-muted-foreground">{stat.label}</div>
						</motion.div>
					))}
				</div>

				{library.isLoading ? (
					<div className="grid gap-6 lg:grid-cols-3">
						<Skeleton className="h-80 lg:col-span-2" />
						<Skeleton className="h-80" />
					</div>
				) : books.length === 0 ? (
					<EmptyState
						icon={BarChart3}
						title="Your dashboard is warming up"
						description="Buy your first book to unlock progress tracking, spending insights, and recommendations."
						action={
							<Link
								to="/catalog"
								className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
							>
								Find your first book
							</Link>
						}
					/>
				) : (
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
								<div className="mb-5 flex items-center justify-between">
									<h2 className="text-xl font-bold text-foreground">Currently reading</h2>
									<span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
										<TrendingUp className="h-4 w-4" />
										{stats?.averageProgress ?? 0}% avg
									</span>
								</div>
								{readingNow.length === 0 ? (
									<p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
										No books in progress. Start one from your library.
									</p>
								) : (
									<div className="space-y-4">
										{readingNow.map((book, index) => (
											<div key={book.id} className="flex items-center gap-3">
												<img src={book.cover} alt={book.title} className="h-16 w-11 shrink-0 rounded object-cover" />
												<div className="min-w-0 flex-1">
													<div className="flex items-center justify-between gap-2">
														<Link
															to={`/reader/${book.id}`}
															className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary"
														>
															{book.title}
														</Link>
														<span className="text-xs font-semibold text-muted-foreground">{book.progress}%</span>
													</div>
													<div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
														<motion.div
															initial={{ width: 0 }}
															animate={{ width: `${book.progress}%` }}
															transition={{ delay: index * 0.08, duration: 0.7 }}
															className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
														/>
													</div>
												</div>
												<Link
													to={`/reader/${book.id}`}
													className="rounded-lg border border-border p-2 text-muted-foreground transition hover:text-foreground"
													aria-label={`Continue ${book.title}`}
												>
													<ArrowUpRight className="h-4 w-4" />
												</Link>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
								<h2 className="mb-5 text-xl font-bold text-foreground">Recent orders</h2>
								{(orders.data ?? []).length === 0 ? (
									<p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
										No orders yet.
									</p>
								) : (
									<div className="space-y-3">
										{(orders.data ?? []).slice(0, 4).map((order) => (
											<div key={order.id} className="flex items-center justify-between rounded-2xl bg-muted/50 p-3 text-sm">
												<div>
													<p className="font-semibold text-foreground">
														{order.items.length} book
														{order.items.length === 1 ? "" : "s"}
													</p>
													<p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
												</div>
												<span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="space-y-6">
							<div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
								<h2 className="mb-5 text-xl font-bold text-foreground">Library by genre</h2>
								<div className="space-y-4">
									{categoryData.map(([category, count], index) => (
										<div key={category}>
											<div className="mb-1.5 flex items-center justify-between text-sm">
												<span className="font-medium text-foreground">{category}</span>
												<span className="text-muted-foreground">{count}</span>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-muted">
												<motion.div
													initial={{ width: 0 }}
													animate={{ width: `${(count / maxCategory) * 100}%` }}
													transition={{ delay: index * 0.07, duration: 0.7 }}
													className="h-full rounded-full bg-primary"
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
								<div className="mb-4 flex items-center justify-between">
									<h2 className="text-xl font-bold text-foreground">Top rated</h2>
									<Link to="/catalog?sort=rating" className="text-xs font-semibold text-primary hover:underline">
										See all
									</Link>
								</div>
								<div className="space-y-3">
									{(recommendations.data?.books ?? []).slice(0, 4).map((book) => (
										<Link
											key={book.id}
											to={`/book/${book.id}`}
											className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted"
										>
											<img src={book.cover} alt={book.title} className="h-14 w-10 rounded object-cover" />
											<div className="min-w-0 flex-1">
												<p className="line-clamp-1 text-sm font-semibold text-foreground">{book.title}</p>
												<p className="line-clamp-1 text-xs text-muted-foreground">{book.author}</p>
											</div>
											<span className="text-sm font-bold text-primary">★ {book.rating}</span>
										</Link>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;
