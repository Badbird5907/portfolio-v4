// biome-ignore-all lint/suspicious/noArrayIndexKey: grid padding/skeleton cells have no identity
import { useEffect, useMemo, useState } from "react";
import {
	CONTRIBUTIONS_URL,
	type Day,
	GITHUB_USER,
} from "@/lib/contributions-server";

const CACHE_KEY = "gh-contributions-v1";
const CACHE_TTL = 60 * 60 * 1000; // revalidate in the background after 1h

type CacheEntry = { fetchedAt: number; days: Day[] };

const readCache = (): CacheEntry | null => {
	try {
		const raw = localStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const parsed: CacheEntry = JSON.parse(raw);
		if (typeof parsed.fetchedAt !== "number" || !Array.isArray(parsed.days))
			return null;
		return parsed;
	} catch {
		return null;
	}
};

const writeCache = (days: Day[]) => {
	try {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ fetchedAt: Date.now(), days } satisfies CacheEntry),
		);
	} catch {
		// storage full or unavailable — cache is best-effort
	}
};

// Opaque equivalents of white at 10/30/50/70/95% over the page background
// (#050507) — solid so the dithered backdrop doesn't show through the cells.
const LEVELS = [
	"bg-[#1e1e20]",
	"bg-[#505051]",
	"bg-[#828283]",
	"bg-[#b4b4b5]",
	"bg-[#f3f3f3]",
];

// Deterministic pseudo-random shades (SSR-safe) so the skeleton reads as a
// graph being loaded rather than a graph with no contributions.
const SKELETON_LEVELS = Array.from({ length: 53 }, (_, week) =>
	Array.from({ length: 7 }, (_, day) => {
		const noise = Math.sin((week * 7 + day + 1) * 12.9898) * 43758.5453;
		const r = noise - Math.floor(noise);
		return r < 0.55 ? 0 : r < 0.8 ? 1 : r < 0.95 ? 2 : 3;
	}),
);

const ContributionGraph = ({
	initialDays = null,
}: {
	initialDays?: Day[] | null;
}) => {
	const [allDays, setAllDays] = useState<Day[] | null>(initialDays);
	const [failed, setFailed] = useState(false);
	const [view, setView] = useState<"last" | string>("last");

	useEffect(() => {
		// Server-cached data arrived with the page — nothing to fetch.
		if (initialDays) return;

		// Fallback path (server fetch failed): stale-while-revalidate against
		// localStorage, refetching only when the cache is older than the TTL.
		const cached = readCache();
		if (cached) setAllDays(cached.days);
		if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return;

		fetch(CONTRIBUTIONS_URL)
			.then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
			.then((data: { contributions: Day[] }) => {
				// The API returns newest-year-first; sort chronologically
				const days = [...data.contributions].sort((a, b) =>
					a.date.localeCompare(b.date),
				);
				setAllDays(days);
				writeCache(days);
			})
			.catch(() => {
				if (!cached) setFailed(true);
			});
	}, [initialDays]);

	const years = useMemo(() => {
		if (!allDays) return [];
		const seen = new Set<string>();
		for (const day of allDays) seen.add(day.date.slice(0, 4));
		return [...seen].sort((a, b) => Number(b) - Number(a));
	}, [allDays]);

	const days = useMemo(() => {
		if (!allDays) return null;
		if (view === "last") {
			// Current year is zero-filled to Dec 31 — clip future days first
			const today = new Date().toISOString().slice(0, 10);
			return allDays.filter((day) => day.date <= today).slice(-365);
		}
		return allDays.filter((day) => day.date.startsWith(view));
	}, [allDays, view]);

	if (failed) {
		return (
			<p className="border-t border-white/15 pt-3 font-mono text-[11px] leading-relaxed tracking-wide text-white/50">
				<a
					href={`https://github.com/${GITHUB_USER}`}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:underline underline-offset-[3px]"
				>
					github.com/{GITHUB_USER} ↗
				</a>
			</p>
		);
	}

	const total = days?.reduce((sum, day) => sum + day.count, 0) ?? 0;

	// Align the first week column to the weekday of the first day
	const cells: (Day | null)[] = days?.length
		? [...Array(new Date(days[0].date).getUTCDay()).fill(null), ...days]
		: [];
	const weeks: (Day | null)[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7));
	}

	return (
		<div className="border-t border-white/15 pt-3">
			<div className="flex w-full gap-[3px]">
				{days
					? weeks.map((week, weekIndex) => (
							<div
								key={week[0]?.date ?? `pad-${weekIndex}`}
								className="flex min-w-0 flex-1 flex-col gap-[3px]"
							>
								{week.map((day, dayIndex) =>
									day ? (
										<div
											key={day.date}
											title={`${day.count} contribution${day.count === 1 ? "" : "s"} — ${day.date}`}
											className={`aspect-square w-full rounded-[2px] ${LEVELS[day.level]}`}
										/>
									) : (
										<div
											key={`empty-${weekIndex}-${dayIndex}`}
											className="aspect-square w-full"
										/>
									),
								)}
							</div>
						))
					: SKELETON_LEVELS.map((week, weekIndex) => (
							<div
								key={`skeleton-${weekIndex}`}
								className="flex min-w-0 flex-1 animate-pulse flex-col gap-[3px] opacity-60"
							>
								{week.map((level, dayIndex) => (
									<div
										key={`skeleton-${weekIndex}-${dayIndex}`}
										className={`aspect-square w-full rounded-[2px] ${LEVELS[level]}`}
									/>
								))}
							</div>
						))}
			</div>
			<div className="mt-3 flex items-baseline justify-between gap-4 font-mono text-[11px] tracking-wide text-white/50">
				<a
					href={`https://github.com/${GITHUB_USER}`}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:underline underline-offset-[3px]"
				>
					{days
						? `${total.toLocaleString()} contributions in ${
								view === "last" ? "the last year" : view
							}`
						: "github"}{" "}
					↗
				</a>
				{years.length > 0 && (
					<span className="relative inline-flex shrink-0 items-center">
						<select
							aria-label="Select year"
							value={view}
							onChange={(event) => setView(event.target.value)}
							className="cursor-pointer appearance-none bg-transparent pr-3 text-right font-mono text-[11px] tracking-wide text-white/50 transition-colors hover:text-white"
						>
							<option value="last" className="bg-zinc-900 text-zinc-200">
								Last Year
							</option>
							{years.map((year) => (
								<option
									key={year}
									value={year}
									className="bg-zinc-900 text-zinc-200"
								>
									{year}
								</option>
							))}
						</select>
						<span
							aria-hidden
							className="pointer-events-none absolute right-0 text-[8px] text-white/40"
						>
							▾
						</span>
					</span>
				)}
			</div>
		</div>
	);
};

export default ContributionGraph;
