import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { usersToGames } from "./users";
import { gamesOnPlaylists } from "./playlists";

export const games = pgTable("games", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").unique().notNull(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
	follows: integer("follows").default(0).notNull(),
	storyline: text("storyline"),
	firstReleaseDate: timestamp("first_release_date"),
	externalFollows: integer("external_follows"),
});

export const gamesRelations = relations(games, ({ one, many }) => ({
	cover: one(covers, {
		fields: [games.gameId],
		references: [covers.gameId],
	}),
	artworks: many(artworks),
	screenshots: many(screenshots),
	users: many(usersToGames),
	playlists: many(gamesOnPlaylists),
}));

export const covers = pgTable("covers", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
});

export const artworks = pgTable("artworks", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
});

export const artworksRelations = relations(artworks, ({ one }) => ({
	game: one(games, {
		fields: [artworks.gameId],
		references: [games.gameId],
	}),
}));

export const screenshots = pgTable("screenshots", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
});

export const screenshotsRelations = relations(screenshots, ({ one }) => ({
	game: one(games, {
		fields: [screenshots.gameId],
		references: [games.gameId],
	}),
}));

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
