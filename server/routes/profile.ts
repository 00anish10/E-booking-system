import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { badRequest, unauthorized } from "../lib/http-error.js";
import { mapUser, type UserRow } from "../lib/mappers.js";
import { parseInput } from "../lib/validation.js";

const updateSchema = z.object({
	name: z.string().trim().min(2).max(80).optional(),
	avatarUrl: z.string().trim().url("Avatar must be a valid URL").optional().nullable(),
});

const passwordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
});

export default async function profileRoutes(app: FastifyInstance) {
	app.addHook("preHandler", app.authenticate);

	app.patch("/", async (request) => {
		const input = parseInput(updateSchema, request.body);

		const updates: string[] = [];
		const params: Array<string | null> = [];

		if (input.name !== undefined) {
			params.push(input.name);
			updates.push(`name = $${params.length}`);
		}
		if (input.avatarUrl !== undefined) {
			params.push(input.avatarUrl);
			updates.push(`avatar_url = $${params.length}`);
		}

		if (!updates.length) {
			throw badRequest("Nothing to update");
		}

		params.push(request.user.sub);
		const result = await query<UserRow>(
			`UPDATE users SET ${updates.join(", ")}, updated_at = now()
			 WHERE id = $${params.length}
			 RETURNING id, name, email, avatar_url, created_at`,
			params,
		);

		return { user: mapUser(result.rows[0]) };
	});

	app.patch("/password", async (request) => {
		const input = parseInput(passwordSchema, request.body);

		const result = await query<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = $1", [
			request.user.sub,
		]);
		const row = result.rows[0];
		if (!row) throw unauthorized("Your session is no longer valid");

		const valid = await bcrypt.compare(input.currentPassword, row.password_hash);
		if (!valid) throw badRequest("Current password is incorrect");

		const hash = await bcrypt.hash(input.newPassword, 10);
		await query("UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1", [request.user.sub, hash]);

		return { ok: true };
	});
}
