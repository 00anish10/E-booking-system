import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
	connectionString: env.databaseUrl,
	max: 10,
	idleTimeoutMillis: 30_000,
});

pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error", error);
});

export type QueryParam = string | number | boolean | null | undefined;

export const query = <T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: QueryParam[] = []) =>
	pool.query<T>(text, params);

export async function withTransaction<T>(callback: (client: pg.PoolClient) => Promise<T>): Promise<T> {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const result = await callback(client);
		await client.query("COMMIT");
		return result;
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
}
