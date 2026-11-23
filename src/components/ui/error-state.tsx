import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

export const ErrorState = ({
	title = "Something went wrong",
	message = "We could not load this content. Please try again.",
	onRetry,
}: ErrorStateProps) => (
	<div className="flex flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
		<div className="mb-4 rounded-2xl bg-red-500/10 p-4 text-red-500">
			<AlertTriangle className="h-8 w-8" />
		</div>
		<h2 className="text-xl font-bold text-foreground">{title}</h2>
		<p className="mt-2 max-w-md text-muted-foreground">{message}</p>
		{onRetry && (
			<button
				type="button"
				onClick={onRetry}
				className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
			>
				<RefreshCw className="h-4 w-4" />
				Try again
			</button>
		)}
	</div>
);
