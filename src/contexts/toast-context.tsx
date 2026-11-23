import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
	title: string;
	description?: string;
	type?: ToastType;
	duration?: number;
}

interface Toast extends ToastOptions {
	id: string;
	type: ToastType;
}

interface ToastContextValue {
	toast: (options: ToastOptions) => void;
	dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons: Record<ToastType, LucideIcon> = {
	success: CheckCircle2,
	error: AlertCircle,
	info: Info,
};

const styles: Record<ToastType, string> = {
	success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	error: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
	info: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

	const dismiss = useCallback((id: string) => {
		setToasts((current) => current.filter((item) => item.id !== id));
		const timer = timers.current.get(id);
		if (timer) {
			clearTimeout(timer);
			timers.current.delete(id);
		}
	}, []);

	const toast = useCallback(
		(options: ToastOptions) => {
			const id =
				typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
			const entry: Toast = {
				id,
				type: options.type ?? "info",
				title: options.title,
				description: options.description,
				duration: options.duration ?? 4200,
			};
			setToasts((current) => [...current.slice(-3), entry]);
			const timer = setTimeout(() => dismiss(id), entry.duration);
			timers.current.set(id, timer);
		},
		[dismiss],
	);

	const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="pointer-events-none fixed bottom-6 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
				<AnimatePresence initial={false}>
					{toasts.map((item) => {
						const Icon = icons[item.type];
						return (
							<motion.output
								key={item.id}
								layout
								initial={{ opacity: 0, x: 60, scale: 0.9 }}
								animate={{ opacity: 1, x: 0, scale: 1 }}
								exit={{ opacity: 0, x: 60, scale: 0.9 }}
								transition={{ type: "spring", stiffness: 380, damping: 30 }}
								className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-card/95 p-4 shadow-elegant backdrop-blur-xl ${styles[item.type]}`}
							>
								<Icon className="mt-0.5 h-5 w-5 shrink-0" />
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-foreground">{item.title}</p>
									{item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
								</div>
								<button
									type="button"
									onClick={() => dismiss(item.id)}
									className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
									aria-label="Dismiss notification"
								>
									<X className="h-4 w-4" />
								</button>
							</motion.output>
						);
					})}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) throw new Error("useToast must be used within ToastProvider");
	return context;
};
