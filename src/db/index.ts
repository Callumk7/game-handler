import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as gamesSchema from "./schema/games";
import * as usersSchema from "./schema/users";
import * as playlistsSchema from "./schema/playlists";

export const drizzleClient = (DATABASE_URL: string) => {
	const pg = postgres(DATABASE_URL);
	return drizzle(pg, {
		schema: { ...usersSchema, ...gamesSchema, ...playlistsSchema },
	});
};

export type Drizzle = ReturnType<typeof drizzleClient>;
