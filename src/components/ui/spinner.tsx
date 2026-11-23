import { Loader2 } from "lucide-react";

export const Spinner = ({ className = "h-6 w-6" }: { className?: string }) => (
	<Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export const FullPageLoader = ({ label = "Loading ReadVerse" }: { label?: string }) => (
	<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-muted-foreground">
		<div className="relative flex h-16 w-16 items-center justify-center">
			<div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
			<div className="relative rounded-2xl bg-primary p-4 text-primary-foreground shadow-elegant">
				<Spinner className="h-6 w-6" />
			</div>
		</div>
		<p className="text-sm font-medium">{label}…</p>
	</div>
);
