import {
	ArtworkInsert,
	CoverInsert,
	GameInsert,
	ScreenshotInsert,
} from "../db/schema/games";
import { IGDBGame } from "../types/games";
import { uuidv4 } from "./generate-uuid";

export const createDbInserts = (
	validGame: IGDBGame,
): [GameInsert, CoverInsert[], ArtworkInsert[], ScreenshotInsert[]] => {
	const coverInsert: CoverInsert[] = [];
	const artworkInsert: ArtworkInsert[] = [];
	const screenshotInsert: ScreenshotInsert[] = [];
	let gameInsert: GameInsert = {
		id: `game_${uuidv4()}`,
		title: validGame.name,
		gameId: validGame.id,
	};

	if (validGame.storyline) {
		gameInsert.storyline = validGame.storyline;
	}

	if (validGame.follows) {
		gameInsert.externalFollows = validGame.follows;
	}

	if (validGame.aggregated_rating) {
		gameInsert.aggregatedRating = Math.floor(validGame.aggregated_rating);
	}

	if (validGame.aggregated_rating_count) {
		gameInsert.aggregatedRatingCount = validGame.aggregated_rating_count;
	}

	if (validGame.rating) {
		gameInsert.rating = Math.floor(validGame.rating);
	}

	if (validGame.first_release_date) {
		gameInsert.firstReleaseDate = new Date(
			validGame.first_release_date * 1000,
		);
	}

	if (validGame.cover) {
		coverInsert.push({
			id: `cover_${uuidv4()}`,
			gameId: validGame.id,
			imageId: validGame.cover.image_id,
		});
	}

	if (validGame.artworks) {
		validGame.artworks.forEach((artwork) => {
			artworkInsert.push({
				id: `artwork_${uuidv4()}`,
				gameId: validGame.id,
				imageId: artwork.image_id,
			});
		});
	}

	if (validGame.screenshots) {
		validGame.screenshots.forEach((screenshot) => {
			screenshotInsert.push({
				id: `screenshot_${uuidv4()}`,
				gameId: validGame.id,
				imageId: screenshot.image_id,
			});
		});
	}

	return [gameInsert, coverInsert, artworkInsert, screenshotInsert];
};
