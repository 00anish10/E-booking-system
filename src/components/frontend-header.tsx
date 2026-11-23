import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
	BookOpen,
	ChevronDown,
	LayoutDashboard,
	Library,
	LogOut,
	Menu as MenuIcon,
	Moon,
	Package,
	Search,
	ShoppingCart,
	Sun,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import SearchModal from "@/components/search_modal";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";

const navLinks = [
	{ path: "/", label: "Home" },
	{ path: "/catalog", label: "Catalog" },
	{ path: "/library", label: "My Library" },
];

const FrontendHeader = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, isAuthenticated, logout } = useAuth();
	const { getItemCount } = useCart();
	const { theme, toggleTheme } = useTheme();
	const { toast } = useToast();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const cartCount = getItemCount();

	const isActive = (path: string) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setIsSearchOpen((open) => !open);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	useEffect(() => {
		if (location.pathname) setMobileMenuOpen(false);
	}, [location.pathname]);

	const handleLogout = () => {
		logout();
		toast({ type: "success", title: "Signed out", description: "See you soon!" });
		navigate("/");
	};

	const initials = user?.name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<>
			<nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
				<div className="mx-auto max-w-7xl px-4 sm:px-6">
					<div className="flex h-20 items-center justify-between gap-4">
						<Link to="/" className="group flex items-center gap-3">
							<div className="rounded-xl bg-primary p-3 transition-all duration-300 group-hover:shadow-glow">
								<BookOpen className="h-6 w-6 text-primary-foreground" />
							</div>
							<span className="text-2xl font-extrabold tracking-tight text-foreground">ReadVerse</span>
						</Link>

						<div className="hidden items-center gap-9 md:flex">
							{navLinks.map((link) => (
								<div key={link.path} className="relative">
									<Link
										to={link.path}
										className={`text-sm font-semibold tracking-wide transition ${
											isActive(link.path) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
										}`}
									>
										{link.label}
									</Link>
									{isActive(link.path) && (
										<motion.div
											layoutId="activeLink"
											className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full bg-primary"
											transition={{ type: "spring", stiffness: 400, damping: 30 }}
										/>
									)}
								</div>
							))}
						</div>

						<div className="hidden items-center gap-2 md:flex">
							<button
								type="button"
								onClick={() => setIsSearchOpen(true)}
								className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
								aria-label="Search books"
							>
								<Search className="h-5 w-5" />
								<kbd className="hidden rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium lg:inline">
									⌘K
								</kbd>
							</button>

							<button
								type="button"
								onClick={toggleTheme}
								className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
								aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
							>
								{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
							</button>

							<Link
								to="/cart"
								className="relative rounded-xl p-2.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
								aria-label={`Cart with ${cartCount} items`}
							>
								<ShoppingCart className="h-5 w-5" />
								<AnimatePresence>
									{cartCount > 0 && (
										<motion.span
											key={cartCount}
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
											transition={{ type: "spring", stiffness: 500, damping: 20 }}
											className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground"
										>
											{cartCount}
										</motion.span>
									)}
								</AnimatePresence>
							</Link>

							{isAuthenticated && user ? (
								<Menu as="div" className="relative">
									<MenuButton className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-muted">
										{user.avatarUrl ? (
											<img
												src={user.avatarUrl}
												alt={user.name}
												className="h-9 w-9 rounded-full border border-border object-cover"
											/>
										) : (
											<span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
												{initials}
											</span>
										)}
										<ChevronDown className="h-4 w-4 text-muted-foreground" />
									</MenuButton>
									<MenuItems
										transition
										anchor="bottom end"
										className="z-50 mt-2 w-56 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-elegant transition data-[closed]:scale-95 data-[closed]:opacity-0"
									>
										<div className="px-3 py-2">
											<p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
											<p className="truncate text-xs text-muted-foreground">{user.email}</p>
										</div>
										<MenuItem>
											<Link
												to="/profile"
												className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition data-[focus]:bg-muted"
											>
												<User className="h-4 w-4" /> Profile
											</Link>
										</MenuItem>
										<MenuItem>
											<Link
												to="/library"
												className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition data-[focus]:bg-muted"
											>
												<Library className="h-4 w-4" /> My Library
											</Link>
										</MenuItem>
										<MenuItem>
											<Link
												to="/orders"
												className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition data-[focus]:bg-muted"
											>
												<Package className="h-4 w-4" /> Orders
											</Link>
										</MenuItem>
										<MenuItem>
											<Link
												to="/dashboard"
												className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition data-[focus]:bg-muted"
											>
												<LayoutDashboard className="h-4 w-4" /> Dashboard
											</Link>
										</MenuItem>
										<MenuItem>
											<button
												type="button"
												onClick={handleLogout}
												className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition data-[focus]:bg-red-500/10"
											>
												<LogOut className="h-4 w-4" /> Sign out
											</button>
										</MenuItem>
									</MenuItems>
								</Menu>
							) : (
								<>
									<Link
										to="/login"
										className="rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
									>
										Sign In
									</Link>
									<Link
										to="/signup"
										className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
									>
										Get Started
									</Link>
								</>
							)}
						</div>

						<div className="flex items-center gap-1 md:hidden">
							<button
								type="button"
								onClick={toggleTheme}
								className="rounded-lg p-2 text-muted-foreground"
								aria-label="Toggle theme"
							>
								{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
							</button>
							<button
								type="button"
								onClick={() => setIsSearchOpen(true)}
								className="rounded-lg p-2 text-muted-foreground"
								aria-label="Search books"
							>
								<Search className="h-5 w-5" />
							</button>
							<button
								type="button"
								onClick={() => setMobileMenuOpen((open) => !open)}
								className="rounded-lg p-2 text-foreground"
								aria-label="Toggle menu"
							>
								{mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
							</button>
						</div>
					</div>
				</div>

				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="overflow-hidden border-t border-border bg-background md:hidden"
						>
							<div className="space-y-1 px-4 py-4">
								{navLinks.map((link) => (
									<Link
										key={link.path}
										to={link.path}
										className="block rounded-xl px-4 py-3 font-semibold text-foreground transition hover:bg-muted"
									>
										{link.label}
									</Link>
								))}
								<Link
									to="/cart"
									className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-foreground transition hover:bg-muted"
								>
									<ShoppingCart className="h-5 w-5" /> Cart ({cartCount})
								</Link>
								{isAuthenticated ? (
									<>
										<Link
											to="/profile"
											className="block rounded-xl px-4 py-3 font-semibold text-foreground transition hover:bg-muted"
										>
											Profile
										</Link>
										<Link
											to="/orders"
											className="block rounded-xl px-4 py-3 font-semibold text-foreground transition hover:bg-muted"
										>
											Orders
										</Link>
										<button
											type="button"
											onClick={handleLogout}
											className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left font-semibold text-red-500 transition hover:bg-red-500/10"
										>
											<LogOut className="h-5 w-5" /> Sign out
										</button>
									</>
								) : (
									<div className="grid gap-2 pt-2">
										<Link
											to="/login"
											className="rounded-xl border border-border px-4 py-3 text-center font-semibold text-foreground"
										>
											Sign In
										</Link>
										<Link
											to="/signup"
											className="rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground"
										>
											Create account
										</Link>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>

			<SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
		</>
	);
};

export default FrontendHeader;
