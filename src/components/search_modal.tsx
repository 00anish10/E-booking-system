import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Search as SearchIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { BooksResponse } from "@/lib/types";

interface SearchModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const debounced = useDebouncedValue(searchQuery, 250);
	const inputRef = useRef<HTMLInputElement>(null);

	const trimmed = debounced.trim();

	const { data, isFetching } = useQuery({
		queryKey: ["search", trimmed],
		enabled: isOpen && trimmed.length > 0,
		queryFn: async () => {
			const response = await api.get<BooksResponse>("/books", {
				params: { search: trimmed, limit: 8, sort: "popular" },
			});
			return response.data;
		},
	});

	const { data: trending } = useQuery({
		queryKey: ["search-trending"],
		enabled: isOpen,
		staleTime: 5 * 60_000,
		queryFn: async () => {
			const response = await api.get<BooksResponse>("/books", {
				params: { tag: "trending", limit: 4 },
			});
			return response.data.books;
		},
	});

	useEffect(() => {
		if (isOpen) {
			setSearchQuery("");
			const timer = setTimeout(() => inputRef.current?.focus(), 80);
			document.body.style.overflow = "hidden";
			return () => {
				clearTimeout(timer);
				document.body.style.overflow = "";
			};
		}
		document.body.style.overflow = "";
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const handler = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [isOpen, onClose]);

	const results = useMemo(() => data?.books ?? [], [data]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
					/>

					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label="Search books"
						initial={{ opacity: 0, scale: 0.96, y: -16 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: -16 }}
						transition={{ type: "spring", stiffness: 380, damping: 32 }}
						className="fixed left-1/2 top-24 z-[80] mx-4 w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
					>
						<div className="flex items-center gap-3 border-b border-border p-4">
							<SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
							<input
								ref={inputRef}
								type="text"
								placeholder="Search by title, author, or category…"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								className="min-w-0 flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
							/>
							{isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
								aria-label="Close search"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="max-h-[60vh] overflow-y-auto">
							{!trimmed ? (
								<div className="p-4">
									<p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Trending searches
									</p>
									{(trending ?? []).map((book) => (
										<Link
											key={book.id}
											to={`/book/${book.id}`}
											onClick={onClose}
											className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted"
										>
											<img src={book.cover} alt={book.title} className="h-14 w-10 rounded object-cover" />
											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold text-foreground">{book.title}</p>
												<p className="truncate text-sm text-muted-foreground">{book.author}</p>
											</div>
											<ArrowRight className="h-4 w-4 text-muted-foreground" />
										</Link>
									))}
									{!trending && (
										<p className="px-2 py-6 text-center text-sm text-muted-foreground">Start typing to search the catalog…</p>
									)}
								</div>
							) : results.length > 0 ? (
								<div className="p-2">
									{results.map((book) => (
										<Link
											key={book.id}
											to={`/book/${book.id}`}
											onClick={onClose}
											className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted"
										>
											<img src={book.cover} alt={book.title} className="h-16 w-11 rounded object-cover" />
											<div className="min-w-0 flex-1">
												<p className="truncate font-semibold text-foreground">{book.title}</p>
												<p className="truncate text-sm text-muted-foreground">{book.author}</p>
												<span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
													{book.category}
												</span>
											</div>
											<span className="font-semibold text-primary">{formatCurrency(book.price)}</span>
										</Link>
									))}
								</div>
							) : (
								<div className="p-10 text-center">
									<p className="text-muted-foreground">No books found for “{searchQuery}”</p>
									<Link
										to="/catalog"
										onClick={onClose}
										className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
									>
										Browse the full catalog <ArrowRight className="h-4 w-4" />
									</Link>
								</div>
							)}
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default SearchModal;
