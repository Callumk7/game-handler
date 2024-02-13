import { Hono } from "hono";
import { drizzleClient } from "../db";
import { z } from "zod";
import { covers } from "../db/schema/games";
import { uuidv4 } from "../util/generate-uuid";
import { Bindings } from "../types/bindings";
import { fetchGamesFromIGDB } from "../util/igdb-fetch";
import { IGDBGameSchema } from "@/types/igdb";

const app = new Hono<{ Bindings: Bindings }>();

const coverRequestSchema = z.object({
	gameId: z.coerce.number(),
	imageId: z.coerce.string(),
});

type CoverRequest = z.infer<typeof coverRequestSchema>;

// COVERS
app.get("/", (c) => c.text("This is the covers endpoint."));

// Create covers from IGDB data
app.post("/", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);

	const json = await c.req.json();

	let coverRequest: CoverRequest;

	try {
		coverRequest = coverRequestSchema.parse(json);
	} catch (e) {
		return c.json(
			{ error: "Invalid JSON body. Must have a gameId and imageId." },
			400,
		);
	}

	const { gameId, imageId } = coverRequest;

	try {
		const coverInsert = await db
			.insert(covers)
			.values({
				id: `cover_${uuidv4()}`,
				gameId: gameId,
				imageId: imageId,
			})
			.returning();

		return c.json(coverInsert);
	} catch (e) {
		console.error(e);
		return c.json({ error: e }, 500);
	}
});

app.post("/:gameId", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);

	const { gameId } = c.req.param();

	const igdbGame = await fetchGamesFromIGDB(
		c.env.IGDB_BASE_URL,
		{
			fields: "full",
			filters: [`id = ${gameId}`],
		},
		undefined,
		{
			Authorization: `Bearer ${c.env.IGDB_BEARER_TOKEN}`,
			"Client-ID": c.env.IGDB_CLIENT_ID,
			"content-type": "text/plain",
		},
	);

	const validGame = IGDBGameSchema.parse(igdbGame[0]);
	const coverPost = await db.insert(covers).values({
		id: `cover_${uuidv4()}`,
		gameId: Number(gameId),
		imageId: validGame.cover.image_id,
	});

	console.log(coverPost);
	return c.json(coverPost);
});

export default app;
