import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	message: string;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, message: "" };

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, message: error.message };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ReadVerse crashed", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-background px-4">
					<div className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-elegant">
						<div className="mx-auto mb-6 w-fit rounded-2xl bg-red-500/10 p-4 text-red-500">
							<AlertTriangle className="h-9 w-9" />
						</div>
						<h1 className="text-2xl font-bold text-foreground">The page hit a snag</h1>
						<p className="mt-3 text-muted-foreground">{this.state.message || "An unexpected error occurred."}</p>
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
						>
							Reload ReadVerse
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
