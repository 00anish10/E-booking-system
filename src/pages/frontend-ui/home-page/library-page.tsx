import { motion } from "framer-motion";
import { BookOpen, BookMarked, CheckCircle2, Clock, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import BookCard from "@/components/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { BookGridSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useLibrary } from "@/hooks/use-library";
import { formatDate } from "@/lib/format";

const LibraryPage = () => {
	useDocumentTitle("My library");
	const { user } = useAuth();
	const library = useLibrary();
	const [search, setSearch] = useState("");

	const books = library.data?.books ?? [];
	const stats = library.data?.stats;

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (!term) return books;
		return books.filter(
			(book) =>
				book.title.toLowerCase().includes(term) ||
				book.author.toLowerCase().includes(term) ||
				book.category.toLowerCase().includes(term),
		);
	}, [books, search]);

	const continueReading = useMemo(
		() =>
			books
				.filter((book) => book.progress > 0 && book.progress < 100)
				.sort(
					(a, b) => new Date(b.lastReadAt ?? b.purchasedAt).getTime() - new Date(a.lastReadAt ?? a.purchasedAt).getTime(),
				),
		[books],
	);

	const statCards = [
		{
			icon: BookMarked,
			label: "Books owned",
			value: stats?.owned ?? 0,
			accent: "bg-primary/10 text-primary",
		},
		{
			icon: BookOpen,
			label: "In progress",
			value: stats?.inProgress ?? 0,
			accent: "bg-sky-500/10 text-sky-500",
		},
		{
			icon: CheckCircle2,
			label: "Completed",
			value: stats?.completed ?? 0,
			accent: "bg-emerald-500/10 text-emerald-500",
		},
		{
			icon: Clock,
			label: "Average progress",
			value: `${stats?.averageProgress ?? 0}%`,
			accent: "bg-accent/20 text-amber-600 dark:text-accent",
		},
	];

	return (
		<div className="min-h-screen pb-16 pt-10">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<p className="mb-1 text-sm font-medium text-primary">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</p>
					<h1 className="text-4xl font-bold text-foreground md:text-5xl">My library</h1>
					<p className="mt-2 text-muted-foreground">Every book you own, with your reading progress saved automatically.</p>
				</motion.div>

				<div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
					{statCards.map((stat, index) => (
						<motion.div
							key={stat.label}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.06 }}
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
					<BookGridSkeleton count={8} />
				) : library.isError ? (
					<ErrorState
						title="Could not load your library"
						message="Please check your connection and try again."
						onRetry={() => library.refetch()}
					/>
				) : books.length === 0 ? (
					<EmptyState
						icon={BookMarked}
						title="Your library is waiting"
						description="Buy your first book and it will appear here forever. Your progress syncs across devices."
						action={
							<Link
								to="/catalog"
								className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02] hover:opacity-90"
							>
								Discover books <Sparkles className="h-4 w-4" />
							</Link>
						}
					/>
				) : (
					<>
						{continueReading.length > 0 && (
							<section className="mb-12">
								<div className="mb-5 flex items-center justify-between">
									<h2 className="text-2xl font-bold text-foreground">Continue reading</h2>
									<span className="text-sm text-muted-foreground">{continueReading.length} in progress</span>
								</div>
								<div className="grid gap-4">
									{continueReading.map((book, index) => (
										<motion.div
											key={book.id}
											initial={{ opacity: 0, x: -16 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.06 }}
											className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-elegant sm:flex-row sm:items-center sm:p-5"
										>
											<img src={book.cover} alt={book.title} className="h-28 w-20 shrink-0 rounded-xl object-cover" />
											<div className="min-w-0 flex-1">
												<Link
													to={`/book/${book.id}`}
													className="line-clamp-1 text-lg font-bold text-foreground transition hover:text-primary"
												>
													{book.title}
												</Link>
												<p className="text-sm text-muted-foreground">{book.author}</p>
												<div className="mt-3 space-y-1.5">
													<div className="flex items-center justify-between text-xs">
														<span className="text-muted-foreground">Last read {formatDate(book.lastReadAt ?? book.purchasedAt)}</span>
														<span className="font-semibold text-foreground">{book.progress}%</span>
													</div>
													<div className="h-2 overflow-hidden rounded-full bg-muted">
														<motion.div
															initial={{ width: 0 }}
															animate={{ width: `${book.progress}%` }}
															transition={{ duration: 0.8, ease: "easeOut" }}
															className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
														/>
													</div>
												</div>
											</div>
											<Link
												to={`/reader/${book.id}`}
												className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
											>
												<BookOpen className="h-4 w-4" /> Continue
											</Link>
										</motion.div>
									))}
								</div>
							</section>
						)}

						<section>
							<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
								<h2 className="text-2xl font-bold text-foreground">All books</h2>
								<div className="relative w-full sm:w-72">
									<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<input
										type="search"
										value={search}
										onChange={(event) => setSearch(event.target.value)}
										placeholder="Search your library…"
										className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
								</div>
							</div>

							{filtered.length === 0 ? (
								<EmptyState
									icon={Search}
									title="No matches in your library"
									description={`Nothing matched “${search}”. Try a different title or author.`}
								/>
							) : (
								<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
									{filtered.map((book, index) => (
										<motion.div
											key={book.id}
											initial={{ opacity: 0, y: 18 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: Math.min(index * 0.04, 0.3) }}
										>
											<BookCard {...book} />
										</motion.div>
									))}
								</div>
							)}
						</section>
					</>
				)}
			</div>
		</div>
	);
};

export default LibraryPage;
