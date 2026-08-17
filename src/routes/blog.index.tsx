import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import PageShell, { IVORY, MiniLabel } from "@/components/page-shell";
import Reveal, { revealProps } from "@/components/reveal";
import { allPosts, formatPostDate, type Post } from "@/lib/posts";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/blog/")({
	head: () => ({
		meta: [
			{ title: "Blog | Evan Yu" },
			{
				name: "description",
				content:
					"Occasional notes on the things I build, break, and take apart.",
			},
		],
	}),
	component: BlogIndexPage,
});

// Chronological entry number: the oldest post is № 01.
const entryNumber = (post: Post) =>
	String(allPosts.length - allPosts.indexOf(post)).padStart(2, "0");

function BlogIndexPage() {
	const { theme } = useTheme();

	const featured = allPosts.find((p) => p.featured) ?? allPosts[0];
	const rest = allPosts.filter((p) => p !== featured);

	// rest is newest-first, so consecutive years group cleanly
	const yearGroups: [number, Post[]][] = [];
	for (const post of rest) {
		const year = post.date.getUTCFullYear();
		const group = yearGroups.at(-1);
		if (group && group[0] === year) group[1].push(post);
		else yearGroups.push([year, [post]]);
	}

	const years = allPosts.map((p) => p.date.getUTCFullYear());
	const firstYear = Math.min(...years);
	const lastYear = Math.max(...years);

	return (
		<PageShell>
			<main className="flex-1 py-14">
				<Reveal delay={0.1}>
					<MiniLabel>Index</MiniLabel>
					<h2
						className="font-serif text-4xl md:text-5xl"
						style={{ color: IVORY }}
					>
						Writing
					</h2>
					<p className="mt-3 max-w-xl text-[15px] text-white/50">
						Occasional notes on the things I build, break, and take apart.
					</p>
				</Reveal>

				{featured && (
					<Reveal delay={0.2} className="mt-10">
						<Link
							to="/blog/$slug"
							params={{ slug: featured.slug }}
							className="group block"
						>
							{featured.banner && (
								<div className="overflow-hidden rounded-lg border border-white/10 shadow-2xl shadow-black/50">
									<img
										src={`/blog/${featured.slug}/${featured.banner}`}
										alt={featured.title}
										className={`aspect-[21/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] ${
											featured.bannerCenter ? "object-center" : "object-top"
										}`}
									/>
								</div>
							)}
							<p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
								{featured.featured ? "Featured" : "Latest"} ·{" "}
								{formatPostDate(featured.date)} · {featured.readingTime}
							</p>
							<h3
								className="mt-2 font-serif text-2xl underline-offset-[3px] decoration-white/40 group-hover:underline md:text-3xl"
								style={{
									color: IVORY,
									viewTransitionName: `post-${featured.slug}`,
								}}
							>
								{featured.title}
							</h3>
							<p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
								{featured.summary}
							</p>
							<p className="mt-3 font-mono text-[11px] tracking-wide text-white/50 transition-colors group-hover:text-white">
								Read post →
							</p>
						</Link>
					</Reveal>
				)}

				<div className="mt-14">
					{yearGroups.map(([year, posts]) => (
						<section key={year} className="mt-10 first:mt-0">
							<Reveal
								delay={0.3 + Math.min(rest.indexOf(posts[0]), 8) * 0.06}
								className="flex items-baseline gap-4"
							>
								<h3 className="font-serif text-lg italic text-white/45">
									{year}
								</h3>
								<div className="h-px flex-1 bg-white/15" />
							</Reveal>

							{posts.map((post) => (
								<motion.article
									key={post.slug}
									{...revealProps(
										theme,
										0.35 + Math.min(rest.indexOf(post), 8) * 0.06,
									)}
									whileHover={{ x: 4 }}
									className="group border-b border-white/10 last:border-b-0"
								>
									<Link
										to="/blog/$slug"
										params={{ slug: post.slug }}
										className="flex items-baseline gap-4 py-6"
									>
										<span className="w-7 shrink-0 font-mono text-[11px] tabular-nums tracking-wide text-white/35">
											{entryNumber(post)}
										</span>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-baseline justify-between gap-x-4">
												<h4
													className="font-serif text-xl underline-offset-[3px] decoration-white/40 group-hover:underline md:text-2xl"
													style={{
														color: IVORY,
														viewTransitionName: `post-${post.slug}`,
													}}
												>
													{post.title}
												</h4>
												<span className="shrink-0 font-mono text-[11px] tabular-nums tracking-wide text-white/50">
													{formatPostDate(post.date, "short")} ·{" "}
													{post.readingTime}
												</span>
											</div>
											<p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
												{post.summary}
											</p>
										</div>
									</Link>
								</motion.article>
							))}
						</section>
					))}
				</div>

				<Reveal delay={0.5} className="mt-4 border-t border-white/15 pt-6">
					<p className="font-mono text-[11px] tracking-wide text-white/45">
						{String(allPosts.length).padStart(2, "0")} posts ·{" "}
						{firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`}
					</p>
				</Reveal>
			</main>
		</PageShell>
	);
}
