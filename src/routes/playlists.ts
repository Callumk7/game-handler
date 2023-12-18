import { Hono } from "hono";
import { drizzleClient } from "../db";
import { playlists } from "../db/schema/playlists";
import { eq } from "drizzle-orm";

type Bindings = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// PLAYLISTS
app.get("/", (c) => c.text("This is the playlist endpoint."));

app.get("/:userId", async (c) => {
	const { userId } = c.req.param();

	const db = drizzleClient(c.env.DATABASE_URL);
	const playlistData = await db
		.select()
		.from(playlists)
		.where(eq(playlists.creatorId, userId));

	if (playlistData.length === 0) {
		return c.json({ error: `No data found for userId ${userId}.` }, 404);
	}

	return c.json(playlistData, 200);
});

export default app;
