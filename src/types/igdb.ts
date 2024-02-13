import { z } from "zod";

export const genreType = z.object({
	id: z.number(),
	name: z.string(),
});

const screenshotType = z.object({
	id: z.number(),
	image_id: z.string(),
});

const artworkType = z.object({
	id: z.number(),
	image_id: z.string(),
});

export const coverType = z.object({
	id: z.number(),
	image_id: z.string(),
});

export const IGDBGameSchema = z.object({
	id: z.number(),
	genres: z.array(genreType).optional(),
	name: z.string(),
	cover: coverType,
	storyline: z.string().optional(),
	screenshots: z.array(screenshotType).optional(),
	artworks: z.array(artworkType).optional(),
	follows: z.number().optional(),
	rating: z.number().optional(),
	aggregated_rating: z.number().optional(),
	aggregated_rating_count: z.number().optional(),
	involved_companies: z.array(z.number()).optional(),
	first_release_date: z.number().optional(),
	saved: z.boolean().optional(),
});

export const IGDBGameNoArtworkSchema = IGDBGameSchema.omit({
	artworks: true,
	screenshots: true,
});

export const IGDBGameSchemaArray = z.array(IGDBGameSchema);
export const IGDBGameNoArtworkSchemaArray = z.array(IGDBGameNoArtworkSchema);

export type IGDBGame = z.infer<typeof IGDBGameSchema>;
export type IGDBGameNoArtwork = z.infer<typeof IGDBGameNoArtworkSchema>;

export type IGDBGenre = z.infer<typeof genreType>;

export type IGDBImage =
	| "cover_small"
	| "screenshot_med"
	| "cover_big"
	| "logo_med"
	| "screenshot_big"
	| "screenshot_huge"
	| "thumb"
	| "micro"
	| "720p"
	| "1080p";
