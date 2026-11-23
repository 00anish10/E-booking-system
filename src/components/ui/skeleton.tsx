export const Skeleton = ({ className = "" }: { className?: string }) => (
	<div className={`animate-pulse rounded-xl bg-muted/80 ${className}`} aria-hidden="true" />
);

export const BookGridSkeleton = ({ count = 8 }: { count?: number }) => (
	<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{Array.from({ length: count }).map((_, index) => (
			<div
				// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
				key={index}
				className="space-y-3"
			>
				<Skeleton className="aspect-[2/3] w-full" />
				<Skeleton className="h-4 w-4/5" />
				<Skeleton className="h-3 w-1/2" />
				<Skeleton className="h-3 w-1/3" />
			</div>
		))}
	</div>
);
