import { createServerFn } from "@tanstack/react-start";

export type Day = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
};

export const GITHUB_USER = "Badbird5907";

export const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=all`;

const TTL = 60 * 60 * 1000;

// Per-instance memory cache. On Cloudflare Workers each isolate has its own
// copy, so the cf options below also cache the response at the PoP — a cold
// isolate pays a local cache hit instead of an origin round trip.
let cache: { fetchedAt: number; days: Day[] } | null = null;

const fetchDays = async (): Promise<Day[]> => {
	const res = await fetch(CONTRIBUTIONS_URL, {
		signal: AbortSignal.timeout(4000),
		// Workers-only edge cache hint; unknown properties are ignored on Node
		cf: { cacheTtl: TTL / 1000, cacheEverything: true },
	} as RequestInit);
	if (!res.ok) throw new Error(`contributions API ${res.status}`);
	const data: { contributions: Day[] } = await res.json();
	// The API returns newest-year-first; sort chronologically
	return [...data.contributions].sort((a, b) => a.date.localeCompare(b.date));
};

export const getContributionsServerFn = createServerFn().handler(
	async (): Promise<Day[] | null> => {
		// No fire-and-forget refresh here: Workers cancels pending I/O once the
		// response returns, so the refetch must be awaited.
		if (cache && Date.now() - cache.fetchedAt < TTL) return cache.days;
		try {
			const days = await fetchDays();
			cache = { fetchedAt: Date.now(), days };
			return days;
		} catch {
			// Serve stale on failure; null only when cold and the API is down
			// (the client then falls back to fetching directly)
			return cache?.days ?? null;
		}
	},
);
