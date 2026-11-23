import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { FullPageLoader } from "@/components/ui/spinner";
import { ProtectedRoute } from "@/components/protected-route";

const FrontendLayout = lazy(() => import("@/components/layouts/frontend-layout"));

const HomePage = lazy(() => import("@/pages/frontend-ui/home-page/home-page"));
const CatalogPage = lazy(() => import("@/pages/frontend-ui/home-page/catalog-page"));
const BookDetailPage = lazy(() => import("@/pages/frontend-ui/home-page/book-detail-page"));
const ReaderPage = lazy(() => import("@/pages/frontend-ui/home-page/reader-page"));
const LoginPage = lazy(() => import("@/pages/frontend-ui/home-page/login-page"));
const SignupPage = lazy(() => import("@/pages/frontend-ui/home-page/signup-page"));
const LibraryPage = lazy(() => import("@/pages/frontend-ui/home-page/library-page"));
const ProfilePage = lazy(() => import("@/pages/frontend-ui/home-page/profile-page"));
const CartPage = lazy(() => import("@/pages/frontend-ui/home-page/cart-page"));
const OrdersPage = lazy(() => import("@/pages/frontend-ui/home-page/orders-page"));
const NotFoundPage = lazy(() => import("@/pages/frontend-ui/home-page/not-found-page"));
const DashboardPage = lazy(() => import("@/pages/backend-ui/dashboard-page"));

const Application = () => {
	const location = useLocation();

	return (
		<AnimatePresence mode="wait">
			<Suspense fallback={<FullPageLoader />}>
				<Routes location={location} key={location.pathname}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/reader/:bookId" element={<ReaderPage />} />

					<Route path="/" element={<FrontendLayout />}>
						<Route index element={<HomePage />} />
						<Route path="catalog" element={<CatalogPage />} />
						<Route path="book/:bookId" element={<BookDetailPage />} />
						<Route path="cart" element={<CartPage />} />
						<Route element={<ProtectedRoute />}>
							<Route path="library" element={<LibraryPage />} />
							<Route path="profile" element={<ProfilePage />} />
							<Route path="orders" element={<OrdersPage />} />
							<Route path="dashboard" element={<DashboardPage />} />
						</Route>
						<Route path="*" element={<NotFoundPage />} />
					</Route>
				</Routes>
			</Suspense>
		</AnimatePresence>
	);
};

export default Application;
