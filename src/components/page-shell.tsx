import { Link } from "@tanstack/react-router";
import CornerMeta from "@/components/corner-meta";
import Reveal from "@/components/reveal";

export const IVORY = "#f1eee7";

export const underline =
	"underline underline-offset-[3px] decoration-white/30 transition-colors hover:decoration-white";

export const MiniLabel = ({ children }: { children: React.ReactNode }) => (
	<h2 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
		{children}
	</h2>
);

const footerLinks: [string, string][] = [
	["GitHub", "https://github.com/Badbird5907"],
	["LinkedIn", "https://linkedin.com/in/ev-yu"],
	["Email", "mailto:contact@evanyu.dev"],
	["Blog", "/blog"],
	["Hackathons", "/hackathons"],
];

const footerLinkClass =
	"text-white/50 hover:text-white hover:underline underline-offset-[3px] transition-colors";

// Shared frame for every page: name + corner meta up top, link row at the
// bottom, content in between. The landing page uses the wide variant.
const PageShell = ({
	wide = false,
	children,
}: {
	wide?: boolean;
	children: React.ReactNode;
}) => (
	<div
		className={`relative z-10 mx-auto flex min-h-screen w-full flex-col p-6 md:p-10 ${
			wide ? "max-w-[1700px]" : "max-w-3xl"
		}`}
	>
		<Reveal className="flex items-start justify-between">
			<div>
				<h1
					className="mb-1 font-serif text-3xl md:text-4xl"
					style={{ color: IVORY, viewTransitionName: "site-title" }}
				>
					<Link to="/">Evan Yu</Link>
				</h1>
				<p className="text-[15px] text-white/50">
					Software engineer in Toronto
				</p>
			</div>
			<CornerMeta />
		</Reveal>

		{children}

		<Reveal
			delay={0.6}
			className="flex flex-wrap items-baseline justify-between gap-4 border-t border-white/15 pt-6 text-[13px] text-white/50"
		>
			<div className="flex flex-wrap gap-x-4 gap-y-2">
				{footerLinks.map(([label, href]) =>
					href.startsWith("/") ? (
						<Link key={label} to={href} className={footerLinkClass}>
							{label}
						</Link>
					) : (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={footerLinkClass}
						>
							{label}
						</a>
					),
				)}
			</div>
			<span className="font-serif italic">Toronto</span>
		</Reveal>
	</div>
);

export default PageShell;
