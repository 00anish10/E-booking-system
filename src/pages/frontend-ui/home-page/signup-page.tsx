import { yupResolver } from "@hookform/resolvers/yup";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import * as yup from "yup";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { getErrorMessage } from "@/lib/api";

const schema = yup.object({
	name: yup.string().trim().min(2, "Name must be at least 2 characters").max(80).required("Name is required"),
	email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
	password: yup
		.string()
		.min(8, "Password must be at least 8 characters")
		.matches(/[A-Z]/, "Include at least one uppercase letter")
		.matches(/[0-9]/, "Include at least one number")
		.required("Password is required"),
	confirmPassword: yup
		.string()
		.oneOf([yup.ref("password")], "Passwords do not match")
		.required("Confirm your password"),
	acceptTerms: yup.boolean().oneOf([true], "Please accept the terms to continue").required(),
});

type FormValues = yup.InferType<typeof schema>;

const SignupPage = () => {
	useDocumentTitle("Create account");
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const returnTo = searchParams.get("returnTo") || "/catalog";
	const { register: createAccount, isAuthenticated } = useAuth();
	const { toast } = useToast();
	const [showPassword, setShowPassword] = useState(false);
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			acceptTerms: false,
		},
	});

	const password = watch("password");

	useEffect(() => {
		if (isAuthenticated) navigate(returnTo, { replace: true });
	}, [isAuthenticated, navigate, returnTo]);

	const strength = useMemo(() => {
		let score = 0;
		if (password.length >= 8) score += 1;
		if (/[A-Z]/.test(password)) score += 1;
		if (/[0-9]/.test(password)) score += 1;
		if (/[^A-Za-z0-9]/.test(password)) score += 1;
		return score;
	}, [password]);

	const strengthLabel = ["Too weak", "Weak", "Okay", "Good", "Strong"][strength];

	const onSubmit = async (values: FormValues) => {
		try {
			const user = await createAccount(values.name, values.email, values.password);
			toast({
				type: "success",
				title: `Welcome to ReadVerse, ${user.name.split(" ")[0]}!`,
				description: "Your account is ready. Let's find your first book.",
			});
			navigate(returnTo, { replace: true });
		} catch (error) {
			toast({
				type: "error",
				title: "Could not create your account",
				description: getErrorMessage(error),
			});
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[hsl(280,45%,22%)] via-[hsl(250,45%,24%)] to-[hsl(230,50%,18%)] px-4 py-12">
			<motion.div
				className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-pink-400/20 blur-3xl"
				animate={{ y: [0, 50, 0], scale: [1, 1.2, 1] }}
				transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY }}
			/>
			<motion.div
				className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"
				animate={{ y: [0, -40, 0], scale: [1, 1.1, 1] }}
				transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY }}
			/>

			<div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
				<div className="hidden flex-col justify-between p-10 text-white lg:flex">
					<Link to="/" className="flex items-center gap-2">
						<div className="rounded-xl bg-white/10 p-2.5">
							<BookOpen className="h-6 w-6 text-accent" />
						</div>
						<span className="text-xl font-bold">ReadVerse</span>
					</Link>

					<div className="space-y-6">
						<Sparkles className="h-8 w-8 text-accent" />
						<h2 className="text-3xl font-bold leading-tight">
							Start your reading
							<br /> journey today.
						</h2>
						<ul className="space-y-3 text-white/80">
							{[
								"Preview any book for free",
								"Track progress across devices",
								"Build a library you own forever",
								"Personalized recommendations",
							].map((item) => (
								<li key={item} className="flex items-center gap-3">
									<span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
										<Check className="h-3.5 w-3.5" />
									</span>
									{item}
								</li>
							))}
						</ul>
					</div>

					<p className="text-xs text-white/40">No credit card required to create an account.</p>
				</div>

				<div className="bg-card/95 p-8 sm:p-10">
					<Link to="/" className="mb-6 flex items-center justify-center gap-2 lg:hidden">
						<div className="rounded-lg bg-primary p-2">
							<BookOpen className="h-5 w-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-bold text-foreground">ReadVerse</span>
					</Link>

					<div className="mb-7 text-center">
						<h1 className="text-3xl font-bold text-foreground">Create account</h1>
						<p className="mt-2 text-muted-foreground">Start reading in under a minute</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div>
							<label htmlFor={nameId} className="mb-1.5 block text-sm font-medium text-foreground">
								Full name
							</label>
							<div className="relative">
								<User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<input
									id={nameId}
									type="text"
									autoComplete="name"
									{...register("name")}
									placeholder="Jane Reader"
									className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							{errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
						</div>

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
							<label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-foreground">
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<input
									id={passwordId}
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									{...register("password")}
									placeholder="At least 8 characters"
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
							{password && (
								<div className="mt-2">
									<div className="flex gap-1">
										{[0, 1, 2, 3].map((index) => (
											<div
												key={index}
												className={`h-1 flex-1 rounded-full transition ${
													index < strength
														? strength <= 1
															? "bg-red-500"
															: strength === 2
																? "bg-amber-500"
																: "bg-emerald-500"
														: "bg-muted"
												}`}
											/>
										))}
									</div>
									<p className="mt-1 text-xs text-muted-foreground">Strength: {strengthLabel}</p>
								</div>
							)}
							{errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
						</div>

						<div>
							<label htmlFor={confirmPasswordId} className="mb-1.5 block text-sm font-medium text-foreground">
								Confirm password
							</label>
							<div className="relative">
								<Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
								<input
									id={confirmPasswordId}
									type="password"
									autoComplete="new-password"
									{...register("confirmPassword")}
									placeholder="Repeat your password"
									className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								/>
							</div>
							{errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
						</div>

						<label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
							<input
								type="checkbox"
								{...register("acceptTerms")}
								className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
							/>
							<span>
								I agree to the <span className="font-medium text-foreground">Terms of Service</span> and{" "}
								<span className="font-medium text-foreground">Privacy Policy</span>.
							</span>
						</label>
						{errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}

						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:opacity-60"
						>
							{isSubmitting ? (
								<>
									<Spinner className="h-5 w-5" /> Creating account…
								</>
							) : (
								<>
									Create account <ArrowRight className="h-4 w-4" />
								</>
							)}
						</button>
					</form>

					<p className="mt-6 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link to="/login" className="font-semibold text-primary hover:underline">
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
