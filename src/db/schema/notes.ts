import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { games, usersToGames } from "./games";
import { playlists } from "./playlists";

export const locationEnum = pgEnum("parent_type", [
	"collection",
	"playlist",
	"profile",
	"game",
	"note",
]);

export const notes = pgTable("notes", {
	id: text("id").primaryKey(),
	content: text("content").notNull(),
	authorId: text("author_id").notNull(),
	location: locationEnum("location"),
	collectionId: text("collection_id"),
	gameId: integer("game_id"),
	playlistId: text("playlist_id"),
	noteId: text("note_id"),
	profileId: text("profile_id"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull().notNull(),
});

export const notesRelations = relations(notes, ({ one }) => ({
	author: one(users, {
		fields: [notes.authorId],
		references: [users.id],
		relationName: "author",
	}),
	playlist: one(playlists, {
		fields: [notes.playlistId],
		references: [playlists.id],
	}),
	collection: one(usersToGames, {
		fields: [notes.collectionId, notes.gameId],
		references: [usersToGames.userId, usersToGames.gameId],
	}),
	profile: one(users, {
		fields: [notes.profileId],
		references: [users.id],
		relationName: "profile",
	}),
	game: one(games, {
		fields: [notes.gameId],
		references: [games.gameId],
	}),
	note: one(notes, {
		fields: [notes.id],
		references: [notes.noteId]
	})
}));
