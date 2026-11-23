import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import * as yup from "yup";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api";

const schema = yup.object({
	email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
	password: yup.string().min(1, "Password is required").required(),
});

type FormValues = yup.InferType<typeof schema>;

const LoginPage = () => {
	useDocumentTitle("Sign in");
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get("returnTo") || "/";
	const { login, isAuthenticated } = useAuth();
	const { toast } = useToast();
	const [showPassword, setShowPassword] = useState(false);
	const emailId = useId();
	const passwordId = useId();
	const [demoLoading, setDemoLoading] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: { email: "", password: "" },
	});

	useEffect(() => {
		if (isAuthenticated) navigate(returnTo, { replace: true });
	}, [isAuthenticated, navigate, returnTo]);

	const onSubmit = async (values: FormValues) => {
		try {
			const user = await login(values.email, values.password);
			toast({
				type: "success",
				title: `Welcome back, ${user.name.split(" ")[0]}!`,
				description: "Your library is ready.",
			});
			navigate(returnTo, { replace: true });
		} catch (error) {
			toast({
				type: "error",
				title: "Could not sign in",
				description: getErrorMessage(error),
			});
		}
	};

	const handleDemo = async () => {
		setDemoLoading(true);
		setValue("email", "demo@readverse.dev");
		setValue("password", "password123");
		try {
			const user = await login("demo@readverse.dev", "password123");
			toast({
				type: "success",
				title: `Welcome, ${user.name.split(" ")[0]}!`,
				description: "You are exploring the demo account.",
			});
			navigate("/library", { replace: true });
		} catch (error) {
			toast({
				type: "error",
				title: "Demo sign in failed",
				description: getErrorMessage(error),
			});
		} finally {
			setDemoLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(230,50%,16%)] via-[hsl(250,45%,22%)] to-[hsl(280,45%,30%)] px-4 py-12">
			<motion.div
				className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
				animate={{ y: [0, 40, 0], scale: [1, 1.15, 1] }}
				transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY }}
			/>
			<motion.div
				className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl"
				animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
				transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
			/>

			<div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
				<div className="hidden flex-col justify-between p-10 text-white lg:flex">
					<Link to="/" className="flex items-center gap-2">
						<div className="rounded-xl bg-white/10 p-2.5">
							<BookOpen className="h-6 w-6 text-accent" />
						</div>
						<span className="text-xl font-bold">ReadVerse</span>
					</Link>

					<div className="space-y-5">
						<Sparkles className="h-8 w-8 text-accent" />
						<h2 className="text-3xl font-bold leading-tight">
							A whole library,
							<br /> in your pocket.
						</h2>
						<p className="text-white/70">
							Pick up exactly where you left off. Your books, progress, and wishlist sync across every device.
						</p>
						<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">★</div>
							<p className="text-sm text-white/80">
								“ReadVerse made me fall in love with reading again.”
								<span className="mt-1 block text-white/50">— A happy reader</span>
							</p>
						</div>
					</div>

					<p className="text-xs text-white/40">Secure sign in · Fastify + PostgreSQL</p>
				</div>

				<div className="bg-card/95 p-8 sm:p-10">
					<Link to="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
						<div className="rounded-lg bg-primary p-2">
							<BookOpen className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold text-foreground">ReadVerse</span>
					</Link>

					<div className="mb-8 text-center">
						<h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
						<p className="mt-2 text-muted-foreground">Sign in to continue reading</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div>
							<label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-foreground">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<input
									id={emailId}
									type="email"
									autoComplete="email"
									{...register("email")}
									placeholder="you@example.com"
									className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							{errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
						</div>

						<div>
							<div className="mb-1.5 flex items-center justify-between">
								<label htmlFor={passwordId} className="block text-sm font-medium text-foreground">
									Password
								</label>
								<button
									type="button"
									onClick={() =>
										toast({
											type: "info",
											title: "Password reset",
											description: "Demo mode: use the demo account below.",
										})
									}
									className="text-xs font-medium text-primary hover:underline"
								>
									Forgot password?
								</button>
							</div>
							<div className="relative">
								<Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<input
									id={passwordId}
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									{...register("password")}
									placeholder="••••••••"
									className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((value) => !value)}
									className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
							{errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
						</div>

						<label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
							<input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border accent-primary" />
							Remember me
						</label>

						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:opacity-60"
						>
							{isSubmitting ? (
								<>
									<Spinner className="h-5 w-5" /> Signing in…
								</>
							) : (
								<>
									Sign in <ArrowRight className="h-4 w-4" />
								</>
							)}
						</button>
					</form>

					<div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
						<div className="h-px flex-1 bg-border" />
						or
						<div className="h-px flex-1 bg-border" />
					</div>

					<button
						type="button"
						onClick={handleDemo}
						disabled={demoLoading}
						className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
					>
						{demoLoading ? <Spinner className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-accent" />}
						Try the demo account
					</button>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						New to ReadVerse?{" "}
						<Link to="/signup" className="font-semibold text-primary hover:underline">
							Create an account
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
