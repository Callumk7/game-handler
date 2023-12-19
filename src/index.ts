import { Hono } from "hono";
import { cors } from "hono/cors";

import playlistsRoute from "./routes/playlists";
import gamesRoute from "./routes/games";

type Bindings = {
	DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());
app.get("/", (c) => c.text("Hello Hono!"));

// PLAYLISTS
app.route("/playlists", playlistsRoute);

// GAMES
app.route("/games", gamesRoute);

export default app;
