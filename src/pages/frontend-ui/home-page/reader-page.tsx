import { AnimatePresence, motion } from "framer-motion";
import {
	Bookmark,
	BookmarkCheck,
	ChevronLeft,
	ChevronRight,
	Lock,
	Moon,
	Settings,
	ShoppingCart,
	Sun,
	Type,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ErrorState } from "@/components/ui/error-state";
import { FullPageLoader, Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { useBook } from "@/hooks/use-books";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useLibrary, useUpdateProgress } from "@/hooks/use-library";
import { chapterTitle, getPageContent } from "@/lib/reader-content";

const FREE_PAGES = 5;

const ReaderPage = () => {
	const { bookId } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const { addToCart } = useCart();
	const { toast } = useToast();
	const { theme, toggleTheme } = useTheme();

	const bookQuery = useBook(bookId);
	const library = useLibrary();
	const updateProgress = useUpdateProgress();

	const book = bookQuery.data?.book;
	const owned = library.data?.books.find((item) => item.id === bookId);

	const [currentPage, setCurrentPage] = useState(1);
	const [direction, setDirection] = useState(1);
	const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("reader-font") ?? 18));
	const [fontFamily, setFontFamily] = useState<"serif" | "sans">(() =>
		localStorage.getItem("reader-font-family") === "sans" ? "sans" : "serif",
	);
	const isDarkMode = theme === "dark";
	const [showControls, setShowControls] = useState(true);
	const [showSettings, setShowSettings] = useState(false);
	const [bookmark, setBookmark] = useState<number | null>(() => {
		const raw = localStorage.getItem(`reader-bookmark-${bookId}`);
		return raw ? Number(raw) : null;
	});

	const initialized = useRef(false);
	const previousProgress = useRef<number | null>(null);

	const totalPages = book?.pages ?? 1;
	const maxReadablePage = owned ? totalPages : FREE_PAGES;
	const isPreview = !owned;

	useDocumentTitle(book ? `Reading ${book.title}` : "Reader");

	useEffect(() => {
		localStorage.setItem("reader-font", String(fontSize));
	}, [fontSize]);

	useEffect(() => {
		localStorage.setItem("reader-font-family", fontFamily);
	}, [fontFamily]);

	useEffect(() => {
		if (!owned || initialized.current) return;
		const page = Math.max(1, Math.min(totalPages, Math.round((owned.progress / 100) * totalPages)));
		setCurrentPage(page);
		initialized.current = true;
	}, [owned, totalPages]);

	useEffect(() => {
		setCurrentPage((page) => Math.min(page, maxReadablePage));
	}, [maxReadablePage]);

	useEffect(() => {
		if (!owned || !book || !bookId) return;
		if (previousProgress.current === currentPage) return;
		previousProgress.current = currentPage;
		const progress = Math.min(100, Math.max(0, Math.round((currentPage / totalPages) * 100)));
		const timer = setTimeout(() => {
			updateProgress.mutate({ bookId, progress });
		}, 700);
		return () => clearTimeout(timer);
	}, [currentPage, owned, book, bookId, totalPages, updateProgress]);

	const goToPage = (next: number) => {
		setDirection(next > currentPage ? 1 : -1);
		setCurrentPage(Math.max(1, Math.min(maxReadablePage, next)));
	};

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
			if (event.key === "ArrowLeft") goToPage(currentPage - 1);
			if (event.key === "ArrowRight") goToPage(currentPage + 1);
			if (event.key === "Escape") setShowSettings(false);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	});

	const paragraphs = useMemo(() => (book ? getPageContent(book, currentPage) : []), [book, currentPage]);

	const progressPercent = owned
		? Math.min(100, (currentPage / totalPages) * 100)
		: Math.min(100, (currentPage / FREE_PAGES) * 100);

	const minutesLeft = Math.max(1, Math.round(((totalPages - currentPage) / totalPages) * (totalPages / 1.5)));

	const isLoading = bookQuery.isLoading || (isAuthenticated && library.isLoading);

	if (isLoading) return <FullPageLoader label="Opening your book" />;

	if (bookQuery.isError || !book) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-20">
				<ErrorState
					title="This book could not be opened"
					message="It may have been removed from the shelves."
					onRetry={() => bookQuery.refetch()}
				/>
			</div>
		);
	}

	const saveBookmark = () => {
		localStorage.setItem(`reader-bookmark-${bookId}`, String(currentPage));
		setBookmark(currentPage);
		toast({
			type: "success",
			title: "Bookmark saved",
			description: `You can return to page ${currentPage} anytime.`,
		});
	};

	const handleUnlock = async () => {
		await addToCart({
			id: book.id,
			title: book.title,
			author: book.author,
			price: book.price,
			cover: book.cover,
		});
		toast({
			type: "success",
			title: "Added to cart",
			description: "Complete checkout to unlock the full book.",
		});
		navigate("/cart");
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-neutral-950" : "bg-[hsl(40_24%_97%)]"}`}
		>
			<motion.header
				initial={{ y: -80 }}
				animate={{ y: showControls ? 0 : -84 }}
				className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
					isDarkMode ? "border-neutral-800 bg-neutral-950/90" : "border-[hsl(40_16%_85%)] bg-white/90"
				}`}
			>
				<div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
					<button
						type="button"
						onClick={() => navigate(`/book/${bookId}`)}
						className={`rounded-xl p-2 transition ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
						aria-label="Close reader"
					>
						<X className="h-5 w-5" />
					</button>

					<div className="min-w-0 text-center">
						<h2 className="truncate text-sm font-semibold md:text-base">{book.title}</h2>
						<p className="text-xs text-neutral-500">
							Page {currentPage} / {totalPages}
							{isPreview && (
								<span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
									Preview
								</span>
							)}
						</p>
					</div>

					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={saveBookmark}
							className={`rounded-xl p-2 transition ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
							aria-label="Bookmark this page"
						>
							{bookmark === currentPage ? (
								<BookmarkCheck className="h-5 w-5 text-amber-500" />
							) : (
								<Bookmark className="h-5 w-5" />
							)}
						</button>
						<button
							type="button"
							onClick={() => setShowSettings(true)}
							className={`rounded-xl p-2 transition ${isDarkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
							aria-label="Reading settings"
						>
							<Settings className="h-5 w-5" />
						</button>
					</div>
				</div>
			</motion.header>

			<main
				className="mx-auto max-w-3xl px-4 pb-36 pt-24"
				onClick={() => setShowControls((value) => !value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						setShowControls((value) => !value);
					}
				}}
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.article
						key={currentPage}
						initial={{ opacity: 0, x: direction * 40 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: direction * -40 }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className={`reader-content ${isDarkMode ? "text-neutral-200" : "text-neutral-800"}`}
						style={{
							fontSize,
							fontFamily: fontFamily === "serif" ? "Fraunces, Georgia, serif" : "Inter, system-ui, sans-serif",
							lineHeight: 1.85,
						}}
					>
						<p className="mb-2 text-xs uppercase tracking-[0.25em] text-neutral-500">{chapterTitle(currentPage)}</p>
						<h1 className="mb-8 text-2xl font-bold md:text-3xl">
							{currentPage === 1 ? book.title : chapterTitle(currentPage)}
						</h1>

						{paragraphs.map((paragraph) => (
							<p key={paragraph} className="mb-5">
								{paragraph}
							</p>
						))}

						{isPreview && currentPage === FREE_PAGES && (
							<div className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
								<Lock className="mx-auto mb-3 h-8 w-8 text-amber-500" />
								<h3 className="text-lg font-bold">You've reached the preview limit</h3>
								<p className="mt-1 text-sm text-neutral-500">
									Unlock all {totalPages} pages of {book.title} for a one-time purchase.
								</p>
								<button
									type="button"
									onClick={(event) => {
										event.stopPropagation();
										void handleUnlock();
									}}
									className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
								>
									<ShoppingCart className="h-4 w-4" /> Buy for ${book.price.toFixed(2)}
								</button>
							</div>
						)}
					</motion.article>
				</AnimatePresence>

				<div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-500/20 pt-4 text-xs text-neutral-500">
					<span>{chapterTitle(currentPage)}</span>
					<span>~{minutesLeft} min left</span>
				</div>
			</main>

			<motion.footer
				initial={{ y: 100 }}
				animate={{ y: showControls ? 0 : 110 }}
				className={`fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-xl ${
					isDarkMode ? "border-neutral-800 bg-neutral-950/90" : "border-[hsl(40_16%_85%)] bg-white/90"
				}`}
			>
				<div className="mx-auto max-w-3xl space-y-3 px-4 py-3">
					<div className="h-1.5 overflow-hidden rounded-full bg-neutral-500/20">
						<motion.div
							className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
							animate={{ width: `${progressPercent}%` }}
							transition={{ type: "spring", stiffness: 120, damping: 24 }}
						/>
					</div>

					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									goToPage(currentPage - 1);
								}}
								disabled={currentPage === 1}
								className="rounded-xl p-2 transition hover:bg-neutral-500/10 disabled:opacity-30"
								aria-label="Previous page"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<span className="px-1 text-xs text-neutral-500">
								{currentPage} / {maxReadablePage}
							</span>
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									goToPage(currentPage + 1);
								}}
								disabled={currentPage === maxReadablePage}
								className="rounded-xl p-2 transition hover:bg-neutral-500/10 disabled:opacity-30"
								aria-label="Next page"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
						</div>

						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									setFontSize((value) => Math.max(14, value - 1));
								}}
								className="rounded-xl p-2 transition hover:bg-neutral-500/10"
								aria-label="Decrease font size"
							>
								<ZoomOut className="h-5 w-5" />
							</button>
							<span className="w-9 text-center text-xs text-neutral-500">{fontSize}px</span>
							<button
								type="button"
								onClick={(event) => {
									event.stopPropagation();
									setFontSize((value) => Math.min(32, value + 1));
								}}
								className="rounded-xl p-2 transition hover:bg-neutral-500/10"
								aria-label="Increase font size"
							>
								<ZoomIn className="h-5 w-5" />
							</button>
						</div>

						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								toggleTheme();
							}}
							className="rounded-xl p-2 transition hover:bg-neutral-500/10"
							aria-label="Toggle dark mode"
						>
							{isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
						</button>
					</div>

					{!owned && (
						<button
							type="button"
							onClick={(event) => {
								event.stopPropagation();
								void handleUnlock();
							}}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
						>
							<ShoppingCart className="h-4 w-4" /> Unlock the full book · ${book.price.toFixed(2)}
						</button>
					)}
				</div>
			</motion.footer>

			<AnimatePresence>
				{showSettings && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
						onClick={() => setShowSettings(false)}
					>
						<motion.div
							initial={{ y: 60, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: 60, opacity: 0 }}
							onClick={(event) => event.stopPropagation()}
							className={`w-full max-w-sm rounded-t-3xl p-6 sm:rounded-3xl ${
								isDarkMode ? "bg-neutral-900 text-neutral-100" : "bg-white"
							}`}
						>
							<div className="mb-5 flex items-center justify-between">
								<h3 className="text-lg font-bold">Reading settings</h3>
								<button
									type="button"
									onClick={() => setShowSettings(false)}
									className="rounded-lg p-1.5 hover:bg-neutral-500/10"
									aria-label="Close settings"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							<div className="space-y-5">
								<div>
									<div className="mb-2 flex items-center justify-between text-sm">
										<span className="inline-flex items-center gap-2 font-medium">
											<Type className="h-4 w-4" /> Font size
										</span>
										<span className="text-neutral-500">{fontSize}px</span>
									</div>
									<input
										type="range"
										min={14}
										max={32}
										step={1}
										value={fontSize}
										onChange={(event) => setFontSize(Number(event.target.value))}
										className="w-full accent-primary"
									/>
								</div>

								<div>
									<p className="mb-2 text-sm font-medium">Typeface</p>
									<div className="grid grid-cols-2 gap-2">
										{(
											[
												{ id: "serif", label: "Serif" },
												{ id: "sans", label: "Sans" },
											] as const
										).map((option) => (
											<button
												key={option.id}
												type="button"
												onClick={() => setFontFamily(option.id)}
												className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
													fontFamily === option.id ? "border-primary bg-primary text-primary-foreground" : "border-neutral-500/30"
												}`}
											>
												{option.label}
											</button>
										))}
									</div>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Theme</span>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => {
												if (isDarkMode) toggleTheme();
											}}
											className={`rounded-xl border px-3 py-2 text-sm ${
												!isDarkMode ? "border-primary bg-primary text-primary-foreground" : "border-neutral-500/30"
											}`}
										>
											<Sun className="h-4 w-4" />
										</button>
										<button
											type="button"
											onClick={() => {
												if (!isDarkMode) toggleTheme();
											}}
											className={`rounded-xl border px-3 py-2 text-sm ${
												isDarkMode ? "border-primary bg-primary text-primary-foreground" : "border-neutral-500/30"
											}`}
										>
											<Moon className="h-4 w-4" />
										</button>
									</div>
								</div>

								{bookmark && (
									<button
										type="button"
										onClick={() => {
											goToPage(bookmark);
											setShowSettings(false);
										}}
										className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-500/30 px-4 py-2.5 text-sm font-medium"
									>
										<BookmarkCheck className="h-4 w-4" /> Resume from page {bookmark}
									</button>
								)}

								{updateProgress.isPending && (
									<p className="inline-flex items-center gap-2 text-xs text-neutral-500">
										<Spinner className="h-3 w-3" /> Saving progress…
									</p>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default ReaderPage;
