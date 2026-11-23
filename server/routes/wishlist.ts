import type { FastifyInstance } from "fastify";
import { query } from "../db.js";
import { notFound } from "../lib/http-error.js";
import { mapBook, type BookRow } from "../lib/mappers.js";

export default async function wishlistRoutes(app: FastifyInstance) {
	app.addHook("preHandler", app.authenticate);

	app.get("/", async (request) => {
		const result = await query<BookRow>(
			`SELECT b.* FROM wishlist w JOIN books b ON b.id = w.book_id
			 WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
			[request.user.sub],
		);
		return { books: result.rows.map(mapBook) };
	});

	app.post("/:bookId", async (request, reply) => {
		const { bookId } = request.params as { bookId: string };

		const book = await query<{ id: string }>("SELECT id FROM books WHERE id = $1", [bookId]);
		if (!book.rowCount) throw notFound("Book not found");

		await query(
			`INSERT INTO wishlist (user_id, book_id) VALUES ($1, $2)
			 ON CONFLICT (user_id, book_id) DO NOTHING`,
			[request.user.sub, bookId],
		);

		return reply.code(201).send({ ok: true });
	});

	app.delete("/:bookId", async (request) => {
		const { bookId } = request.params as { bookId: string };
		await query("DELETE FROM wishlist WHERE user_id = $1 AND book_id = $2", [request.user.sub, bookId]);
		return { ok: true };
	});
}
