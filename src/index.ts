import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Fetcher } from "@cloudflare/workers-types";

import playlistsRoute from "./routes/playlists";
import gamesRoute from "./routes/games";
import coversRoute from "./routes/covers";

type Bindings = {
	DATABASE_URL: string;
	router: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());
app.get("/", (c) => c.text("Hello Hono!"));

// PLAYLISTS
app.route("/playlists", playlistsRoute);

// GAMES
app.route("/games", gamesRoute);

// COVERS
app.route("/covers", coversRoute);

// TESTING
app.get("/test", async (c) => {
	const serviceResponse = await c.env.router.fetch(
		new Request("https://example.com"),
	);
	return c.json({ message: "nice one partner" });
});

export default app;
