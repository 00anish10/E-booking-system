import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

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

// Loading UI
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const Application = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingSpinner />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reader/:bookId" element={<ReaderPage />} />
          
          <Route path="/" element={<FrontendLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="book/:bookId" element={<BookDetailPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default Application;