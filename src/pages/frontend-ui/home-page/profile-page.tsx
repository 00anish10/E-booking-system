import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	BookOpen,
	CheckCircle2,
	CreditCard,
	LogOut,
	Mail,
	Package,
	Settings2,
	ShieldCheck,
	Sparkles,
	User,
} from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import * as yup from "yup";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useLibrary, useOrders } from "@/hooks/use-library";
import { api, getErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { User as UserType } from "@/lib/types";

const profileSchema = yup.object({
	name: yup.string().trim().min(2, "Name must be at least 2 characters").max(80).required("Name is required"),
	avatarUrl: yup
		.string()
		.trim()
		.default("")
		.test("is-url", "Enter a valid image URL", (value) => (!value ? true : /^https?:\/\/.+/i.test(value))),
});

const passwordSchema = yup.object({
	currentPassword: yup.string().required("Current password is required"),
	newPassword: yup
		.string()
		.min(8, "Use at least 8 characters")
		.matches(/[A-Z]/, "Include an uppercase letter")
		.matches(/[0-9]/, "Include a number")
		.required("New password is required"),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref("newPassword")], "Passwords do not match")
		.required("Confirm your new password"),
});

type ProfileForm = yup.InferType<typeof profileSchema>;
type PasswordForm = yup.InferType<typeof passwordSchema>;

const ProfilePage = () => {
	useDocumentTitle("Profile");
	const { user, setUser, logout } = useAuth();
	const { toast } = useToast();
	const navigate = useNavigate();
	const library = useLibrary();
	const orders = useOrders();
	const [tab, setTab] = useState<"overview" | "settings">("overview");
	const nameId = useId();
	const avatarId = useId();
	const currentPasswordId = useId();
	const newPasswordId = useId();
	const confirmNewPasswordId = useId();
	const [fontSize, setFontSize] = useState(() => localStorage.getItem("reader-font") ?? "18");
	const [notifications, setNotifications] = useState({
		releases: true,
		reminders: true,
	});

	const profileForm = useForm<ProfileForm>({
		resolver: yupResolver(profileSchema),
		values: {
			name: user?.name ?? "",
			avatarUrl: user?.avatarUrl ?? "",
		},
	});

	const passwordForm = useForm<PasswordForm>({
		resolver: yupResolver(passwordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const updateProfile = useMutation({
		mutationFn: async (values: ProfileForm) => {
			const { data } = await api.patch<{ user: UserType }>("/profile", {
				name: values.name,
				avatarUrl: values.avatarUrl || null,
			});
			return data.user;
		},
		onSuccess: (nextUser) => {
			setUser(nextUser);
			toast({ type: "success", title: "Profile updated" });
		},
		onError: (error) => {
			toast({
				type: "error",
				title: "Could not update profile",
				description: getErrorMessage(error),
			});
		},
	});

	const changePassword = useMutation({
		mutationFn: async (values: PasswordForm) => {
			await api.patch("/profile/password", {
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
		},
		onSuccess: () => {
			toast({
				type: "success",
				title: "Password updated",
				description: "Use your new password next time you sign in.",
			});
			passwordForm.reset();
		},
		onError: (error) => {
			toast({
				type: "error",
				title: "Could not change password",
				description: getErrorMessage(error),
			});
		},
	});

	const handleLogout = () => {
		logout();
		toast({ type: "success", title: "Signed out", description: "See you soon!" });
		navigate("/");
	};

	const initials = (user?.name ?? "R")
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const stats = library.data?.stats;
	const latestOrders = (orders.data ?? []).slice(0, 3);

	const handleFontChange = (value: string) => {
		setFontSize(value);
		localStorage.setItem("reader-font", value);
		toast({ type: "success", title: "Reading preference saved" });
	};

	return (
		<div className="min-h-screen pb-16 pt-10">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
					<h1 className="text-4xl font-bold text-foreground">Your profile</h1>
					<p className="mt-2 text-muted-foreground">Manage your account, reading preferences, and security.</p>
				</motion.div>

				<div className="mb-8 flex gap-2 border-b border-border">
					{(
						[
							{ id: "overview", label: "Overview", icon: User },
							{ id: "settings", label: "Settings", icon: Settings2 },
						] as const
					).map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => setTab(item.id)}
							className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
								tab === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
							}`}
						>
							<item.icon className="h-4 w-4" />
							{item.label}
							{tab === item.id && (
								<motion.div layoutId="profileTab" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
							)}
						</button>
					))}
				</div>

				{tab === "overview" ? (
					<div className="space-y-8">
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							className="rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8"
						>
							<div className="flex flex-col items-center gap-6 sm:flex-row">
								{user?.avatarUrl ? (
									<img
										src={user.avatarUrl}
										alt={user.name}
										className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-lg"
									/>
								) : (
									<div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary via-purple-500 to-accent text-2xl font-bold text-white shadow-lg">
										{initials}
									</div>
								)}
								<div className="flex-1 text-center sm:text-left">
									<h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
									<div className="mt-2 flex flex-col items-center gap-1.5 text-sm text-muted-foreground sm:flex-row sm:gap-5">
										<span className="inline-flex items-center gap-1.5">
											<Mail className="h-4 w-4" /> {user?.email}
										</span>
										<span className="inline-flex items-center gap-1.5">
											<Sparkles className="h-4 w-4" />
											Member since {user ? formatDate(user.memberSince) : "—"}
										</span>
									</div>
								</div>
								<button
									type="button"
									onClick={() => setTab("settings")}
									className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
								>
									Edit profile
								</button>
							</div>
						</motion.div>

						<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
							{[
								{
									icon: BookOpen,
									label: "Books owned",
									value: stats?.owned ?? 0,
									accent: "bg-primary/10 text-primary",
								},
								{
									icon: CheckCircle2,
									label: "Completed",
									value: stats?.completed ?? 0,
									accent: "bg-emerald-500/10 text-emerald-500",
								},
								{
									icon: CreditCard,
									label: "Orders",
									value: orders.data?.length ?? 0,
									accent: "bg-accent/20 text-amber-600 dark:text-accent",
								},
								{
									icon: Package,
									label: "Avg. progress",
									value: `${stats?.averageProgress ?? 0}%`,
									accent: "bg-sky-500/10 text-sky-500",
								},
							].map((stat, index) => (
								<motion.div
									key={stat.label}
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className="rounded-2xl border border-border bg-card p-5"
								>
									<div className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.accent}`}>
										<stat.icon className="h-5 w-5" />
									</div>
									<div className="text-2xl font-bold text-foreground">{stat.value}</div>
									<div className="text-sm text-muted-foreground">{stat.label}</div>
								</motion.div>
							))}
						</div>

						<div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
							<div className="mb-5 flex items-center justify-between">
								<h2 className="text-xl font-bold text-foreground">Recent orders</h2>
								<Link to="/orders" className="text-sm font-semibold text-primary hover:underline">
									View all
								</Link>
							</div>
							{latestOrders.length === 0 ? (
								<p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
									No orders yet. Your first purchase will show up here.
								</p>
							) : (
								<div className="space-y-3">
									{latestOrders.map((order) => (
										<div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4">
											<div>
												<p className="text-sm font-semibold text-foreground">
													{order.items.length} book
													{order.items.length === 1 ? "" : "s"}
												</p>
												<p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
											</div>
											<div className="flex items-center gap-3">
												<span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium capitalize text-emerald-600 dark:text-emerald-400">
													{order.status}
												</span>
												<span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="space-y-8">
						<form
							onSubmit={profileForm.handleSubmit((values) => updateProfile.mutate(values))}
							className="rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8"
						>
							<h2 className="mb-5 text-xl font-bold text-foreground">Account details</h2>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label htmlFor={nameId} className="mb-1.5 block text-sm font-medium text-foreground">
										Full name
									</label>
									<input
										id={nameId}
										{...profileForm.register("name")}
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									{profileForm.formState.errors.name && (
										<p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
									)}
								</div>
								<div>
									<label htmlFor={avatarId} className="mb-1.5 block text-sm font-medium text-foreground">
										Avatar URL
									</label>
									<input
										id={avatarId}
										{...profileForm.register("avatarUrl")}
										placeholder="https://…"
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									{profileForm.formState.errors.avatarUrl && (
										<p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.avatarUrl.message}</p>
									)}
								</div>
							</div>
							<div className="mt-5 flex justify-end">
								<button
									type="submit"
									disabled={updateProfile.isPending}
									className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
								>
									{updateProfile.isPending && <Spinner className="h-4 w-4" />}
									Save changes
								</button>
							</div>
						</form>

						<div className="rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8">
							<h2 className="mb-5 text-xl font-bold text-foreground">Reading preferences</h2>
							<div className="space-y-5">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p className="font-medium text-foreground">Default font size</p>
										<p className="text-sm text-muted-foreground">Applies to the book reader</p>
									</div>
									<select
										value={fontSize}
										onChange={(event) => handleFontChange(event.target.value)}
										className="rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									>
										<option value="16">Small</option>
										<option value="18">Medium</option>
										<option value="22">Large</option>
										<option value="26">Extra large</option>
									</select>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
									<div>
										<p className="font-medium text-foreground">New release alerts</p>
										<p className="text-sm text-muted-foreground">Hear about fresh books in your favorite genres</p>
									</div>
									<button
										type="button"
										onClick={() =>
											setNotifications((current) => ({
												...current,
												releases: !current.releases,
											}))
										}
										className={`relative h-7 w-12 rounded-full transition ${notifications.releases ? "bg-primary" : "bg-muted"}`}
										aria-pressed={notifications.releases}
										aria-label="Toggle new release alerts"
									>
										<span
											className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
												notifications.releases ? "left-6" : "left-1"
											}`}
										/>
									</button>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
									<div>
										<p className="font-medium text-foreground">Reading reminders</p>
										<p className="text-sm text-muted-foreground">A gentle nudge to keep your streak going</p>
									</div>
									<button
										type="button"
										onClick={() =>
											setNotifications((current) => ({
												...current,
												reminders: !current.reminders,
											}))
										}
										className={`relative h-7 w-12 rounded-full transition ${notifications.reminders ? "bg-primary" : "bg-muted"}`}
										aria-pressed={notifications.reminders}
										aria-label="Toggle reading reminders"
									>
										<span
											className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
												notifications.reminders ? "left-6" : "left-1"
											}`}
										/>
									</button>
								</div>
							</div>
						</div>

						<form
							onSubmit={passwordForm.handleSubmit((values) => changePassword.mutate(values))}
							className="rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8"
						>
							<div className="mb-5 flex items-center gap-2">
								<ShieldCheck className="h-5 w-5 text-primary" />
								<h2 className="text-xl font-bold text-foreground">Change password</h2>
							</div>
							<div className="grid gap-4 sm:grid-cols-3">
								<div>
									<label htmlFor={currentPasswordId} className="mb-1.5 block text-sm font-medium text-foreground">
										Current password
									</label>
									<input
										id={currentPasswordId}
										type="password"
										autoComplete="current-password"
										{...passwordForm.register("currentPassword")}
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									{passwordForm.formState.errors.currentPassword && (
										<p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
									)}
								</div>
								<div>
									<label htmlFor={newPasswordId} className="mb-1.5 block text-sm font-medium text-foreground">
										New password
									</label>
									<input
										id={newPasswordId}
										type="password"
										autoComplete="new-password"
										{...passwordForm.register("newPassword")}
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									{passwordForm.formState.errors.newPassword && (
										<p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
									)}
								</div>
								<div>
									<label htmlFor={confirmNewPasswordId} className="mb-1.5 block text-sm font-medium text-foreground">
										Confirm password
									</label>
									<input
										id={confirmNewPasswordId}
										type="password"
										autoComplete="new-password"
										{...passwordForm.register("confirmPassword")}
										className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
									/>
									{passwordForm.formState.errors.confirmPassword && (
										<p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
									)}
								</div>
							</div>
							<div className="mt-5 flex justify-end">
								<button
									type="submit"
									disabled={changePassword.isPending}
									className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
								>
									{changePassword.isPending && <Spinner className="h-4 w-4" />}
									Update password
								</button>
							</div>
						</form>

						<button
							type="button"
							onClick={handleLogout}
							className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-3 font-semibold text-red-500 transition hover:bg-red-500/10"
						>
							<LogOut className="h-4 w-4" /> Sign out of ReadVerse
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
