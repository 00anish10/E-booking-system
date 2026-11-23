import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { conflict, notFound } from "../lib/http-error.js";
import { mapBook, type BookRow } from "../lib/mappers.js";
import { parseInput } from "../lib/validation.js";

const listSchema = z.object({
	search: z.string().trim().max(120).optional(),
	category: z.string().trim().max(60).optional(),
	sort: z.enum(["popular", "rating", "price-low", "price-high", "newest", "title"]).default("popular"),
	minRating: z.coerce.number().min(0).max(5).optional(),
	maxPrice: z.coerce.number().min(0).max(1000).optional(),
	tag: z.enum(["bestseller", "trending", "new"]).optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(48).default(12),
});

const reviewSchema = z.object({
	rating: z.coerce.number().int().min(1).max(5),
	body: z.string().trim().min(10, "Review must be at least 10 characters").max(2000),
});

interface ReviewRow {
	id: string;
	rating: number;
	body: string;
	created_at: string | Date;
	author: string;
}

const mapReview = (row: ReviewRow) => ({
	id: row.id,
	rating: row.rating,
	body: row.body,
	createdAt: new Date(row.created_at).toISOString(),
	author: row.author,
});

export default async function bookRoutes(app: FastifyInstance) {
	app.get("/", async (request) => {
		const input = parseInput(listSchema, request.query);

		const conditions: string[] = [];
		const params: Array<string | number> = [];

		if (input.search) {
			params.push(`%${input.search}%`);
			const index = params.length;
			conditions.push(`(title ILIKE $${index} OR author ILIKE $${index} OR category ILIKE $${index})`);
		}
		if (input.category) {
			params.push(input.category);
			conditions.push(`category = $${params.length}`);
		}
		if (input.minRating !== undefined) {
			params.push(input.minRating);
			conditions.push(`rating >= $${params.length}`);
		}
		if (input.maxPrice !== undefined) {
			params.push(input.maxPrice);
			conditions.push(`price <= $${params.length}`);
		}
		if (input.tag === "bestseller") conditions.push("bestseller = true");
		if (input.tag === "trending") conditions.push("trending = true");
		if (input.tag === "new") conditions.push("new_release = true");

		const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

		const orderBy: Record<typeof input.sort, string> = {
			popular: "reviews_count DESC, rating DESC",
			rating: "rating DESC, reviews_count DESC",
			"price-low": "price ASC",
			"price-high": "price DESC",
			newest: "new_release DESC, created_at DESC",
			title: "title ASC",
		};

		const countResult = await query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM books ${where}`, params);
		const total = countResult.rows[0]?.count ?? 0;

		const offset = (input.page - 1) * input.limit;
		const listParams = [...params, input.limit, offset];

		const result = await query<BookRow>(
			`SELECT * FROM books ${where}
			 ORDER BY ${orderBy[input.sort]}
			 LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
			listParams,
		);

		return {
			books: result.rows.map(mapBook),
			total,
			page: input.page,
			limit: input.limit,
			totalPages: Math.max(1, Math.ceil(total / input.limit)),
		};
	});

	app.get("/categories", async () => {
		const result = await query<{ category: string; count: number }>(
			`SELECT category, COUNT(*)::int AS count
			 FROM books GROUP BY category ORDER BY category ASC`,
		);
		return { categories: result.rows };
	});

	app.get("/:bookId", async (request) => {
		const { bookId } = request.params as { bookId: string };

		const result = await query<BookRow>("SELECT * FROM books WHERE id = $1", [bookId]);
		const row = result.rows[0];
		if (!row) throw notFound("Book not found");

		const reviews = await query<ReviewRow>(
			`SELECT r.id, r.rating, r.body, r.created_at, u.name AS author
			 FROM reviews r JOIN users u ON u.id = r.user_id
			 WHERE r.book_id = $1
			 ORDER BY r.created_at DESC`,
			[bookId],
		);

		return {
			book: mapBook(row),
			reviews: reviews.rows.map(mapReview),
		};
	});

	app.post("/:bookId/reviews", { preHandler: [app.authenticate] }, async (request, reply) => {
		const { bookId } = request.params as { bookId: string };
		const input = parseInput(reviewSchema, request.body);

		const book = await query<{ id: string }>("SELECT id FROM books WHERE id = $1", [bookId]);
		if (!book.rowCount) throw notFound("Book not found");

		const existing = await query<{ id: string }>("SELECT id FROM reviews WHERE user_id = $1 AND book_id = $2", [
			request.user.sub,
			bookId,
		]);
		if (existing.rowCount) {
			throw conflict("You have already reviewed this book");
		}

		const inserted = await query<ReviewRow>(
			`INSERT INTO reviews (user_id, book_id, rating, body)
				 VALUES ($1, $2, $3, $4)
				 RETURNING id, rating, body, created_at,
				   (SELECT name FROM users WHERE id = $1) AS author`,
			[request.user.sub, bookId, input.rating, input.body],
		);

		await query(
			`UPDATE books SET
					rating = ROUND((rating * reviews_count + $2) / (reviews_count + 1), 1),
					reviews_count = reviews_count + 1
				 WHERE id = $1`,
			[bookId, input.rating],
		);

		return reply.code(201).send({ review: mapReview(inserted.rows[0]) });
	});
}
