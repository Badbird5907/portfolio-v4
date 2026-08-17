import { createServerFn } from "@tanstack/react-start";

export type Day = {
	date: string;
	count: number;
	level: 0 | 1 | 2 | 3 | 4;
};

export const GITHUB_USER = "Badbird5907";

export const CONTRIBUTIONS_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=all`;

const TTL = 60 * 60 * 1000;

let cache: { fetchedAt: number; days: Day[] } | null = null;
let refreshing: Promise<void> | null = null;

const fetchDays = async (): Promise<Day[]> => {
	const res = await fetch(CONTRIBUTIONS_URL, {
		signal: AbortSignal.timeout(4000),
	});
	if (!res.ok) throw new Error(`contributions API ${res.status}`);
	const data: { contributions: Day[] } = await res.json();
	// The API returns newest-year-first; sort chronologically
	return [...data.contributions].sort((a, b) => a.date.localeCompare(b.date));
};

export const getContributionsServerFn = createServerFn().handler(
	async (): Promise<Day[] | null> => {
		if (cache && Date.now() - cache.fetchedAt < TTL) return cache.days;
		if (cache) {
			// Stale: serve it now, refresh in the background so SSR never blocks
			if (!refreshing) {
				refreshing = fetchDays()
					.then((days) => {
						cache = { fetchedAt: Date.now(), days };
					})
					.catch(() => {})
					.finally(() => {
						refreshing = null;
					});
			}
			return cache.days;
		}
		try {
			const days = await fetchDays();
			cache = { fetchedAt: Date.now(), days };
			return days;
		} catch {
			// Cold cache and API down — client falls back to its own fetch
			return null;
		}
	},
);
