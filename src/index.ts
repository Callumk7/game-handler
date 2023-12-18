import { Hono } from "hono";
import { users, usersToGames } from "./db/schema/users";
import { eq } from "drizzle-orm";
import { IGDBGame, IGDBGameSchemaArray } from "./types/games";
import { GameInsert, games } from "./db/schema/games";
import { uuidv4 } from "./util/generate-uuid";
import { drizzleClient } from "./db";

type Bindings = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.text("Hello Hono!"));

app.post("/test", async (c) => {
	const body = await c.req.json();
	console.log(body.name);
	return c.text(`Hello ${body.name}!`);
});

app.get("/collections/:userId", async (c) => {
	const { userId } = c.req.param();
	const db = drizzleClient(c.env.DATABASE_URL);
	console.log(userId);
	const userCollection = await db
		.select()
		.from(usersToGames)
		.where(eq(usersToGames.userId, userId));

	return c.json(userCollection);
});

// Right, lets do this. Post all of a game's data
app.post("/games", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);
	const json = await c.req.json();
	let parsedGames: IGDBGame[] = [];
	try {
		parsedGames = IGDBGameSchemaArray.parse(json);
	} catch (e) {
		console.error(e);
	}
	let values: GameInsert[] = [];
	parsedGames.forEach((game) =>
		values.push({
			id: `game_${uuidv4()}`,
			gameId: game.id,
			title: game.name,
		}),
	);
	const postedGames = await db.insert(games).values(values);
	return c.json(postedGames);
});

export default app;
