import { avg, count, eq, isNotNull, relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { gamesOnPlaylists } from "./playlists";
import { users } from "./users";
import { activity } from "./activity";
import { notes } from "./notes";

export const games = pgTable("games", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").unique().notNull(),
	title: text("title").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull(),
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
	activity: many(activity),
	notes: many(notes),
}));

export const covers = pgTable("covers", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull(),
});

export const artworks = pgTable("artworks", {
	id: text("id").primaryKey(),
	gameId: integer("game_id").notNull(),
	imageId: text("image_id").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull(),
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
	isUpdated: boolean("is_updated").default(false).notNull(),
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
	isUpdated: boolean("is_updated").default(false).notNull(),
});

export const genresRelations = relations(genres, ({ many }) => ({
	games: many(genresToGames),
}));

export const genresToGames = pgTable(
	"genres_to_games",
	{
		genreId: integer("genre_id").notNull(),
		gameId: integer("game_id").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		isUpdated: boolean("is_updated").default(false).notNull(),
	},

	(t) => ({
		pk: primaryKey({ columns: [t.genreId, t.gameId] }),
	}),
);

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

export const playedStatusEnum = pgEnum("played_status", [
	"not_started",
	"played",
	"completed",
]);

export const usersToGames = pgTable(
	"users_to_games",
	{
		userId: text("user_id").notNull(),
		gameId: integer("game_id").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		isUpdated: boolean("is_updated").default(false).notNull(),
		played: boolean("played").default(false).notNull(),
		playerRating: integer("player_rating"),
		completed: boolean("completed").default(false).notNull(),
		position: integer("position"),
		pinned: boolean("pinned").notNull().default(false),
		status: playedStatusEnum("played_status").notNull().default("not_started"),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.gameId] }),
	}),
);

export const usersToGamesRelations = relations(usersToGames, ({ one, many }) => ({
	user: one(users, {
		fields: [usersToGames.userId],
		references: [users.id],
	}),
	game: one(games, {
		fields: [usersToGames.gameId],
		references: [games.gameId],
	}),
	comments: many(notes),
}));
