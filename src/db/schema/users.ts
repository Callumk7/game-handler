import { relations } from "drizzle-orm";
import { boolean, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { usersToGames } from "./games";
import { followers, playlists } from "./playlists";
import { activity } from "./activity";
import { notes } from "./notes";

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	username: text("username").notNull().unique(),
	password: text("password").notNull(),
	email: text("email").notNull().unique(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
	isUpdated: boolean("is_updated").default(false).notNull(),
	profilePicture: text("profile_picture"),
});

export const usersRelations = relations(users, ({ many }) => ({
	games: many(usersToGames),
	friends: many(friends, {
		relationName: "friend",
	}),
	friendsOf: many(friends, {
		relationName: "user",
	}),
	playlists: many(playlists),
	playlistFollows: many(followers),
	activity: many(activity),
	commentsMade: many(notes, {
		relationName: "author",
	}),
	profileComments: many(notes, {
		relationName: "profile",
	}),
}));

export const friends = pgTable(
	"friends",
	{
		userId: text("user_id").notNull(),
		friendId: text("friend_id").notNull(),
	},

	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.friendId] }),
	}),
);

export const friendsRelations = relations(friends, ({ one }) => ({
	user: one(users, {
		fields: [friends.userId],
		references: [users.id],
		relationName: "user",
	}),
	friend: one(users, {
		fields: [friends.friendId],
		references: [users.id],
		relationName: "friend",
	}),
}));
