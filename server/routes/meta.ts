import type { FastifyInstance } from "fastify";
import { query } from "../db.js";

export const COUPONS = [
	{ code: "READ10", label: "10% off your order", type: "percent", value: 10 },
	{
		code: "READVERSE20",
		label: "20% off your order",
		type: "percent",
		value: 20,
	},
	{ code: "SAVE5", label: "$5 off your order", type: "fixed", value: 5 },
];

export default async function metaRoutes(app: FastifyInstance) {
	app.get("/coupons", async () => ({ coupons: COUPONS }));

	app.get("/stats", async () => {
		const result = await query<{
			books: number;
			authors: number;
			reviews: number;
			categories: number;
		}>(
			`SELECT
			   COUNT(*)::int AS books,
			   COUNT(DISTINCT author)::int AS authors,
			   COALESCE(SUM(reviews_count), 0)::int AS reviews,
			   COUNT(DISTINCT category)::int AS categories
			 FROM books`,
		);

		return {
			stats: result.rows[0] ?? {
				books: 0,
				authors: 0,
				reviews: 0,
				categories: 0,
			},
		};
	});
}
