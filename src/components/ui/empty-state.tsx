import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
	<motion.div
		initial={{ opacity: 0, y: 12 }}
		animate={{ opacity: 1, y: 0 }}
		className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center"
	>
		<div className="relative mb-6">
			<div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl" />
			<div className="relative rounded-2xl bg-muted p-5 text-primary">
				<Icon className="h-9 w-9" />
			</div>
		</div>
		<h2 className="text-2xl font-bold text-foreground">{title}</h2>
		<p className="mt-2 max-w-md text-muted-foreground">{description}</p>
		{action && <div className="mt-8">{action}</div>}
	</motion.div>
);
