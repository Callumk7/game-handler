import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { games } from "./games";
import { activity } from "./activity";
import { notes } from "./notes";

export const playlists = pgTable("playlists", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	creatorId: text("creator_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull(),
	isPrivate: boolean("is_private").default(false).notNull(),
	creatorHasPinned: boolean("creator_has_pinned").default(false).notNull(),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
	creator: one(users, {
		fields: [playlists.creatorId],
		references: [users.id],
	}),
	games: many(gamesOnPlaylists),
	followers: many(followers),
	comments: many(playlistComments),
	activity: many(activity),
	notes: many(notes),
	tags: many(tagsToPlaylists),
}));

export const followers = pgTable(
	"followers",
	{
		userId: text("user_id").notNull(),
		playlistId: text("playlist_id").notNull(),
		rating: integer("rating"),
		pinned: boolean("pinned").notNull().default(false),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.playlistId] }),
	}),
);

export const followersRelations = relations(followers, ({ one }) => ({
	playlist: one(playlists, {
		fields: [followers.playlistId],
		references: [playlists.id],
	}),
	follower: one(users, {
		fields: [followers.userId],
		references: [users.id],
	}),
}));

export const gamesOnPlaylists = pgTable(
	"games_on_playlists",
	{
		gameId: integer("game_id").notNull(),
		playlistId: text("playlist_id").notNull(),
		addedBy: text("added_by").notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.gameId, t.playlistId] }),
	}),
);

export const gamesOnPlaylistsRelations = relations(gamesOnPlaylists, ({ one }) => ({
	game: one(games, {
		fields: [gamesOnPlaylists.gameId],
		references: [games.gameId],
	}),
	playlist: one(playlists, {
		fields: [gamesOnPlaylists.playlistId],
		references: [playlists.id],
	}),
	addedBy: one(users, {
		fields: [gamesOnPlaylists.addedBy],
		references: [users.id],
	}),
}));

// DEPRECIATED DO NOT USE
export const playlistComments = pgTable("playlist_comments", {
	id: text("id").primaryKey().notNull(),
	authorId: text("author_id").notNull(),
	playlistId: text("playlist_id").notNull(),
	body: text("body").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull(),
});

export const playlistCommentsRelations = relations(playlistComments, ({ one, many }) => ({
	playlist: one(playlists, {
		fields: [playlistComments.playlistId],
		references: [playlists.id],
	}),
	author: one(users, {
		fields: [playlistComments.authorId],
		references: [users.id],
	}),
	activity: many(activity),
}));

export const tags = pgTable("tags", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
	playlists: many(tagsToPlaylists),
}));

export const tagsToPlaylists = pgTable(
	"tags_to_playlists",
	{
		tagId: text("tag_id").notNull(),
		playlistId: text("playlist_id").notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.tagId, t.playlistId] }),
	}),
);

export const tagsToPlaylistsRelations = relations(tagsToPlaylists, ({ one }) => ({
	tag: one(tags, {
		fields: [tagsToPlaylists.tagId],
		references: [tags.id],
	}),
	playlist: one(playlists, {
		fields: [tagsToPlaylists.playlistId],
		references: [playlists.id],
	}),
}));
