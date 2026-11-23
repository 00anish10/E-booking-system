export interface BookRow {
	id: string;
	title: string;
	author: string;
	author_bio: string;
	cover: string;
	rating: string | number;
	reviews_count: number;
	price: string | number;
	category: string;
	pages: number;
	language: string;
	publisher: string;
	publish_date: string;
	isbn: string;
	description: string;
	bestseller: boolean;
	trending: boolean;
	new_release: boolean;
}

export const mapBook = (row: BookRow) => ({
	id: row.id,
	title: row.title,
	author: row.author,
	authorBio: row.author_bio,
	cover: row.cover,
	rating: Number(row.rating),
	reviews: row.reviews_count,
	price: Number(row.price),
	category: row.category,
	pages: row.pages,
	language: row.language,
	publisher: row.publisher,
	publishDate: row.publish_date,
	isbn: row.isbn,
	description: row.description,
	bestseller: row.bestseller,
	trending: row.trending,
	newRelease: row.new_release,
});

export interface UserRow {
	id: string;
	name: string;
	email: string;
	avatar_url: string | null;
	created_at: string | Date;
}

export const mapUser = (row: UserRow) => ({
	id: row.id,
	name: row.name,
	email: row.email,
	avatarUrl: row.avatar_url,
	memberSince: new Date(row.created_at).toISOString(),
});
