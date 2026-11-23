import { motion } from "framer-motion";
import { Award, BookOpen, Flame, ShoppingCart, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/contexts/toast-context";
import { formatCurrency } from "@/lib/format";

interface BookCardProps {
	id: string;
	title: string;
	author: string;
	cover: string;
	rating: number;
	price: number;
	category: string;
	reviews?: number;
	bestseller?: boolean;
	trending?: boolean;
	newRelease?: boolean;
}

const BookCard = ({
	id,
	title,
	author,
	cover,
	rating,
	price,
	category,
	reviews,
	bestseller,
	trending,
	newRelease,
}: BookCardProps) => {
	const { addToCart } = useCart();
	const { toast } = useToast();
	const [imageFailed, setImageFailed] = useState(false);

	const badge = bestseller
		? { label: "Bestseller", icon: Award, className: "bg-accent text-accent-foreground" }
		: trending
			? { label: "Trending", icon: Flame, className: "bg-orange-500 text-white" }
			: newRelease
				? { label: "New", icon: Sparkles, className: "bg-emerald-500 text-white" }
				: null;

	const handleAdd = async () => {
		await addToCart({ id, title, author, cover, price });
		toast({
			type: "success",
			title: "Added to cart",
			description: title,
			duration: 2200,
		});
	};

	return (
		<motion.div
			whileHover={{ y: -8 }}
			transition={{ type: "spring", stiffness: 300, damping: 24 }}
			className="group relative h-full"
		>
			<div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant transition-smooth hover:border-primary/30 hover:shadow-glow">
				<Link to={`/book/${id}`} className="block">
					<div className="relative aspect-[2/3] overflow-hidden bg-muted">
						{imageFailed ? (
							<div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 via-muted to-accent/20 p-6 text-center">
								<BookOpen className="h-10 w-10 text-primary/60" />
								<span className="font-display text-lg font-semibold text-foreground">{title}</span>
							</div>
						) : (
							<img
								src={cover}
								alt={title}
								loading="lazy"
								onError={() => setImageFailed(true)}
								className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
							/>
						)}
						<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
						{badge && (
							<span
								className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow ${badge.className}`}
							>
								<badge.icon className="h-3 w-3" />
								{badge.label}
							</span>
						)}
						<span className="absolute right-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground backdrop-blur">
							{category}
						</span>
					</div>

					<div className="space-y-1 p-4 pb-2">
						<h3 className="line-clamp-2 font-semibold leading-snug text-foreground transition group-hover:text-primary">
							{title}
						</h3>
						<p className="truncate text-sm text-muted-foreground">{author}</p>
					</div>
				</Link>

				<div className="mt-auto flex items-center justify-between gap-2 px-4 pb-4 pt-1">
					<div className="min-w-0">
						<div className="flex items-center gap-1 text-sm">
							<Star className="h-4 w-4 fill-accent text-accent" />
							<span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
							{reviews !== undefined && (
								<span className="truncate text-xs text-muted-foreground">({reviews.toLocaleString()})</span>
							)}
						</div>
						<span className="text-lg font-bold text-primary">{formatCurrency(price)}</span>
					</div>

					<button
						type="button"
						onClick={handleAdd}
						className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:scale-105 hover:opacity-90 active:scale-95"
						aria-label={`Add ${title} to cart`}
					>
						<ShoppingCart className="h-4 w-4" />
					</button>
				</div>
			</div>
		</motion.div>
	);
};

export default BookCard;
