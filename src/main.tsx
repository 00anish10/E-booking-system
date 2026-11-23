import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Application from "./application";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { ToastProvider } from "@/contexts/toast-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { queryClient } from "@/lib/query-client";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<ErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider>
						<ToastProvider>
							<AuthProvider>
								<CartProvider>
									<BrowserRouter>
										<div data-testid="main-container" className="main-container">
											<Application />
										</div>
									</BrowserRouter>
								</CartProvider>
							</AuthProvider>
						</ToastProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</ErrorBoundary>
		</StrictMode>,
	);
} else {
	console.error("Root element not found");
}
