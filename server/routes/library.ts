import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { notFound } from "../lib/http-error.js";
import { mapBook, type BookRow } from "../lib/mappers.js";
import { parseInput } from "../lib/validation.js";

const progressSchema = z.object({
	progress: z.coerce.number().int().min(0).max(100),
});

interface LibraryRow extends BookRow {
	progress: number;
	purchased_at: string | Date;
	last_read_at: string | Date | null;
}

const mapLibraryItem = (row: LibraryRow) => ({
	...mapBook(row),
	progress: row.progress,
	purchasedAt: new Date(row.purchased_at).toISOString(),
	lastReadAt: row.last_read_at ? new Date(row.last_read_at).toISOString() : null,
});

export default async function libraryRoutes(app: FastifyInstance) {
	app.addHook("preHandler", app.authenticate);

	app.get("/", async (request) => {
		const result = await query<LibraryRow>(
			`SELECT b.*, l.progress, l.purchased_at, l.last_read_at
			 FROM library l JOIN books b ON b.id = l.book_id
			 WHERE l.user_id = $1
			 ORDER BY COALESCE(l.last_read_at, l.purchased_at) DESC`,
			[request.user.sub],
		);

		const books = result.rows.map(mapLibraryItem);
		const completed = books.filter((book) => book.progress === 100).length;
		const averageProgress = books.length
			? Math.round(books.reduce((sum, book) => sum + book.progress, 0) / books.length)
			: 0;

		return {
			books,
			stats: {
				owned: books.length,
				completed,
				inProgress: books.filter((book) => book.progress > 0 && book.progress < 100).length,
				averageProgress,
			},
		};
	});

	app.patch("/:bookId/progress", async (request) => {
		const { bookId } = request.params as { bookId: string };
		const input = parseInput(progressSchema, request.body);

		const result = await query(
			`UPDATE library SET progress = $3, last_read_at = now()
			 WHERE user_id = $1 AND book_id = $2`,
			[request.user.sub, bookId, input.progress],
		);
		if (!result.rowCount) {
			throw notFound("You do not own this book");
		}

		return { ok: true, progress: input.progress };
	});
}
