import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation, useOutlet } from "react-router";
import FrontendFooter from "@/components/frontend-footer";
import FrontendHeader from "@/components/frontend-header";
import { AnimatedBackground } from "@/components/animated-background";
import { ScrollProgress } from "@/components/scroll-progress";

const ScrollToTop = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		if (pathname) window.scrollTo({ top: 0, behavior: "smooth" });
	}, [pathname]);

	return null;
};

const FrontendLayout = () => {
	const location = useLocation();
	const outlet = useOutlet();

	return (
		<div className="relative flex min-h-screen flex-col">
			<AnimatedBackground />
			<ScrollProgress />
			<ScrollToTop />
			<FrontendHeader />
			<main className="flex-1">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={location.pathname}
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -8 }}
						transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
					>
						{outlet}
					</motion.div>
				</AnimatePresence>
			</main>
			<FrontendFooter />
		</div>
	);
};

export default FrontendLayout;
