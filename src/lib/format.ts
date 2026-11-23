export const formatCurrency = (value: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(value);

export const formatNumber = (value: number) =>
	new Intl.NumberFormat("en-US", {
		notation: value >= 10_000 ? "compact" : "standard",
		maximumFractionDigits: 1,
	}).format(value);

export const formatDate = (value: string | Date) =>
	new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(value));

export const formatRelative = (value: string | Date) => {
	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	const days = Math.floor(diff / 86_400_000);
	if (days < 1) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 30) return `${days} days ago`;
	return formatDate(date);
};
