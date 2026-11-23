import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { notFound } from "../lib/http-error.js";
import { parseInput } from "../lib/validation.js";

const addSchema = z.object({
	bookId: z.string().min(1),
	quantity: z.coerce.number().int().min(1).max(20).default(1),
});

const updateSchema = z.object({
	quantity: z.coerce.number().int().min(0).max(20),
});

interface CartRow {
	id: string;
	title: string;
	author: string;
	price: string | number;
	cover: string;
	quantity: number;
}

const mapCartItem = (row: CartRow) => ({
	id: row.id,
	title: row.title,
	author: row.author,
	price: Number(row.price),
	cover: row.cover,
	quantity: row.quantity,
});

export default async function cartRoutes(app: FastifyInstance) {
	app.addHook("preHandler", app.authenticate);

	app.get("/", async (request) => {
		const result = await query<CartRow>(
			`SELECT b.id, b.title, b.author, b.price, b.cover, c.quantity
			 FROM cart_items c JOIN books b ON b.id = c.book_id
			 WHERE c.user_id = $1
			 ORDER BY c.created_at ASC`,
			[request.user.sub],
		);
		return { items: result.rows.map(mapCartItem) };
	});

	app.post("/", async (request, reply) => {
		const input = parseInput(addSchema, request.body);

		const book = await query<{ id: string }>("SELECT id FROM books WHERE id = $1", [input.bookId]);
		if (!book.rowCount) throw notFound("Book not found");

		await query(
			`INSERT INTO cart_items (user_id, book_id, quantity)
			 VALUES ($1, $2, $3)
			 ON CONFLICT (user_id, book_id)
			 DO UPDATE SET quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, 20)`,
			[request.user.sub, input.bookId, input.quantity],
		);

		return reply.code(201).send({ ok: true });
	});

	app.patch("/:bookId", async (request) => {
		const { bookId } = request.params as { bookId: string };
		const input = parseInput(updateSchema, request.body);

		if (input.quantity === 0) {
			await query("DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2", [request.user.sub, bookId]);
			return { ok: true };
		}

		const result = await query(
			`UPDATE cart_items SET quantity = $3
			 WHERE user_id = $1 AND book_id = $2`,
			[request.user.sub, bookId, input.quantity],
		);
		if (!result.rowCount) throw notFound("This book is not in your cart");

		return { ok: true };
	});

	app.delete("/:bookId", async (request) => {
		const { bookId } = request.params as { bookId: string };
		await query("DELETE FROM cart_items WHERE user_id = $1 AND book_id = $2", [request.user.sub, bookId]);
		return { ok: true };
	});

	app.delete("/", async (request) => {
		await query("DELETE FROM cart_items WHERE user_id = $1", [request.user.sub]);
		return { ok: true };
	});
}
