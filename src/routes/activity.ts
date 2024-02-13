import { Hono } from "hono";
import { Bindings } from "../types/bindings";
import { drizzleClient } from "@/db";
import { returnErrorIfNotArray } from "@/util/validation";
import { InsertActivity, activityInsertSchema } from "@/types/activity";
import { activity } from "@/db/schema/activity";

const app = new Hono<{ Bindings: Bindings }>();

// ACTIVITY
app.get("/", (c) => c.text("This is the activity endpoint."));

// endpoint takes a single insert for activity.
app.post("/", async (c) => {
	const db = drizzleClient(c.env.DATABASE_URL);
	const json = await c.req.json();
	// validate the shape of the json
	let activityInsert: InsertActivity;
	try {
		activityInsert = activityInsertSchema.parse(json);
	} catch (err) {
		return c.json(err, 400);
	}

	const newActivity = await db.insert(activity).values(activityInsert);
	return c.json(newActivity, 200);
});

export default app;
