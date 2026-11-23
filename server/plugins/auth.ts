import jwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";
import { unauthorized } from "../lib/http-error.js";

export interface AuthPayload {
	sub: string;
	email: string;
	name: string;
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: AuthPayload;
		user: AuthPayload;
	}
}

export const registerAuth = async (app: FastifyInstance) => {
	await app.register(jwt, {
		secret: env.jwtSecret,
		sign: { expiresIn: "7d" },
	});

	app.decorate("authenticate", async (request: FastifyRequest, _reply: FastifyReply) => {
		try {
			await request.jwtVerify();
		} catch {
			throw unauthorized("Please sign in to continue");
		}
	});
};

declare module "fastify" {
	interface FastifyInstance {
		authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}
