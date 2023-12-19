import { Hono } from "hono";
import { drizzleClient } from "../db";
import { IGDBGame, IGDBGameSchema } from "../types/games";
import { GameInsert, games } from "../db/schema/games";
import { uuidv4 } from "../util/generate-uuid";

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

	// How are we going to handle the presence of invalid games?
	// We can return an error for the entire request, or process the rest of the valid games,
	// and return the invalid games in the response.

	// Insert the valid games into the database.
	const gameInsert: GameInsert[] = validGames.map((game) => {
		let gameInsert: GameInsert = {
			id: `game_${uuidv4()}`,
			title: game.name,
			gameId: game.id,
		};

		if (game.storyline) {
			gameInsert.storyline = game.storyline;
		}

		if (game.follows) {
			gameInsert.externalFollows = game.follows;
		}

		if (game.aggregated_rating) {
			gameInsert.aggregatedRating = Math.floor(game.aggregated_rating);
		}

		if (game.aggregated_rating_count) {
			gameInsert.aggregatedRatingCount = game.aggregated_rating_count;
		}

		if (game.rating) {
			gameInsert.rating = Math.floor(game.rating);
		}

		if (game.first_release_date) {
			gameInsert.firstReleaseDate = new Date(
				game.first_release_date * 1000,
			);
		}

		return gameInsert;
	});

	const insertedGames = await db
		.insert(games)
		.values(gameInsert)
		.onConflictDoNothing()
		.returning();
	return c.json({ insertedGames, invalidGames });
});

export default app;
