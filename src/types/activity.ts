import { activity } from "@/db/schema/activity";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const activityInsertSchema = createInsertSchema(activity);
export const activitySelectScema = createSelectSchema(activity);

export type Activity = z.infer<typeof activitySelectScema>;
export type InsertActivity = z.infer<typeof activityInsertSchema>;
