import { createContext, useContext, useState } from "react";

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
	children,
}: {
	initial: Theme;
	children: React.ReactNode;
}) => {
	const [theme, setThemeState] = useState<Theme>(initial);
	const setTheme = (next: Theme) => {
		setThemeState(next);
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
