import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ArrowLeft,
	BookOpen,
	Bookmark,
	Heart,
	MessageSquare,
	Share2,
	ShoppingCart,
	Star,
	ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import * as yup from "yup";
import BookCard from "@/components/book-card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { useBook, useBooks } from "@/hooks/use-books";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useLibrary } from "@/hooks/use-library";
import { useWishlist } from "@/hooks/use-wishlist";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const reviewSchema = yup.object({
	rating: yup.number().min(1, "Pick a rating").max(5).required(),
	body: yup
		.string()
		.trim()
		.min(10, "Review must be at least 10 characters")
		.max(2000)
		.required("Please write a short review"),
});

type ReviewForm = yup.InferType<typeof reviewSchema>;

const BookDetailPage = () => {
	const { bookId } = useParams();
	const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
	const [imageFailed, setImageFailed] = useState(false);

	const { addToCart } = useCart();
	const { isAuthenticated, user } = useAuth();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { isWishlisted, toggle, isPending } = useWishlist();

	const bookQuery = useBook(bookId);
	const library = useLibrary();
	const book = bookQuery.data?.book;
	const reviews = bookQuery.data?.reviews ?? [];

	useDocumentTitle(book?.title ?? "Book details");

	const related = useBooks({ category: book?.category, limit: 6 });

	const owned = library.data?.books.find((item) => item.id === bookId);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ReviewForm>({
		resolver: yupResolver(reviewSchema),
		defaultValues: { rating: 5, body: "" },
	});

	const rating = watch("rating");

	const reviewMutation = useMutation({
		mutationFn: async (values: ReviewForm) => {
			await api.post(`/books/${bookId}/reviews`, values);
		},
		onSuccess: async () => {
			toast({
				type: "success",
				title: "Review published",
				description: "Thanks for sharing your thoughts!",
			});
			reset({ rating: 5, body: "" });
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["book", bookId] }),
				queryClient.invalidateQueries({ queryKey: ["books"] }),
			]);
		},
		onError: (error) => {
			toast({
				type: "error",
				title: "Could not publish review",
				description: getErrorMessage(error),
			});
		},
	});

	if (bookQuery.isLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-12 lg:grid-cols-2">
					<Skeleton className="mx-auto aspect-[2/3] w-full max-w-md" />
					<div className="space-y-4">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-12 w-3/4" />
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-12 w-56" />
					</div>
				</div>
			</div>
		);
	}

	if (bookQuery.isError || !book) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-16">
				<ErrorState
					title="Book not found"
					message="This title may have moved off the shelves. Browse the catalog to find something new."
					onRetry={() => bookQuery.refetch()}
				/>
				<div className="mt-6 text-center">
					<Link
						to="/catalog"
						className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
					>
						<ArrowLeft className="h-4 w-4" /> Back to catalog
					</Link>
				</div>
			</div>
		);
	}

	const wishlisted = isWishlisted(book.id);
	const alreadyReviewed = reviews.some((review) => review.author === user?.name);

	const handleAddToCart = async () => {
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
			description: book.title,
		});
	};

	const handleWishlist = async () => {
		await toggle(book.id);
		toast({
			type: "success",
			title: wishlisted ? "Removed from wishlist" : "Saved to wishlist",
			description: isAuthenticated ? book.title : "Saved on this device. Sign in to sync across devices.",
		});
	};

	const handleShare = async () => {
		const url = window.location.href;
		try {
			if (navigator.share) {
				await navigator.share({ title: book.title, text: book.description, url });
			} else {
				await navigator.clipboard.writeText(url);
				toast({ type: "success", title: "Link copied to clipboard" });
			}
		} catch {
			toast({ type: "info", title: "Sharing was cancelled" });
		}
	};

	return (
		<div className="min-h-screen pb-20 pt-8">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<Link
					to="/catalog"
					className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" /> Back to catalog
				</Link>

				<div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
					<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
						<div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
							{imageFailed ? (
								<div className="flex aspect-[2/3] flex-col items-center justify-center gap-4 bg-gradient-to-br from-primary/20 via-muted to-accent/20 p-10 text-center">
									<BookOpen className="h-16 w-16 text-primary/50" />
									<span className="font-display text-2xl font-bold">{book.title}</span>
								</div>
							) : (
								<img src={book.cover} alt={book.title} onError={() => setImageFailed(true)} className="w-full object-cover" />
							)}
							<div className="absolute left-4 top-4 flex flex-col gap-2">
								{book.bestseller && (
									<span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground shadow">
										Bestseller
									</span>
								)}
								{book.trending && (
									<span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow">Trending</span>
								)}
							</div>
						</div>

						{owned && (
							<div className="rounded-2xl border border-border bg-card p-4">
								<div className="mb-2 flex items-center justify-between text-sm">
									<span className="font-medium text-foreground">Your progress</span>
									<span className="text-muted-foreground">{owned.progress}%</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-muted">
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: `${owned.progress}%` }}
										className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
									/>
								</div>
							</div>
						)}
					</motion.div>

					<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
						<div>
							<span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{book.category}</span>
							<h1 className="mt-4 text-balance text-4xl font-bold text-foreground md:text-5xl">{book.title}</h1>
							<p className="mt-2 text-lg text-muted-foreground">
								by <span className="font-medium text-foreground">{book.author}</span>
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-5">
							<div className="flex items-center gap-2">
								<div className="flex">
									{[1, 2, 3, 4, 5].map((star) => (
										<Star
											key={star}
											className={`h-5 w-5 ${star <= Math.round(book.rating) ? "fill-accent text-accent" : "text-muted"}`}
										/>
									))}
								</div>
								<span className="font-semibold text-foreground">{book.rating.toFixed(1)}</span>
								<span className="text-sm text-muted-foreground">({formatNumber(book.reviews)} reviews)</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{book.pages} pages · {book.language}
							</span>
						</div>

						<div className="flex items-end gap-3">
							<span className="text-4xl font-bold text-primary">{formatCurrency(book.price)}</span>
							<span className="pb-1 text-sm text-muted-foreground">One-time purchase · lifetime access</span>
						</div>

						<div className="flex flex-wrap gap-3">
							{owned ? (
								<Link
									to={`/reader/${book.id}`}
									className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02] hover:opacity-90"
								>
									<BookOpen className="h-5 w-5" />
									{owned.progress > 0 ? "Continue reading" : "Read full book"}
								</Link>
							) : (
								<>
									<button
										type="button"
										onClick={handleAddToCart}
										className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-elegant transition hover:scale-[1.02] hover:opacity-90"
									>
										<ShoppingCart className="h-5 w-5" /> Add to cart
									</button>
									<Link
										to={`/reader/${book.id}`}
										className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 font-semibold text-foreground transition hover:bg-muted"
									>
										<BookOpen className="h-5 w-5" /> Read free preview
									</Link>
								</>
							)}

							<button
								type="button"
								onClick={handleWishlist}
								disabled={isPending}
								className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3.5 font-medium transition ${
									wishlisted
										? "border-red-500/30 bg-red-500/10 text-red-500"
										: "border-border bg-card text-muted-foreground hover:text-foreground"
								}`}
								aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
							>
								<Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
								{wishlisted ? "Saved" : "Save"}
							</button>

							<button
								type="button"
								onClick={handleShare}
								className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 font-medium text-muted-foreground transition hover:text-foreground"
								aria-label="Share this book"
							>
								<Share2 className="h-5 w-5" />
							</button>
						</div>

						<div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5 text-sm sm:grid-cols-4">
							{[
								{ label: "Publisher", value: book.publisher },
								{ label: "Published", value: book.publishDate },
								{ label: "ISBN", value: book.isbn },
								{ label: "Pages", value: String(book.pages) },
							].map((item) => (
								<div key={item.label}>
									<p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
									<p className="mt-1 font-medium text-foreground">{item.value}</p>
								</div>
							))}
						</div>

						<div className="rounded-2xl border border-border bg-card p-6">
							<div className="mb-5 flex gap-2 border-b border-border">
								{(
									[
										{ id: "details", label: "Details" },
										{ id: "reviews", label: `Reviews (${reviews.length})` },
									] as const
								).map((tab) => (
									<button
										key={tab.id}
										type="button"
										onClick={() => setActiveTab(tab.id)}
										className={`relative px-4 py-3 text-sm font-semibold transition ${
											activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
										}`}
									>
										{tab.label}
										{activeTab === tab.id && (
											<motion.div layoutId="bookTab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
										)}
									</button>
								))}
							</div>

							{activeTab === "details" ? (
								<div className="space-y-6">
									<div>
										<h2 className="mb-2 text-xl font-bold text-foreground">About this book</h2>
										<p className="leading-relaxed text-muted-foreground">{book.description}</p>
									</div>
									<div className="border-t border-border pt-5">
										<h3 className="mb-2 text-lg font-bold text-foreground">About the author</h3>
										<p className="leading-relaxed text-muted-foreground">{book.authorBio}</p>
									</div>
								</div>
							) : (
								<div className="space-y-6">
									<div className="flex flex-col gap-4 rounded-2xl bg-muted/60 p-5 sm:flex-row sm:items-center sm:justify-between">
										<div className="flex items-center gap-4">
											<span className="text-4xl font-bold text-foreground">{book.rating.toFixed(1)}</span>
											<div>
												<div className="flex">
													{[1, 2, 3, 4, 5].map((star) => (
														<Star
															key={star}
															className={`h-4 w-4 ${
																star <= Math.round(book.rating) ? "fill-accent text-accent" : "text-muted-foreground/30"
															}`}
														/>
													))}
												</div>
												<p className="mt-1 text-sm text-muted-foreground">Based on {formatNumber(book.reviews)} ratings</p>
											</div>
										</div>
										<div className="inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-medium text-foreground">
											<ThumbsUp className="h-4 w-4 text-emerald-500" />
											{Math.round((book.rating / 5) * 100)}% recommend
										</div>
									</div>

									{isAuthenticated && !alreadyReviewed ? (
										<form
											onSubmit={handleSubmit((values) => reviewMutation.mutate(values))}
											className="rounded-2xl border border-border p-5"
										>
											<h3 className="mb-3 font-semibold text-foreground">Write a review</h3>
											<div className="mb-3 flex items-center gap-1">
												{[1, 2, 3, 4, 5].map((value) => (
													<button
														key={value}
														type="button"
														onClick={() => setValue("rating", value, { shouldValidate: true })}
														className="rounded p-0.5"
														aria-label={`${value} star${value === 1 ? "" : "s"}`}
													>
														<Star
															className={`h-6 w-6 transition ${
																value <= rating ? "fill-accent text-accent" : "text-muted-foreground/40"
															}`}
														/>
													</button>
												))}
											</div>
											<textarea
												{...register("body")}
												rows={3}
												placeholder="What did you think of this book?"
												className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
											/>
											{errors.body && <p className="mt-1 text-xs text-red-500">{errors.body.message}</p>}
											<div className="mt-3 flex items-center justify-between">
												<span className="text-xs text-muted-foreground">Be honest and kind.</span>
												<button
													type="submit"
													disabled={reviewMutation.isPending}
													className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
												>
													{reviewMutation.isPending ? "Publishing…" : "Publish review"}
												</button>
											</div>
										</form>
									) : isAuthenticated ? (
										<div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-700 dark:text-emerald-400">
											You have already reviewed this book. Thank you for sharing your thoughts!
										</div>
									) : (
										<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 p-5">
											<p className="text-sm text-muted-foreground">Sign in to leave a review and help other readers.</p>
											<Link
												to="/login"
												className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
											>
												Sign in
											</Link>
										</div>
									)}

									{reviews.length === 0 ? (
										<div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
											<MessageSquare className="mx-auto mb-2 h-6 w-6" />
											No reviews yet. Be the first to share your thoughts.
										</div>
									) : (
										<div className="space-y-4">
											{reviews.map((review) => (
												<div key={review.id} className="rounded-2xl border border-border bg-background p-5">
													<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
														<div className="flex items-center gap-3">
															<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
																{review.author.charAt(0).toUpperCase()}
															</div>
															<div>
																<p className="text-sm font-semibold text-foreground">{review.author}</p>
																<div className="flex">
																	{[1, 2, 3, 4, 5].map((star) => (
																		<Star
																			key={star}
																			className={`h-3.5 w-3.5 ${
																				star <= review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"
																			}`}
																		/>
																	))}
																</div>
															</div>
														</div>
														<span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
													</div>
													<p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					</motion.div>
				</div>

				<section className="mt-20">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-bold text-foreground">Similar books</h2>
						<Link
							to={`/catalog?category=${encodeURIComponent(book.category)}`}
							className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
						>
							<Bookmark className="h-4 w-4" /> More in {book.category}
						</Link>
					</div>
					<div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
						{(related.data?.books ?? [])
							.filter((item) => item.id !== book.id)
							.slice(0, 6)
							.map((item, index) => (
								<motion.div
									key={item.id}
									initial={{ opacity: 0, y: 18 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.06 }}
								>
									<BookCard {...item} />
								</motion.div>
							))}
					</div>
				</section>
			</div>
		</div>
	);
};

export default BookDetailPage;
