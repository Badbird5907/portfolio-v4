import { createFileRoute, Link } from "@tanstack/react-router";
import PageShell, { IVORY, MiniLabel } from "@/components/page-shell";
import Reveal from "@/components/reveal";
import { allPosts, formatPostDate } from "@/lib/posts";

export const Route = createFileRoute("/blog/")({
	head: () => ({
		meta: [
			{ title: "Blog | Evan Yu" },
			{
				name: "description",
				content: "Thoughts, stories, and experiences from my journey in tech",
			},
		],
	}),
	component: BlogIndexPage,
});

function BlogIndexPage() {
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
					<p className="mt-3 text-[15px] text-white/50">
						Thoughts, stories, and experiences from my journey in tech.
					</p>
				</Reveal>

				<div className="mt-10">
					{allPosts.map((post, i) => (
						<Reveal key={post.slug} delay={0.2 + i * 0.08}>
							<article className="group border-t border-white/15">
								<Link
									to="/blog/$slug"
									params={{ slug: post.slug }}
									className="block py-6"
								>
									<div className="flex flex-wrap items-baseline justify-between gap-x-4">
										<h3
											className="font-serif text-xl underline-offset-[3px] decoration-white/40 group-hover:underline md:text-2xl"
											style={{ color: IVORY }}
										>
											{post.title}
										</h3>
										<span className="shrink-0 font-mono text-[11px] tabular-nums tracking-wide text-white/50">
											{formatPostDate(post.date, "short")}
										</span>
									</div>
									<p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
										{post.summary}
									</p>
									<p className="mt-2 font-mono text-[11px] tracking-wide text-white/45">
										{post.readingTime} · {post.author}
									</p>
								</Link>
							</article>
						</Reveal>
					))}
				</div>
			</main>
		</PageShell>
	);
}
