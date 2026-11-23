import { BookOpen, Github, Mail, Send, Twitter } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router";
import { useToast } from "@/contexts/toast-context";

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
	<Link to={to} className="text-sm text-muted-foreground transition-smooth hover:text-foreground">
		{children}
	</Link>
);

const FrontendFooter = () => {
	const newsletterEmailId = useId();
	const { toast } = useToast();
	const [email, setEmail] = useState("");

	const handleSubscribe = (event: React.FormEvent) => {
		event.preventDefault();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast({ type: "error", title: "Enter a valid email address" });
			return;
		}
		toast({
			type: "success",
			title: "You're on the list!",
			description: "We'll send you new releases and reading picks.",
		});
		setEmail("");
	};

	return (
		<footer className="mt-20 border-t border-border bg-card/70 backdrop-blur-xl">
			<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
					<div className="space-y-4 lg:col-span-2">
						<Link to="/" className="flex items-center gap-2">
							<div className="rounded-lg bg-primary p-2">
								<BookOpen className="h-5 w-5 text-primary-foreground" />
							</div>
							<span className="text-lg font-bold text-foreground">ReadVerse</span>
						</Link>
						<p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
							Your gateway to endless stories and knowledge. Read, discover, and grow — wherever you are.
						</p>
						<form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
							<label htmlFor={newsletterEmailId} className="sr-only">
								Email address
							</label>
							<input
								id={newsletterEmailId}
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
								className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							/>
							<button
								type="submit"
								className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
							>
								<Send className="h-4 w-4" />
								<span className="hidden sm:inline">Subscribe</span>
							</button>
						</form>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Explore</h3>
						<ul className="space-y-2.5">
							<li>
								<FooterLink to="/catalog">Browse books</FooterLink>
							</li>
							<li>
								<FooterLink to="/library">My library</FooterLink>
							</li>
							<li>
								<FooterLink to="/cart">Shopping cart</FooterLink>
							</li>
							<li>
								<FooterLink to="/signup">Create account</FooterLink>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Categories</h3>
						<ul className="space-y-2.5">
							<li>
								<FooterLink to="/catalog?category=Fiction">Fiction</FooterLink>
							</li>
							<li>
								<FooterLink to="/catalog?category=Science%20Fiction">Science fiction</FooterLink>
							</li>
							<li>
								<FooterLink to="/catalog?category=Business">Business</FooterLink>
							</li>
							<li>
								<FooterLink to="/catalog?category=Self-Help">Self-help</FooterLink>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">Connect</h3>
						<div className="flex gap-2">
							{[
								{ icon: Twitter, label: "Twitter", href: "https://twitter.com" },
								{ icon: Github, label: "GitHub", href: "https://github.com" },
								{ icon: Mail, label: "Email", href: "mailto:hello@readverse.dev" },
							].map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noreferrer"
									aria-label={social.label}
									className="rounded-lg bg-muted p-2.5 text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
								>
									<social.icon className="h-5 w-5" />
								</a>
							))}
						</div>
						<p className="mt-4 text-xs text-muted-foreground">hello@readverse.dev</p>
					</div>
				</div>

				<div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
					<p>© {new Date().getFullYear()} ReadVerse. All rights reserved.</p>
					<p>Built with React, Fastify, and PostgreSQL.</p>
				</div>
			</div>
		</footer>
	);
};

export default FrontendFooter;
