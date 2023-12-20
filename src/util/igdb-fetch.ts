interface FetchOptions {
	fields?: string[] | "full";
	limit?: number;
	filters?: string[];
	sort?: string[];
	search?: string;
}

export const fetchGamesFromIGDB = async (
	baseUrl: string,
	options: FetchOptions,
	FULL_GAME_FIELDS = "fields name, artworks.image_id, screenshots.image_id, aggregated_rating, aggregated_rating_count, cover.image_id, storyline, first_release_date, genres.name, follows, involved_companies, rating;",
	headersOverride?: Record<string, string>,
): Promise<unknown[]> => {
	let body = "";

	if (options.search) {
		body += `search "${options.search}";`;
	}

	if (options.fields) {
		if (options.fields === "full") {
			body += FULL_GAME_FIELDS;
		} else {
			body += `fields ${options.fields.join(", ")};`;
		}
	}

	if (options.limit) {
		body += `limit ${options.limit};`;
	}

	if (options.filters) {
		body += `where ${options.filters.join("& ")};`;
	}
	console.log(body);

	if (options.sort) {
		body += `sort ${options.sort.join(", ")};`;
	}

	// TODO: Add pagination

	let headers: Record<string, string> = {
		"Client-ID": process.env.IGDB_CLIENT_ID!,
		Authorization: `Bearer ${process.env.IGDB_BEARER_TOKEN!}`,
		"content-type": "text/plain",
	};

	if (headersOverride) {
		headers = headersOverride;
	}

	try {
		const res = await fetch(baseUrl, { method: "POST", headers, body });
		const json = await res.json();
		return json as unknown[];
	} catch (e) {
		console.error(e);
		throw new Error("Error fetching games from IGDB");
	}
};
