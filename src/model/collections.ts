import { Drizzle } from "@/db";
import { usersToGames } from "@/db/schema/games";
import { eq } from "drizzle-orm";

export const getUserCollection = async (db: Drizzle, userId: string) => {
	const userCollection = await db.query.usersToGames
		.findMany({
			where: eq(usersToGames.userId, userId),
			with: {
				game: true,
			},
			columns: {},
		})
		.then((res) => res.map((game) => game.game));

	return userCollection;
};
