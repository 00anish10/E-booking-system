import cors from "@fastify/cors";
import Fastify, { type FastifyError } from "fastify";
import { env } from "./env.js";
import { pool } from "./db.js";
import { HttpError } from "./lib/http-error.js";
import { registerAuth } from "./plugins/auth.js";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import cartRoutes from "./routes/cart.js";
import libraryRoutes from "./routes/library.js";
import metaRoutes from "./routes/meta.js";
import orderRoutes from "./routes/orders.js";
import profileRoutes from "./routes/profile.js";
import wishlistRoutes from "./routes/wishlist.js";

const app = Fastify({
	logger: {
		level: env.isProduction ? "info" : "debug",
		transport: env.isProduction
			? undefined
			: {
					target: "pino-pretty",
					options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" },
				},
	},
});

const allowedOrigins = env.clientOrigin
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

await app.register(cors, {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true);
		if (!env.isProduction || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}
		return callback(new Error("Origin not allowed by CORS"), false);
	},
	credentials: true,
});

await registerAuth(app);

app.get("/api/health", async () => {
	const result = await pool.query("SELECT now() AS time");
	return {
		status: "ok",
		service: "readverse-api",
		time: result.rows[0]?.time,
	};
});

await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(bookRoutes, { prefix: "/api/books" });
await app.register(cartRoutes, { prefix: "/api/cart" });
await app.register(orderRoutes, { prefix: "/api/orders" });
await app.register(libraryRoutes, { prefix: "/api/library" });
await app.register(wishlistRoutes, { prefix: "/api/wishlist" });
await app.register(profileRoutes, { prefix: "/api/profile" });
await app.register(metaRoutes, { prefix: "/api/meta" });

app.setNotFoundHandler((request, reply) => {
	reply.code(404).send({
		error: "not_found",
		message: `Route ${request.method} ${request.url} not found`,
	});
});

app.setErrorHandler((error: FastifyError, request, reply) => {
	if (error instanceof HttpError) {
		return reply.code(error.statusCode).send({
			error: error.code,
			message: error.message,
			details: error.details,
		});
	}

	const pgError = error as { code?: string; detail?: string };
	if (pgError.code === "23505") {
		return reply.code(409).send({
			error: "conflict",
			message: "That record already exists",
		});
	}
	if (pgError.code === "23503") {
		return reply.code(400).send({
			error: "bad_request",
			message: "A referenced record does not exist",
		});
	}

	const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
	if (statusCode >= 500) {
		request.log.error(error);
	}

	return reply.code(statusCode).send({
		error: statusCode >= 500 ? "internal_error" : "request_error",
		message: statusCode >= 500 ? "Something went wrong on our side. Please try again." : error.message,
	});
});

const shutdown = async (signal: string) => {
	app.log.info(`${signal} received, shutting down`);
	await app.close();
	await pool.end();
	process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

try {
	await app.listen({ port: env.port, host: "0.0.0.0" });
	app.log.info(`ReadVerse API ready at http://localhost:${env.port}`);
} catch (error) {
	app.log.error(error);
	process.exit(1);
}
