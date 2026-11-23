import "dotenv/config";

const port = Number(process.env.PORT ?? 4000);

export const env = {
	port: Number.isFinite(port) ? port : 4000,
	databaseUrl: process.env.DATABASE_URL ?? "postgresql://localhost:5432/readverse",
	jwtSecret: process.env.JWT_SECRET ?? "readverse-dev-secret-change-me",
	clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
	nodeEnv: process.env.NODE_ENV ?? "development",
	isProduction: process.env.NODE_ENV === "production",
};
