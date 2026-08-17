import { Link } from "@tanstack/react-router";
import { formatPostDate, type Post } from "@/lib/posts";

const WritingList = ({ posts }: { posts: Post[] }) => (
	<div>
		<ul>
			{posts.map((post) => (
				<li key={post.slug} className="border-t border-white/15 py-2.5">
					<Link
						to="/blog/$slug"
						params={{ slug: post.slug }}
						className="group block"
					>
						<p
							className="text-[14px] text-[#f1eee7] transition-colors group-hover:underline underline-offset-[3px] decoration-white/40"
							style={{ viewTransitionName: `post-${post.slug}` }}
						>
							{post.title}
						</p>
						<p className="text-[12px] text-white/50">
							{formatPostDate(post.date, "short")} · {post.readingTime}
						</p>
					</Link>
				</li>
			))}
		</ul>
		<p className="border-t border-white/15 pt-2.5 font-mono text-[11px] tracking-wide">
			<Link
				to="/blog"
				className="text-white/50 hover:text-white transition-colors hover:underline underline-offset-[3px]"
			>
				All posts →
			</Link>
		</p>
	</div>
);

export default WritingList;
