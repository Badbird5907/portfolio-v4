import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import PageShell, { IVORY, MiniLabel } from "@/components/page-shell";
import Reveal from "@/components/reveal";
import { type Hackathon, hackathons } from "@/lib/hackathons";

export const Route = createFileRoute("/hackathons/")({
	head: () => ({
		meta: [
			{ title: "Hackathons | Evan Yu" },
			{
				name: "description",
				content: "A complete list of all hackathons I've attended.",
			},
		],
	}),
	component: HackathonsPage,
});

type SortOption = "recency" | "oldest" | "wins" | "name";

const sortOptions: {
	value: SortOption;
	label: string;
	fn: (a: Hackathon, b: Hackathon) => number;
}[] = [
	{
		value: "recency",
		label: "Most Recent",
		fn: (a, b) => b.fullDate.getTime() - a.fullDate.getTime(),
	},
	{
		value: "oldest",
		label: "Oldest",
		fn: (a, b) => a.fullDate.getTime() - b.fullDate.getTime(),
	},
	{
		value: "wins",
		label: "Awards",
		fn: (a, b) => {
			const aHasAward = a.award ? 1 : 0;
			const bHasAward = b.award ? 1 : 0;
			if (bHasAward !== aHasAward) return bHasAward - aHasAward;
			return b.fullDate.getTime() - a.fullDate.getTime();
		},
	},
	{ value: "name", label: "Name", fn: (a, b) => a.name.localeCompare(b.name) },
];

const stats = [
	{ value: hackathons.length, label: "Attended" },
	{ value: hackathons.filter((h) => h.award).length, label: "Awards" },
	{
		value: hackathons.filter((h) => h.award?.includes("Place")).length,
		label: "Top 3 finishes",
	},
	{ value: new Date().getFullYear() - 2024 + 1, label: "Years active" },
];

function HackathonsPage() {
	const [sortBy, setSortBy] = useState<SortOption>("recency");

	const sorted = useMemo(() => {
		const sortFn = sortOptions.find((opt) => opt.value === sortBy)?.fn;
		return sortFn ? [...hackathons].sort(sortFn) : hackathons;
	}, [sortBy]);

	return (
		<PageShell>
			<main className="flex-1 py-14">
				<Reveal delay={0.1}>
					<MiniLabel>Index</MiniLabel>
					<h2
						className="font-serif text-4xl md:text-5xl"
						style={{ color: IVORY }}
					>
						Hackathons
					</h2>
					<p className="mt-3 text-[15px] text-white/50">
						A complete list of all hackathons I've attended over the last few
						years.
					</p>
				</Reveal>

				<Reveal
					delay={0.2}
					className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono text-[11px] tracking-wide"
				>
					<span className="uppercase tracking-[0.18em] text-white/45">
						Sort by
					</span>
					{sortOptions.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => setSortBy(option.value)}
							className={`cursor-pointer transition-colors underline-offset-[3px] ${
								sortBy === option.value
									? "text-[#f1eee7] underline"
									: "text-white/50 hover:text-white"
							}`}
						>
							{option.label}
						</button>
					))}
				</Reveal>

				<div className="mt-6">
					{sorted.map((hackathon, i) => (
						<Reveal key={hackathon.slug} delay={0.25 + Math.min(i, 8) * 0.05}>
							<article className="border-t border-white/15 py-5">
								<div className="flex flex-wrap items-baseline justify-between gap-x-4">
									<h3 className="font-serif text-xl" style={{ color: IVORY }}>
										<a
											href={hackathon.url}
											target="_blank"
											rel="noopener noreferrer"
											className="underline-offset-[3px] decoration-white/40 hover:underline"
										>
											{hackathon.name}
										</a>
									</h3>
									<span className="shrink-0 font-mono text-[11px] tabular-nums tracking-wide text-white/50">
										{hackathon.date}
									</span>
								</div>
								{(hackathon.award || hackathon.location) && (
									<p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-wide">
										{hackathon.award && (
											<span style={{ color: IVORY }}>
												{hackathon.award.includes("🏆")
													? hackathon.award
													: `🎖 ${hackathon.award}`}
											</span>
										)}
										{hackathon.location && (
											<span className="inline-flex items-center gap-1 text-white/45">
												<MapPin className="size-3" />
												{hackathon.location}
											</span>
										)}
									</p>
								)}
								<p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
									{hackathon.description}
								</p>
								{hackathon.links && hackathon.links.length > 0 && (
									<p className="mt-2 flex flex-wrap gap-x-4 font-mono text-[11px] tracking-wide">
										{hackathon.links.map((link) => (
											<a
												key={link.url}
												href={link.url}
												target="_blank"
												rel="noopener noreferrer"
												className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
											>
												{link.label} ↗
											</a>
										))}
									</p>
								)}
							</article>
						</Reveal>
					))}
				</div>

				<Reveal
					delay={0.5}
					className="mt-4 grid grid-cols-2 gap-6 border-t border-white/15 pt-6 md:grid-cols-4"
				>
					{stats.map((stat) => (
						<div key={stat.label}>
							<p className="font-serif text-2xl" style={{ color: IVORY }}>
								{stat.value}
							</p>
							<p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
								{stat.label}
							</p>
						</div>
					))}
				</Reveal>
			</main>
		</PageShell>
	);
}
