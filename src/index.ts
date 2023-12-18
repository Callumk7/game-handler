import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import playlistsRoute from "./routes/playlists";
import gamesRoute from "./routes/games";

type Bindings = {
	DATABASE_URL: string;
};

// Bearer token for testing
const token = "playqIsCool";

const app = new Hono<{ Bindings: Bindings }>();
app.get("/", (c) => c.text("Hello Hono!"));

// PLAYLISTS
app.route("/playlists", playlistsRoute);

// GAMES
app.use("/games", bearerAuth({ token }));
app.route("/games", gamesRoute);

export default app;
