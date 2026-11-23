import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "@/components/book-card";
import { BookGridSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useBooks, useCategories } from "@/hooks/use-books";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useDocumentTitle } from "@/hooks/use-document-title";
import type { BookQuery } from "@/lib/types";

const SORTS: Array<{ value: NonNullable<BookQuery["sort"]>; label: string }> = [
	{ value: "popular", label: "Most popular" },
	{ value: "rating", label: "Highest rated" },
	{ value: "price-low", label: "Price: low to high" },
	{ value: "price-high", label: "Price: high to low" },
	{ value: "newest", label: "Newest first" },
	{ value: "title", label: "Title A–Z" },
];

const CatalogPage = () => {
	useDocumentTitle("Book catalog");
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get("search") ?? "";
	const category = searchParams.get("category") ?? "All";
	const sort = (searchParams.get("sort") as BookQuery["sort"]) ?? "popular";
	const minRating = Number(searchParams.get("minRating") ?? 0);
	const maxPrice = Number(searchParams.get("maxPrice") ?? 50);
	const page = Math.max(1, Number(searchParams.get("page") ?? 1));

	const [searchInput, setSearchInput] = useState(search);
	const [showFilters, setShowFilters] = useState(false);
	const debouncedSearch = useDebouncedValue(searchInput, 350);

	const { data: categoryData } = useCategories();
	const categories = useMemo(() => ["All", ...(categoryData?.map((item) => item.category) ?? [])], [categoryData]);

	useEffect(() => {
		setSearchInput(search);
	}, [search]);

	const updateFilters = useCallback(
		(patch: Record<string, string | number | undefined | null>) => {
			setSearchParams(
				(previous) => {
					const next = new URLSearchParams(previous);
					for (const [key, value] of Object.entries(patch)) {
						const isDefault =
							value === undefined ||
							value === null ||
							value === "" ||
							value === "All" ||
							(key === "page" && Number(value) === 1) ||
							(key === "minRating" && Number(value) === 0) ||
							(key === "maxPrice" && Number(value) === 50);
						if (isDefault) next.delete(key);
						else next.set(key, String(value));
					}
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	useEffect(() => {
		if (debouncedSearch !== search) {
			updateFilters({ search: debouncedSearch || undefined, page: 1 });
		}
	}, [debouncedSearch, search, updateFilters]);

	const query = useBooks({
		search: search || undefined,
		category: category === "All" ? undefined : category,
		sort,
		minRating: minRating || undefined,
		maxPrice: maxPrice < 50 ? maxPrice : undefined,
		page,
		limit: 12,
	});

	const activeFiltersCount = (category !== "All" ? 1 : 0) + (minRating > 0 ? 1 : 0) + (maxPrice < 50 ? 1 : 0);

	const clearFilters = () => {
		setSearchInput("");
		setSearchParams({}, { replace: true });
	};

	const books = query.data?.books ?? [];
	const totalPages = query.data?.totalPages ?? 1;
	const total = query.data?.total ?? 0;

	const goToPage = (next: number) => {
		updateFilters({ page: next });
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const pageNumbers = useMemo(() => {
		const pages: number[] = [];
		const start = Math.max(1, Math.min(page - 1, totalPages - 2));
		for (let i = start; i <= Math.min(totalPages, start + 2); i += 1) {
			pages.push(i);
		}
		return pages;
	}, [page, totalPages]);

	return (
		<div className="min-h-screen pb-16 pt-10">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
						<Sparkles className="h-3.5 w-3.5" /> Curated collection
					</div>
					<h1 className="text-4xl font-bold text-foreground md:text-5xl">Find your next story</h1>
					<p className="mt-3 max-w-2xl text-muted-foreground">
						Search by title, author, or category. Filter by price and rating to find exactly what you are in the mood for.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
					className="mb-8 space-y-4 rounded-2xl border border-border bg-card/80 p-4 shadow-elegant backdrop-blur"
				>
					<div className="relative">
						<Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							placeholder="Search by title, author, or category…"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							className="w-full rounded-xl border border-border bg-background py-3 pl-12 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						/>
						{searchInput && (
							<button
								type="button"
								onClick={() => setSearchInput("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
								aria-label="Clear search"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={() => setShowFilters((open) => !open)}
							className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
						>
							<SlidersHorizontal className="h-4 w-4" />
							Filters
							{activeFiltersCount > 0 && (
								<span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
									{activeFiltersCount}
								</span>
							)}
						</button>

						<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
							Sort
							<select
								value={sort}
								onChange={(event) =>
									updateFilters({
										sort: event.target.value === "popular" ? undefined : event.target.value,
										page: 1,
									})
								}
								className="cursor-pointer rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							>
								{SORTS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</label>

						{(activeFiltersCount > 0 || search) && (
							<button
								type="button"
								onClick={clearFilters}
								className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
							>
								<X className="h-4 w-4" /> Clear all
							</button>
						)}

						<span className="ml-auto text-sm text-muted-foreground">
							{query.isFetching && !query.isLoading
								? "Updating results…"
								: `${total.toLocaleString()} book${total === 1 ? "" : "s"}`}
						</span>
					</div>

					<AnimatePresence initial={false}>
						{showFilters && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="overflow-hidden"
							>
								<div className="space-y-6 border-t border-border pt-5">
									<div>
										<h3 className="mb-3 text-sm font-semibold text-foreground">Category</h3>
										<div className="flex flex-wrap gap-2">
											{categories.map((item) => (
												<button
													key={item}
													type="button"
													onClick={() =>
														updateFilters({
															category: item === "All" ? undefined : item,
															page: 1,
														})
													}
													className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
														category === item
															? "bg-primary text-primary-foreground"
															: "bg-muted text-muted-foreground hover:text-foreground"
													}`}
												>
													{item}
												</button>
											))}
										</div>
									</div>

									<div className="grid gap-6 sm:grid-cols-2">
										<div>
											<h3 className="mb-3 text-sm font-semibold text-foreground">Max price: ${maxPrice}</h3>
											<input
												type="range"
												min={0}
												max={50}
												step={1}
												value={maxPrice}
												onChange={(event) =>
													updateFilters({
														maxPrice: Number(event.target.value),
														page: 1,
													})
												}
												className="w-full accent-primary"
												aria-label="Maximum price"
											/>
										</div>

										<div>
											<h3 className="mb-3 text-sm font-semibold text-foreground">Minimum rating</h3>
											<div className="flex gap-2">
												{[0, 3, 4, 4.5].map((rating) => (
													<button
														key={rating}
														type="button"
														onClick={() => updateFilters({ minRating: rating, page: 1 })}
														className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
															minRating === rating
																? "bg-accent text-accent-foreground"
																: "bg-muted text-muted-foreground hover:text-foreground"
														}`}
													>
														{rating === 0 ? "All" : `${rating}+ ★`}
													</button>
												))}
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{query.isLoading ? (
					<BookGridSkeleton count={8} />
				) : query.isError ? (
					<ErrorState
						title="Could not load the catalog"
						message="Check that the API is running and try again."
						onRetry={() => query.refetch()}
					/>
				) : books.length === 0 ? (
					<EmptyState
						icon={Search}
						title="No books match those filters"
						description="Try widening your price range or searching for a different author or title."
						action={
							<button
								type="button"
								onClick={clearFilters}
								className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
							>
								Clear filters
							</button>
						}
					/>
				) : (
					<motion.div
						key={`${search}-${category}-${sort}-${minRating}-${maxPrice}-${page}`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
					>
						{books.map((book, index) => (
							<motion.div
								key={book.id}
								initial={{ opacity: 0, y: 18 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: Math.min(index * 0.04, 0.4) }}
							>
								<BookCard {...book} />
							</motion.div>
						))}
					</motion.div>
				)}

				{totalPages > 1 && (
					<div className="mt-12 flex items-center justify-center gap-2">
						<button
							type="button"
							onClick={() => goToPage(page - 1)}
							disabled={page === 1}
							className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
						>
							<ChevronLeft className="h-4 w-4" /> Previous
						</button>

						{pageNumbers.map((pageNumber) => (
							<button
								key={pageNumber}
								type="button"
								onClick={() => goToPage(pageNumber)}
								className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
									pageNumber === page
										? "bg-primary text-primary-foreground"
										: "border border-border bg-card text-foreground hover:bg-muted"
								}`}
								aria-current={pageNumber === page ? "page" : undefined}
							>
								{pageNumber}
							</button>
						))}

						<button
							type="button"
							onClick={() => goToPage(page + 1)}
							disabled={page === totalPages}
							className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
						>
							Next <ChevronRight className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CatalogPage;
