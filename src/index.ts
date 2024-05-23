import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings } from "./types/bindings";

import playlistsRoute from "./routes/playlists";
import gamesRoute from "./routes/games";
import coversRoute from "./routes/covers";
import activityRoute from "./routes/activity";

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());
app.get("/", (c) => c.text("Hello Hono!"));

// PLAYLISTS
app.route("/playlists", playlistsRoute);

// GAMES
app.route("/games", gamesRoute);

// COVERS
app.route("/covers", coversRoute);

// ACTIVITY
app.route("/activity", activityRoute);

export default app;
