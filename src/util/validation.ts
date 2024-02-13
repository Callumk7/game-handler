import { Context } from "hono";

export const returnErrorIfNotArray = (json: unknown, context: Context) => {
	if (!Array.isArray(json)) {
		return context.json(
			{ error: "Invalid JSON body. Body must be an array." },
			400,
		);
	}
}
