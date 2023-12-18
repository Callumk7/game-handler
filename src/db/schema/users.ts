import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { games } from "./games";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isUpdated: boolean("is_updated").default(false),
  profilePicture: text("profile_picture"),
  // playlists
  // comments
  // followedPlaylists
});

export const usersRelations = relations(users, ({ many }) => ({
  games: many(usersToGames),
}));

export const usersToGames = pgTable(
  "users_to_games",
  {
    userId: text("user_id"),
    gameId: integer("game_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    isUpdated: boolean("is_updated").default(false),
    played: boolean("played").default(false),
    playerRating: integer("player_rating"),
    completed: boolean("completed").default(false),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.gameId),
  }),
);

export const usersToGamesRelations = relations(usersToGames, ({ one }) => ({
  user: one(users, {
    fields: [usersToGames.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [usersToGames.gameId],
    references: [games.gameId],
  }),
}));
