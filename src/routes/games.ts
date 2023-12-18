import { Hono } from "hono";
import { drizzleClient } from "../db";
import { IGDBGame, IGDBGameSchema } from "../types/games";
import { GameInsert, games } from "../db/schema/games";

type Bindings = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// GAMES
app.get("/", (c) => c.text("This is the games endpoint."));

// Create games from IGDB data
app.post("/", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);

	// Parse the body and see what we are dealing with.
	const json = await c.req.json();
	if (!Array.isArray(json)) {
		return c.json(
			{ error: "Invalid JSON body. Body must be an array." },
			400,
		);
	}

	// Check each item in the array. We should push all correct items to a new array.
	const validGames: IGDBGame[] = [];
	const invalidGames: any[] = [];
	json.forEach((game) => {
		try {
			validGames.push(IGDBGameSchema.parse(game));
		} catch (e) {
			invalidGames.push(game);
			console.error(e);
		}
	});

	// Insert the valid games into the database.
	const gameInsert: GameInsert[] = validGames.map((game) => ({
		id: `game_${game.id}`,
		gameId: game.id,
		title: game.name,
	}));

	const insertedGames = await db.insert(games).values(gameInsert).returning();
	return c.json({ insertedGames, invalidGames });
});

export default app;
