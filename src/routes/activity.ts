import { Hono } from "hono";
import { Bindings } from "../types/bindings";

const app = new Hono<{ Bindings: Bindings }>();

// ACTIVITY
app.get("/", (c) => c.text("This is the activity endpoint."));
