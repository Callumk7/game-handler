import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { drizzleClient } from "../db";
import { fetchGamesFromIGDB } from "../util/igdb-fetch";
import { createDbInserts } from "../util/create-inserts";
import { IGDBGame, IGDBGameSchema } from "@/types/igdb";
import { InsertArtwork, InsertCover, InsertGame, InsertGenre, InsertGenreToGames, InsertScreenshot } from "@/types/games";
import { artworks, covers, games, genres, genresToGames, screenshots } from "@/db/schema/games";
import { returnErrorIfNotArray } from "@/util/validation";

const app = new Hono<{ Bindings: Bindings }>();

// GAMES
app.get("/", (c) => c.text("This is the games endpoint."));

// Create games from IGDB data
app.post("/", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);

	// Parse the body and see what we are dealing with.
	const json = await c.req.json();
	returnErrorIfNotArray(json, c);

	// Check each item in the array. We should push all correct items to a new array.
	const validGames: IGDBGame[] = [];
	const invalidGames: any[] = [];
	for (const game of json) {
		try {
			validGames.push(IGDBGameSchema.parse(game));
		} catch (e) {
			invalidGames.push(game);
			console.error(e);
		}
	};

	// How are we going to handle the presence of invalid games?
	// We can return an error for the entire request, or process the rest of the valid games,
	// and return the invalid games in the response.

	// Insert the valid games into the database.
	const coverInserts: InsertCover[] = [];
	const artworkInserts: InsertArtwork[] = [];
	const screenshotInserts: InsertScreenshot[] = [];
	const genreInserts: InsertGenre[] = [];
	const genreToGameInserts: InsertGenreToGames[] = [];
	const gameInserts: InsertGame[] = [];
	validGames.map((game) => {
		const [
			gameInsert,
			coverInsert,
			artworkInsert,
			screenshotInsert,
			genreInsert,
			genreToGameInsert,
		] = createDbInserts(game);

		coverInserts.push(...coverInsert);
		artworkInserts.push(...artworkInsert);
		screenshotInserts.push(...screenshotInsert);
		gameInserts.push(gameInsert);
		genreInserts.push(...genreInsert);
		genreToGameInserts.push(...genreToGameInsert);
	});

	console.log(genreToGameInserts);

	const insertedGamesPromise = db
		.insert(games)
		.values(gameInserts)
		.onConflictDoNothing({ target: games.gameId })
		.returning();

	const insertedCoversPromise = db
		.insert(covers)
		.values(coverInserts)
		.onConflictDoNothing({ target: covers.imageId })
		.returning();

	const insertedArtworksPromise = db
		.insert(artworks)
		.values(artworkInserts)
		.onConflictDoNothing({ target: artworks.imageId })
		.returning();

	const insertedScreenshotsPromise = db
		.insert(screenshots)
		.values(screenshotInserts)
		.onConflictDoNothing({ target: screenshots.imageId })
		.returning();

	const insertedGenresPromise = db
		.insert(genres)
		.values(genreInserts)
		.onConflictDoNothing({ target: genres.id })
		.returning();

	const insertedGenreToGamePromise = db
		.insert(genresToGames)
		.values(genreToGameInserts)
		.onConflictDoNothing()
		.returning();

	// Wait for all the promises to resolve.
	// TODO: Handle errors.
	const [
		insertedGames,
		insertedCovers,
		insertedArtworks,
		insertedScreenshots,
		insertedGenres,
		insertedGenreToGames,
	] = await Promise.all([
		insertedGamesPromise,
		insertedCoversPromise,
		insertedArtworksPromise,
		insertedScreenshotsPromise,
		insertedGenresPromise,
		insertedGenreToGamePromise,
	]);

	return c.json({
		insertedGames,
		invalidGames,
		insertedCovers,
		insertedArtworks,
		insertedScreenshots,
		insertedGenres,
		insertedGenreToGames,
	});
});

// This route is for getting all the data that we need from IGDB,
// and saving it to our database.
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

	console.log(igdbGame);
	let validGame: IGDBGame;
	try {
		validGame = IGDBGameSchema.parse(igdbGame[0]);
	} catch (e) {
		console.error(e);
		return c.json({ error: e }, 500);
	}

	const [
		gameInsert,
		coverInsert,
		artworkInsert,
		screenshotInsert,
		genreInsert,
		genreToGameInsert,
	] = createDbInserts(validGame);

	let promises: Promise<any>[] = [];
	let gameInsertPromise: Promise<any>;
	if (gameInsert) {
		gameInsertPromise = db
			.insert(games)
			.values(gameInsert)
			.onConflictDoNothing({ target: games.gameId })
			.returning();
		promises.push(gameInsertPromise);
	}

	let coverInsertPromise: Promise<any>;
	if (coverInsert.length > 0) {
		coverInsertPromise = db
			.insert(covers)
			.values(coverInsert)
			.onConflictDoNothing({ target: covers.imageId })
			.returning();
		promises.push(coverInsertPromise);
	}

	let artworkInsertPromise: Promise<any>;
	if (artworkInsert.length > 0) {
		artworkInsertPromise = db
			.insert(artworks)
			.values(artworkInsert)
			.onConflictDoNothing({ target: artworks.imageId })
			.returning();
		promises.push(artworkInsertPromise);
	}

	let screenshotInsertPromise: Promise<any>;
	if (screenshotInsert.length > 0) {
		screenshotInsertPromise = db
			.insert(screenshots)
			.values(screenshotInsert)
			.onConflictDoNothing({ target: screenshots.imageId })
			.returning();
		promises.push(screenshotInsertPromise);
	}

	let genreInsertPromise: Promise<any>;
	if (genreInsert.length > 0) {
		genreInsertPromise = db
			.insert(genres)
			.values(genreInsert)
			.onConflictDoNothing({ target: genres.id })
			.returning();
		promises.push(genreInsertPromise);
	}

	let genreToGameInsertPromise: Promise<any>;
	if (genreToGameInsert.length > 0) {
		genreToGameInsertPromise = db
			.insert(genresToGames)
			.values(genreToGameInsert)
			.onConflictDoNothing()
			.returning();
		promises.push(genreToGameInsertPromise);
	}

	const results = await Promise.all(promises);
	console.log(results);

	return c.json({
		results,
	});
});

export default app;
