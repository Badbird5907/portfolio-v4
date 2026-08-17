import { createContext, useContext, useEffect, useState } from "react";
import { resetEntrance } from "@/lib/entrance";

export const THEMES = [
	{ value: "spread", label: "Spread" },
	{ value: "dither", label: "Dither" },
	{ value: "chroma", label: "Chroma" },
] as const;

export type Theme = (typeof THEMES)[number]["value"];

export const isTheme = (value: unknown): value is Theme =>
	THEMES.some((theme) => theme.value === value);

const ThemeContext = createContext<{
	theme: Theme;
	setTheme: (theme: Theme) => void;
} | null>(null);

export const ThemeProvider = ({
	initial,
	override,
	children,
}: {
	initial: Theme;
	/** A ?theme= URL param — wins over the saved cookie, without touching it */
	override?: Theme;
	children: React.ReactNode;
}) => {
	const [theme, setThemeState] = useState<Theme>(override ?? initial);
	// Apply the override if the search param changes after mount
	useEffect(() => {
		if (override) setThemeState(override);
	}, [override]);
	const setTheme = (next: Theme) => {
		setThemeState(next);
		// Theme switches remount the page — let the entrance animations replay
		resetEntrance();
		// biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API isn't supported everywhere
		document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
	};
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used within ThemeProvider");
	return context;
};
