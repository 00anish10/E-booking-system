import type { ZodType } from "zod";
import { badRequest } from "./http-error.js";

export function parseInput<T>(schema: ZodType<T>, data: unknown): T {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw badRequest(
			"Please check the submitted data",
			result.error.issues.map((issue) => ({
				field: issue.path.join("."),
				message: issue.message,
			})),
		);
	}
	return result.data;
}
