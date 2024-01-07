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
	rating: integer("rating"),
	aggregatedRating: integer("aggregated_rating"),
	aggregatedRatingCount: integer("aggregated_rating_count"),
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
	genres: many(genresToGames),
}));

export const covers = pgTable("covers", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
});

export const artworks = pgTable("artworks", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull().unique(),
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
	imageId: text("image_id").notNull().unique(),
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

export const genres = pgTable("genres", {
	id: integer("id").primaryKey(), // Using the IGDB id as the primary key
	name: text("name").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
});

export const genresRelations = relations(genres, ({ many }) => ({
	games: many(genresToGames),
}));

export const genresToGames = pgTable("genres_to_games", {
	genreId: integer("genre_id").notNull(),
	gameId: integer("game_id").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false),
});

export const genresToGamesRelations = relations(genresToGames, ({ one }) => ({
	genre: one(genres, {
		fields: [genresToGames.genreId],
		references: [genres.id],
	}),
	game: one(games, {
		fields: [genresToGames.gameId],
		references: [games.gameId],
	}),
}));

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;

export type Cover = typeof covers.$inferSelect;
export type CoverInsert = typeof covers.$inferInsert;

export type Artwork = typeof artworks.$inferSelect;
export type ArtworkInsert = typeof artworks.$inferInsert;

export type Screenshot = typeof screenshots.$inferSelect;
export type ScreenshotInsert = typeof screenshots.$inferInsert;

export type Genre = typeof genres.$inferSelect;
export type GenreInsert = typeof genres.$inferInsert;

export type GenreToGame = typeof genresToGames.$inferSelect;
export type GenreToGameInsert = typeof genresToGames.$inferInsert;
