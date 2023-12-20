import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { zx } from "zodix";
import { z } from "zod";
import { usersToGames } from "../db/schema/users";
import { drizzleClient } from "../db";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.text("This is the collections endpoint."));

app.post("/", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);
	const formData = await zx.parseFormSafe(c.req.raw, {
		gameId: zx.NumAsString,
		userId: z.string(),
	});

	if (formData.success) {
		// save a game to the user's collection
		const savedGame = await db
			.insert(usersToGames)
			.values({
				gameId: formData.data.gameId,
				userId: formData.data.userId,
			})
			.returning();

		return c.json({
			success: savedGame,
		});
	} else {
		return c.json({
			error: formData.error,
		});
	}
});
