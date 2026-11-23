CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	avatar_url TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	author_bio TEXT NOT NULL DEFAULT '',
	cover TEXT NOT NULL,
	rating NUMERIC(2, 1) NOT NULL DEFAULT 0,
	reviews_count INTEGER NOT NULL DEFAULT 0,
	price NUMERIC(10, 2) NOT NULL,
	category TEXT NOT NULL,
	pages INTEGER NOT NULL DEFAULT 0,
	language TEXT NOT NULL DEFAULT 'English',
	publisher TEXT NOT NULL DEFAULT '',
	publish_date TEXT NOT NULL DEFAULT '',
	isbn TEXT NOT NULL DEFAULT '',
	description TEXT NOT NULL DEFAULT '',
	bestseller BOOLEAN NOT NULL DEFAULT false,
	trending BOOLEAN NOT NULL DEFAULT false,
	new_release BOOLEAN NOT NULL DEFAULT false,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_category_idx ON books (category);
CREATE INDEX IF NOT EXISTS books_rating_idx ON books (rating DESC);
CREATE INDEX IF NOT EXISTS books_trending_idx ON books (trending);
CREATE INDEX IF NOT EXISTS books_bestseller_idx ON books (bestseller);

CREATE TABLE IF NOT EXISTS cart_items (
	user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
	quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS orders (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	subtotal NUMERIC(10, 2) NOT NULL,
	discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
	tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
	total NUMERIC(10, 2) NOT NULL,
	coupon_code TEXT,
	status TEXT NOT NULL DEFAULT 'paid',
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books (id) ON DELETE RESTRICT,
	title TEXT NOT NULL,
	price NUMERIC(10, 2) NOT NULL,
	quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS library (
	user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
	progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
	purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	last_read_at TIMESTAMPTZ,
	PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS wishlist (
	user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS reviews (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	book_id TEXT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
	rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
	body TEXT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS reviews_book_idx ON reviews (book_id, created_at DESC);
