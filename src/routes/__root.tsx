import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	retainSearchParams,
	Scripts,
	useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Background from "@/components/background";
import PageShell from "@/components/page-shell";
import ThemeSwitcher from "@/components/theme-switcher";
import { markNavigated } from "@/lib/entrance";
import { isTheme, type Theme, ThemeProvider, useTheme } from "@/lib/theme";
import { getThemeServerFn } from "@/lib/theme-server";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	// ?theme=spread|dither|chroma overrides the saved theme; retained across
	// client-side navigations so the override follows you around the site
	validateSearch: (search: Record<string, unknown>): { theme?: Theme } => ({
		theme: isTheme(search.theme) ? search.theme : undefined,
	}),
	search: { middlewares: [retainSearchParams(["theme"])] },
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Evan Yu" },
			{ name: "description", content: "Evan Yu's Portfolio" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap",
			},
		],
	}),
	loader: () => getThemeServerFn(),
	shellComponent: RootDocument,
	component: RootLayout,
	notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootLayout() {
	const cookieTheme = Route.useLoaderData();
	const { theme: override } = Route.useSearch();
	return (
		<ThemeProvider initial={cookieTheme} override={override}>
			<AppFrame />
		</ThemeProvider>
	);
}

function AppFrame() {
	const { theme } = useTheme();
	const router = useRouter();
	// After the first client-side navigation, entrance animations step aside
	// and view transitions take over (see lib/entrance.ts)
	useEffect(
		() => router.subscribe("onBeforeNavigate", markNavigated),
		[router],
	);
	return (
		// Keyed by theme so switching replays the load-in animations
		<div
			key={theme}
			className="relative min-h-screen overflow-x-clip font-sans"
		>
			<Background />
			<Outlet />
			<ThemeSwitcher />
		</div>
	);
}

function NotFound() {
	return (
		<PageShell>
			<main className="flex flex-1 flex-col items-center justify-center py-12 text-center">
				<p className="font-serif text-6xl italic text-[#f1eee7]">404</p>
				<p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
					This page does not exist
				</p>
				<Link
					to="/"
					className="mt-6 font-mono text-[12px] text-white/50 underline underline-offset-[3px] transition-colors hover:text-white"
				>
					← Back home
				</Link>
			</main>
		</PageShell>
	);
}
