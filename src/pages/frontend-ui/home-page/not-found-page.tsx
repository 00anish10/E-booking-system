import { motion } from "framer-motion";
import { BookOpen, Compass, Home } from "lucide-react";
import { Link } from "react-router";
import { useDocumentTitle } from "@/hooks/use-document-title";

const NotFoundPage = () => {
	useDocumentTitle("Page not found");

	return (
		<div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
			<div className="text-center">
				<motion.div
					initial={{ opacity: 0, rotate: -8, y: 20 }}
					animate={{ opacity: 1, rotate: 0, y: 0 }}
					transition={{ type: "spring", stiffness: 200, damping: 18 }}
					className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary via-purple-500 to-accent text-white shadow-elegant"
				>
					<BookOpen className="h-14 w-14" />
				</motion.div>

				<p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Error 404</p>
				<h1 className="mt-3 text-5xl font-bold text-foreground">This page is off the shelf</h1>
				<p className="mx-auto mt-4 max-w-md text-muted-foreground">
					The page you are looking for may have been moved, renamed, or never existed. Let's get you back to the stories.
				</p>

				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:scale-[1.02] hover:opacity-90"
					>
						<Home className="h-4 w-4" /> Back home
					</Link>
					<Link
						to="/catalog"
						className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:bg-muted"
					>
						<Compass className="h-4 w-4" /> Explore catalog
					</Link>
				</div>
			</div>
		</div>
	);
};

export default NotFoundPage;
