import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { playlistComments, playlists } from "./playlists";
import { games } from "./games";
import { notes } from "./notes";

export const typeEnum = pgEnum("activity_type", [
	"pl_create",
	"pl_add_game",
	"pl_remove_game",
	"pl_follow",
	"col_add",
	"col_remove",
	"comment_add",
	"game_played",
	"game_completed",
	"game_rated",
]);

export const activity = pgTable("activity", {
	id: text("id").primaryKey().notNull(),
	type: typeEnum("type").notNull(),
	timestamp: timestamp("timestamp").notNull().defaultNow(),
	userId: text("user_id").notNull(),
	playlistId: text("playlist_id"),
	gameId: integer("game_id"),
	commentId: text("comment_id"),
	noteId: text("note_id"),
	rating: integer("rating"),
});

export const activityRelations = relations(activity, ({ one }) => ({
	user: one(users, {
		fields: [activity.userId],
		references: [users.id],
	}),
	playlist: one(playlists, {
		fields: [activity.playlistId],
		references: [playlists.id],
	}),
	game: one(games, {
		fields: [activity.gameId],
		references: [games.gameId],
	}),
	comment: one(playlistComments, {
		fields: [activity.commentId],
		references: [playlistComments.id],
	}),
	note: one(notes, {
		fields: [activity.noteId],
		references: [notes.id]
	})
}));
