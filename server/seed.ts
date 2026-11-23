import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { booksData } from "../src/data/books.js";
import { pool } from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));

async function run() {
	const schema = await readFile(join(here, "sql", "schema.sql"), "utf8");
	await pool.query(schema);

	for (const book of booksData) {
		await pool.query(
			`INSERT INTO books (
				id, title, author, author_bio, cover, rating, reviews_count, price,
				category, pages, language, publisher, publish_date, isbn, description,
				bestseller, trending, new_release
			) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				author = EXCLUDED.author,
				author_bio = EXCLUDED.author_bio,
				cover = EXCLUDED.cover,
				rating = EXCLUDED.rating,
				reviews_count = EXCLUDED.reviews_count,
				price = EXCLUDED.price,
				category = EXCLUDED.category,
				pages = EXCLUDED.pages,
				language = EXCLUDED.language,
				publisher = EXCLUDED.publisher,
				publish_date = EXCLUDED.publish_date,
				isbn = EXCLUDED.isbn,
				description = EXCLUDED.description,
				bestseller = EXCLUDED.bestseller,
				trending = EXCLUDED.trending,
				new_release = EXCLUDED.new_release`,
			[
				book.id,
				book.title,
				book.author,
				book.authorBio,
				book.cover,
				book.rating,
				book.reviews,
				book.price,
				book.category,
				book.pages,
				book.language,
				book.publisher,
				book.publishDate,
				book.isbn,
				book.description,
				Boolean(book.bestseller),
				Boolean(book.trending),
				Boolean(book.newRelease),
			],
		);
	}

	const passwordHash = await bcrypt.hash("password123", 10);
	const demo = await pool.query<{ id: string }>(
		`INSERT INTO users (name, email, password_hash, avatar_url)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
		 RETURNING id`,
		["Demo Reader", "demo@readverse.dev", passwordHash, "https://api.dicebear.com/9.x/notionists/svg?seed=ReadVerse"],
	);

	const demoId = demo.rows[0].id;
	for (const [bookId, progress] of [
		["1", 42],
		["2", 100],
	] as const) {
		await pool.query(
			`INSERT INTO library (user_id, book_id, progress, last_read_at)
			 VALUES ($1, $2, $3, now())
			 ON CONFLICT (user_id, book_id) DO UPDATE SET progress = EXCLUDED.progress`,
			[demoId, bookId, progress],
		);
	}

	await pool.query(
		`INSERT INTO reviews (user_id, book_id, rating, body)
		 VALUES ($1, '1', 5, $2)
		 ON CONFLICT (user_id, book_id) DO NOTHING`,
		[
			demoId,
			"A beautifully written reminder that every life we could live matters. The Midnight Library is comforting, clever, and deeply human.",
		],
	);

	console.log(`Seeded ${booksData.length} books and demo user demo@readverse.dev / password123`);
	await pool.end();
}

run().catch(async (error) => {
	console.error(error);
	await pool.end();
	process.exit(1);
});
