import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/contexts/auth-context";
import { FullPageLoader } from "@/components/ui/spinner";

export const ProtectedRoute = () => {
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return <FullPageLoader label="Checking your session" />;
	}

	if (!isAuthenticated) {
		const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
		return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
	}

	return <Outlet />;
};
