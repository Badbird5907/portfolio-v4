import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import Badge from "@/components/badge";
import ContributionGraph from "@/components/contribution-graph";
import PageShell, {
	IVORY,
	MiniLabel,
	underline,
} from "@/components/page-shell";
import Polaroid from "@/components/polaroid";
import Reveal, { revealProps } from "@/components/reveal";
import WritingList from "@/components/writing-list";
import { getContributionsServerFn } from "@/lib/contributions-server";
import { allPosts } from "@/lib/posts";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
	component: HomePage,
	loader: () => getContributionsServerFn(),
	// The server fn caches for an hour; don't re-RPC on every client navigation
	staleTime: 60 * 60 * 1000,
	preloadStaleTime: 60 * 60 * 1000,
});

const workRows = [
	{
		years: "2026–Present",
		org: "The Relationship Company",
		role: "Product Engineer",
		url: "https://relationship.co/",
	},
	{
		years: "2024–26",
		org: "Connect",
		role: "Founding Software Engineer",
		url: "https://connectalum.com/",
	},
	{
		years: "2022–25",
		org: "Freelancing",
		role: "Software & infrastructure for clients",
	},
];

function HomePage() {
	const { theme } = useTheme();
	const contributions = Route.useLoaderData();
	const posts = allPosts.slice(0, 2);

	return (
		<PageShell wide>
			<div className="grid flex-1 content-center gap-x-10 gap-y-14 py-12 lg:grid-cols-12">
				{/* Prose + GitHub */}
				<div className="space-y-12 lg:col-span-5">
					<Reveal
						delay={0.15}
						className="space-y-5 text-[15px] leading-[1.8] md:text-base"
					>
						<p>
							As a full-stack software engineer, I'm passionate about building
							impactful and meaningful products. I'm currently doing that at{" "}
							<a
								href="https://relationship.co/"
								target="_blank"
								rel="noopener noreferrer"
								className={underline}
								style={{ color: IVORY }}
							>
								The Relationship Company
							</a>
							, working on a consumer mobile app and an AI messaging agent.
							Before that I was the founding engineer at{" "}
							<a
								href="https://connectalum.com/"
								target="_blank"
								rel="noopener noreferrer"
								className={underline}
								style={{ color: IVORY }}
							>
								Connect
							</a>
							, growing an alumni platform past 9,000 monthly users.
						</p>
						<p>
							I study mathematics at the University of Toronto, actively seek
							out new learning experiences, and enjoy competing in{" "}
							<Link
								to="/hackathons"
								className={underline}
								style={{ color: IVORY }}
							>
								hackathons
							</Link>
							<sup>*</sup> — I've won six of the ten I've entered. I also write
							the occasional{" "}
							<Link to="/blog" className={underline} style={{ color: IVORY }}>
								blog post
							</Link>
							.
						</p>
						<p className="pt-1 font-mono text-[11px] leading-relaxed tracking-wide text-white/45">
							* most recently TreeHacks 2026 @ Stanford, where I built Minerva,
							an AI video tutor that won both 1st in the Education track and
							Best Creation with HeyGen API.
						</p>
					</Reveal>

					<Reveal delay={0.3}>
						<MiniLabel>GitHub</MiniLabel>
						<ContributionGraph initialDays={contributions} />
					</Reveal>
				</div>

				{/* Work + writing + contact */}
				<div className="space-y-12 lg:col-span-3 lg:col-start-6">
					<Reveal delay={0.25}>
						<MiniLabel>Work</MiniLabel>
						<ul>
							{workRows.map((row, i) => (
								<motion.li
									key={row.org}
									{...revealProps(theme, 0.35 + i * 0.1)}
									whileHover={{ x: 4 }}
									className="flex items-baseline justify-between gap-4 border-t border-white/15 py-2.5"
								>
									<div className="min-w-0">
										<p
											className="truncate text-[14px]"
											style={{ color: IVORY }}
										>
											{row.url ? (
												<a
													href={row.url}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:underline underline-offset-[3px]"
												>
													{row.org}
												</a>
											) : (
												row.org
											)}
										</p>
										<p className="text-[12px] text-white/50">{row.role}</p>
									</div>
									<span className="shrink-0 font-mono text-[11px] tabular-nums text-white/50">
										{row.years}
									</span>
								</motion.li>
							))}
						</ul>
					</Reveal>

					{posts.length > 0 && (
						<Reveal delay={0.45}>
							<MiniLabel>Writing</MiniLabel>
							<WritingList posts={posts} />
						</Reveal>
					)}

					<Reveal delay={0.55}>
						<MiniLabel>Contact</MiniLabel>
						<p className="border-t border-white/15 pt-3">
							<a
								href="mailto:contact@evanyu.dev"
								className={`text-lg ${underline}`}
								style={{ color: IVORY }}
							>
								contact@evanyu.dev
							</a>
						</p>
					</Reveal>
				</div>

				{/* Photos + badge */}
				<Reveal
					delay={0.4}
					className="flex flex-wrap items-center justify-center gap-6 lg:col-span-3 lg:col-start-10 lg:block"
				>
					<Polaroid
						src="/img/about/me.png"
						alt="Evan Yu"
						caption="fig. 01 — me"
						rotate={3}
						revealDelay={300}
						className="relative z-10"
					/>
					<Polaroid
						src="/img/about/toronto.png"
						alt="Toronto skyline"
						caption="fig. 02 — home"
						rotate={-4}
						float={1}
						revealDelay={450}
						className="lg:-mt-10 lg:ml-20"
					/>
					<div className="hidden lg:-mt-2 lg:ml-2 lg:block">
						<Badge />
					</div>
				</Reveal>
			</div>
		</PageShell>
	);
}
