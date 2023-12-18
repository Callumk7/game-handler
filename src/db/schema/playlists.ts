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

export const playlists = pgTable("playlists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  creatorId: text("creator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isUpdated: boolean("is_updated").default(false),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  creator: one(users, {
    fields: [playlists.creatorId],
    references: [users.id],
  }),
  games: many(gamesOnPlaylists),
}));

export const gamesOnPlaylists = pgTable(
  "games_on_playlists",
  {
    gameId: integer("game_id").notNull(),
    playlistId: text("playlist_id").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.gameId, t.playlistId),
  }),
);

export const gamesOnPlaylistsRelations = relations(
  gamesOnPlaylists,
  ({ one }) => ({
    game: one(games, {
      fields: [gamesOnPlaylists.gameId],
      references: [games.gameId],
    }),
    playlist: one(playlists, {
      fields: [gamesOnPlaylists.playlistId],
      references: [playlists.id],
    }),
  }),
);

// Inferred Types:
type Playlist = typeof playlists.$inferSelect;
export type { Playlist };
