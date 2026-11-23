import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { conflict, unauthorized } from "../lib/http-error.js";
import { mapUser, type UserRow } from "../lib/mappers.js";
import { parseInput } from "../lib/validation.js";

const registerSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
	email: z.string().trim().toLowerCase().email("Enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
	email: z.string().trim().toLowerCase().email("Enter a valid email"),
	password: z.string().min(1, "Password is required"),
});

interface UserWithPasswordRow extends UserRow {
	password_hash: string;
}

export default async function authRoutes(app: FastifyInstance) {
	app.post("/register", async (request, reply) => {
		const input = parseInput(registerSchema, request.body);

		const existing = await query<{ id: string }>("SELECT id FROM users WHERE email = $1", [input.email]);
		if (existing.rowCount) {
			throw conflict("An account with this email already exists");
		}

		const passwordHash = await bcrypt.hash(input.password, 10);
		const result = await query<UserRow>(
			`INSERT INTO users (name, email, password_hash)
			 VALUES ($1, $2, $3)
			 RETURNING id, name, email, avatar_url, created_at`,
			[input.name, input.email, passwordHash],
		);

		const user = mapUser(result.rows[0]);
		const token = app.jwt.sign({
			sub: user.id,
			email: user.email,
			name: user.name,
		});

		return reply.code(201).send({ token, user });
	});

	app.post("/login", async (request) => {
		const input = parseInput(loginSchema, request.body);

		const result = await query<UserWithPasswordRow>(
			`SELECT id, name, email, avatar_url, created_at, password_hash
			 FROM users WHERE email = $1`,
			[input.email],
		);

		const row = result.rows[0];
		if (!row) {
			throw unauthorized("Invalid email or password");
		}

		const valid = await bcrypt.compare(input.password, row.password_hash);
		if (!valid) {
			throw unauthorized("Invalid email or password");
		}

		const user = mapUser(row);
		const token = app.jwt.sign({
			sub: user.id,
			email: user.email,
			name: user.name,
		});

		return { token, user };
	});

	app.get("/me", { preHandler: [app.authenticate] }, async (request) => {
		const result = await query<UserRow>("SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1", [
			request.user.sub,
		]);
		const row = result.rows[0];
		if (!row) {
			throw unauthorized("Your session is no longer valid");
		}
		return { user: mapUser(row) };
	});
}
