import Giscus from "@giscus/react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createBlogMdxComponents } from "@/components/blog/mdx-components";
import PageShell, { IVORY } from "@/components/page-shell";
import Reveal from "@/components/reveal";
import { allPosts, formatPostDate } from "@/lib/posts";

export const Route = createFileRoute("/blog/$slug")({
	loader: ({ params }) => {
		const post = allPosts.find((p) => p.slug === params.slug);
		if (!post) throw notFound();
		return { title: post.title, summary: post.summary };
	},
	head: ({ loaderData }) => ({
		meta: loaderData
			? [
					{ title: `${loaderData.title} | Evan Yu` },
					{ name: "description", content: loaderData.summary },
				]
			: [],
	}),
	component: BlogPostPage,
});

const GISCUS_REPO = import.meta.env.VITE_GISCUS_REPO as
	| `${string}/${string}`
	| undefined;

function BlogPostPage() {
	const { slug } = Route.useParams();
	const post = allPosts.find((p) => p.slug === slug);
	if (!post) return null;

	return (
		<PageShell>
			<main className="flex-1 py-14">
				<Reveal>
					<p className="font-mono text-[11px] tracking-wide">
						<Link
							to="/blog"
							className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
						>
							← All posts
						</Link>
					</p>
				</Reveal>

				<Reveal delay={0.1}>
					<h2
						className="mt-6 font-serif text-3xl leading-tight md:text-4xl"
						style={{
							color: IVORY,
							viewTransitionName: `post-${post.slug}`,
						}}
					>
						{post.title}
					</h2>
					<p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
						{post.author} · {formatPostDate(post.date)} · {post.readingTime}
					</p>
				</Reveal>

				{post.banner && (
					<Reveal delay={0.2}>
						<img
							src={`/blog/${post.slug}/${post.banner}`}
							alt={post.title}
							className="mt-8 w-full rounded-lg border border-white/10 shadow-2xl shadow-black/50"
						/>
					</Reveal>
				)}

				<Reveal
					delay={0.25}
					className="prose prose-invert mt-10 max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-[#f1eee7] prose-a:text-[#f1eee7] prose-a:underline-offset-[3px] prose-a:decoration-white/30 hover:prose-a:decoration-white prose-strong:text-[#f1eee7] prose-blockquote:border-white/20 prose-hr:border-white/15"
				>
					<post.Content components={createBlogMdxComponents(post.slug)} />
				</Reveal>

				<Reveal delay={0.3} className="mt-16 border-t border-white/15 pt-8">
					{GISCUS_REPO && (
						<div className="mb-10">
							<Giscus
								repo={GISCUS_REPO}
								repoId={import.meta.env.VITE_GISCUS_REPO_ID ?? ""}
								category="General"
								categoryId={import.meta.env.VITE_GISCUS_CATEGORY_ID ?? ""}
								mapping="title"
								strict="0"
								reactionsEnabled="1"
								emitMetadata="0"
								inputPosition="top"
								theme="transparent_dark"
								lang="en"
								loading="lazy"
							/>
						</div>
					)}
					<p className="text-center font-mono text-[11px] tracking-wide">
						<Link
							to="/blog"
							className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
						>
							← Back to all posts
						</Link>
					</p>
				</Reveal>
			</main>
		</PageShell>
	);
}
