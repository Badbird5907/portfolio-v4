import { createFileRoute, Link } from "@tanstack/react-router";
import PageShell, {
	IVORY,
	MiniLabel,
	underline,
} from "@/components/page-shell";
import Reveal from "@/components/reveal";
import WritingList from "@/components/writing-list";
import { hackathons } from "@/lib/hackathons";
import { allPosts } from "@/lib/posts";
import { work } from "@/lib/work";

export const Route = createFileRoute("/connect")({
	validateSearch: (search: Record<string, unknown>) => ({
		from: typeof search.from === "string" ? search.from : undefined,
	}),
	head: () => ({
		meta: [
			{ title: "Connect | Evan Yu" },
			{
				name: "description",
				content:
					"Quick intro and links — scan to connect after we meet in person.",
			},
		],
	}),
	component: ConnectPage,
});

function ConnectPage() {
	const { from } = Route.useSearch();
	const fromLabel = from?.trim()
		? decodeURIComponent(from.trim()).replace(/\+/g, " ")
		: null;

	const total = hackathons.length;
	const wonCount = hackathons.filter((h) => h.award).length;
	const mostRecent = [...hackathons].sort(
		(a, b) => b.fullDate.getTime() - a.fullDate.getTime(),
	)[0];

	return (
		<PageShell>
			<main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-14">
				<Reveal delay={0.1}>
					<h2
						className="font-serif text-4xl md:text-5xl"
						style={{ color: IVORY }}
					>
						Hi, I'm Evan Yu!
					</h2>
					{fromLabel && (
						<p className="mt-2 font-serif text-xl italic text-white/60">
							Nice meeting you at {fromLabel}!
						</p>
					)}
				</Reveal>

				<Reveal
					delay={0.2}
					className="mt-6 space-y-5 text-[15px] leading-[1.8] md:text-base"
				>
					<p>
						I'm a first-year math student at the University of Toronto,
						currently a Product Engineer at{" "}
						<a
							href={work[0].url}
							target="_blank"
							rel="noopener noreferrer"
							className={underline}
							style={{ color: IVORY }}
						>
							The Relationship Company
						</a>
						. I'm passionate about startups and building software that actually
						matters.
					</p>
					<p>
						I'm obsessed with hackathons — I've won{" "}
						<span style={{ color: IVORY }}>
							{wonCount}/{total}
						</span>{" "}
						of the ones I've attended, most recently {mostRecent.name}
						{mostRecent.location && ` at ${mostRecent.location}`}.{" "}
						<Link
							to="/hackathons"
							className={underline}
							style={{ color: IVORY }}
						>
							All hackathons
						</Link>
						.
					</p>
				</Reveal>

				<Reveal
					delay={0.3}
					className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] tracking-wide"
				>
					<Link
						to="/"
						className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
					>
						Portfolio →
					</Link>
					<a
						href="https://github.com/Badbird5907"
						target="_blank"
						rel="noopener noreferrer"
						className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
					>
						GitHub ↗
					</a>
					<a
						href="https://linkedin.com/in/ev-yu"
						target="_blank"
						rel="noopener noreferrer"
						className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
					>
						LinkedIn ↗
					</a>
					<a
						href="mailto:contact@evanyu.dev"
						className="text-white/50 transition-colors hover:text-white hover:underline underline-offset-[3px]"
					>
						Email ↗
					</a>
				</Reveal>

				{allPosts.length > 0 && (
					<Reveal delay={0.4} className="mt-12">
						<MiniLabel>Latest post</MiniLabel>
						<WritingList posts={allPosts.slice(0, 1)} />
					</Reveal>
				)}
			</main>
		</PageShell>
	);
}
