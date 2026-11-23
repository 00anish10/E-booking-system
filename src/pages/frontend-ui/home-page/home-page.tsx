import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, Clock, Globe2, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import BookCard from "@/components/book-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { BookGridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useBooks, useStoreStats } from "@/hooks/use-books";
import { useDocumentTitle } from "@/hooks/use-document-title";

const fadeUp = {
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: "-60px" },
};

const HomePage = () => {
	useDocumentTitle("Discover your next great read");

	const trending = useBooks({ tag: "trending", limit: 6 });
	const bestsellers = useBooks({ tag: "bestseller", limit: 4 });
	const newReleases = useBooks({ tag: "new", limit: 4 });
	const stats = useStoreStats();

	const heroBooks = (trending.data?.books ?? []).slice(0, 3);

	return (
		<div className="min-h-screen">
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-[hsl(230,50%,18%)] via-[hsl(240,45%,24%)] to-[hsl(268,45%,32%)]" />
				<div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,hsl(35_90%_65%_/_0.5),transparent_45%),radial-gradient(circle_at_80%_30%,hsl(265_70%_60%_/_0.5),transparent_45%)]" />
				<motion.div
					className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl"
					animate={{ y: [0, 30, 0], scale: [1, 1.15, 1] }}
					transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY }}
				/>

				<div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
					<div className="grid items-center gap-14 lg:grid-cols-2">
						<motion.div
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-7"
						>
							<motion.span
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.1 }}
								className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur"
							>
								<Sparkles className="h-4 w-4 text-accent" />A handpicked shelf for every mood.
							</motion.span>

							<h1 className="text-balance text-4xl font-bold leading-[1.05] text-white md:text-5xl lg:text-6xl">
								Discover your next{" "}
								<span className="bg-gradient-to-r from-accent via-pink-300 to-purple-300 bg-clip-text text-transparent">
									great read
								</span>
							</h1>
							<p className="max-w-xl text-lg text-white/75">
								Explore bestsellers, timeless classics, and fresh releases. Preview any book for free, then build a library that
								travels with you.
							</p>

							<div className="flex flex-wrap gap-4">
								<Link
									to="/catalog"
									className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-accent-foreground shadow-lg transition hover:scale-[1.02] hover:shadow-glow"
								>
									Browse catalog
									<ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
								</Link>
								<Link
									to="/signup"
									className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
								>
									Start reading free
								</Link>
							</div>

							<div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-white/70">
								<span className="inline-flex items-center gap-2">
									<Star className="h-4 w-4 fill-accent text-accent" />
									Loved by early readers
								</span>
								<span className="inline-flex items-center gap-2">
									<Globe2 className="h-4 w-4 text-accent" />
									Read on any device
								</span>
							</div>
						</motion.div>

						<div className="relative hidden h-[420px] lg:block">
							{heroBooks.map((book, index) => (
								<motion.div
									key={book.id}
									initial={{ opacity: 0, y: 60, rotate: 0 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 + index * 0.15, duration: 0.6 }}
									className="absolute"
									style={{
										left: `${index * 30}%`,
										top: `${index === 1 ? 0 : 12}%`,
										zIndex: 3 - index,
									}}
								>
									<motion.div
										animate={{ y: [0, index % 2 === 0 ? -14 : 12, 0] }}
										transition={{
											duration: 6 + index,
											repeat: Number.POSITIVE_INFINITY,
											ease: "easeInOut",
										}}
										className="w-48 overflow-hidden rounded-2xl border border-white/20 shadow-2xl"
										style={{ rotate: `${index * 5 - 5}deg` }}
									>
										<img src={book.cover} alt={book.title} className="aspect-[2/3] w-full object-cover" />
									</motion.div>
								</motion.div>
							))}

							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.7 }}
								className="absolute bottom-0 left-0 z-10 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/90 p-4 shadow-xl backdrop-blur"
							>
								<div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-600">
									<TrendingUp className="h-5 w-5" />
								</div>
								<div>
									<p className="text-sm font-bold text-slate-900">+18% this week</p>
									<p className="text-xs text-slate-500">Reading activity</p>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</section>

			<section className="border-b border-border bg-card/50 py-10 backdrop-blur">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{[
							{ icon: BookOpen, label: "Books", value: stats.data?.books ?? 20, suffix: "" },
							{ icon: Award, label: "Authors", value: stats.data?.authors ?? 20, suffix: "" },
							{ icon: Star, label: "Reviews", value: stats.data?.reviews ?? 100000, suffix: "+" },
							{ icon: Clock, label: "Reading access", value: 24, suffix: "/7" },
						].map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.08 }}
								className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
							>
								<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
									<stat.icon className="h-5 w-5" />
								</div>
								<div>
									<div className="text-xl font-bold text-foreground">
										<AnimatedNumber value={stat.value} suffix={stat.suffix} />
									</div>
									<div className="text-xs text-muted-foreground">{stat.label}</div>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section className="py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 flex items-end justify-between gap-4">
						<div>
							<div className="mb-2 flex items-center gap-2 text-accent">
								<TrendingUp className="h-5 w-5" />
								<span className="text-sm font-semibold uppercase tracking-wider">Hot right now</span>
							</div>
							<h2 className="text-3xl font-bold text-foreground md:text-4xl">Trending this week</h2>
							<p className="mt-2 text-muted-foreground">The books everyone is talking about.</p>
						</div>
						<Link
							to="/catalog"
							className="hidden items-center gap-2 font-semibold text-primary transition hover:gap-3 sm:flex"
						>
							View all <ArrowRight className="h-5 w-5" />
						</Link>
					</div>

					{trending.isLoading ? (
						<BookGridSkeleton count={6} />
					) : trending.isError ? (
						<ErrorState onRetry={() => trending.refetch()} />
					) : (
						<div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
							{(trending.data?.books ?? []).map((book, index) => (
								<motion.div key={book.id} {...fadeUp} transition={{ delay: Math.min(index * 0.07, 0.4) }}>
									<BookCard {...book} />
								</motion.div>
							))}
						</div>
					)}
				</div>
			</section>

			<section className="relative overflow-hidden border-y border-border bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/10 py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 flex items-end justify-between gap-4">
						<div>
							<div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
								<Zap className="h-5 w-5" />
								<span className="text-sm font-semibold uppercase tracking-wider">Fresh off the press</span>
							</div>
							<h2 className="text-3xl font-bold text-foreground md:text-4xl">New releases</h2>
							<p className="mt-2 text-muted-foreground">Handpicked additions to the ReadVerse shelves.</p>
						</div>
						<Link
							to="/catalog"
							className="hidden items-center gap-2 font-semibold text-primary transition hover:gap-3 sm:flex"
						>
							See more <ArrowRight className="h-5 w-5" />
						</Link>
					</div>

					{newReleases.isLoading ? (
						<BookGridSkeleton count={4} />
					) : newReleases.isError ? (
						<ErrorState onRetry={() => newReleases.refetch()} />
					) : (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{(newReleases.data?.books ?? []).map((book, index) => (
								<motion.div key={book.id} {...fadeUp} transition={{ delay: index * 0.08 }}>
									<BookCard {...book} />
								</motion.div>
							))}
						</div>
					)}
				</div>
			</section>

			<section className="py-20">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10">
						<div className="mb-2 flex items-center gap-2 text-primary">
							<Award className="h-5 w-5" />
							<span className="text-sm font-semibold uppercase tracking-wider">Reader favorites</span>
						</div>
						<h2 className="text-3xl font-bold text-foreground md:text-4xl">Bestsellers</h2>
						<p className="mt-2 text-muted-foreground">The most loved books in our collection.</p>
					</div>

					{bestsellers.isLoading ? (
						<BookGridSkeleton count={4} />
					) : bestsellers.isError ? (
						<ErrorState onRetry={() => bestsellers.refetch()} />
					) : (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{(bestsellers.data?.books ?? []).map((book, index) => (
								<motion.div key={book.id} {...fadeUp} transition={{ delay: index * 0.08 }}>
									<BookCard {...book} />
								</motion.div>
							))}
						</div>
					)}
				</div>
			</section>

			<section className="pb-20">
				<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
					<motion.div
						{...fadeUp}
						className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(230,50%,18%)] via-[hsl(250,45%,26%)] to-[hsl(280,45%,34%)] p-10 text-center text-white shadow-2xl md:p-14"
					>
						<div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_15%_20%,hsl(35_90%_65%_/_0.4),transparent_40%),radial-gradient(circle_at_85%_80%,hsl(190_80%_60%_/_0.35),transparent_40%)]" />
						<div className="relative space-y-5">
							<h2 className="text-3xl font-bold md:text-4xl">Your next chapter starts today</h2>
							<p className="mx-auto max-w-2xl text-white/75">
								Join thousands of readers building their personal libraries. Free to start, instant access, and beautifully
								simple reading.
							</p>
							<div className="flex flex-wrap justify-center gap-3 pt-2">
								<Link
									to="/signup"
									className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 font-semibold text-accent-foreground transition hover:scale-[1.02] hover:shadow-glow"
								>
									Create free account <ArrowRight className="h-5 w-5" />
								</Link>
								<Link
									to="/catalog"
									className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
								>
									Explore books
								</Link>
							</div>
							{stats.isLoading && <Skeleton className="mx-auto mt-2 h-3 w-40 bg-white/20" />}
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
