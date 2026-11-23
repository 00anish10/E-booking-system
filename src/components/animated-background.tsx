import { motion, useReducedMotion } from "framer-motion";

export const AnimatedBackground = () => {
	const reduceMotion = useReducedMotion();

	return (
		<div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			<div className="absolute inset-0 bg-background" />
			<motion.div
				className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-3xl"
				animate={reduceMotion ? undefined : { x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
				transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-accent/20 blur-3xl"
				animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
				transition={{ duration: 26, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			/>
			<motion.div
				className="absolute bottom-[-12rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-pink-400/10 blur-3xl"
				animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.12, 1] }}
				transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			/>
		</div>
	);
};
