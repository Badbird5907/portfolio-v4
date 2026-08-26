import { useState } from "react";
import { THEMES, useTheme } from "@/lib/theme";

const ThemeSwitcher = () => {
	const { theme, setTheme } = useTheme();
	// Mouse hover alone can't bridge the gap between the handle and the nav:
	// pointer-events flips instantly (it doesn't transition), so once the
	// cursor leaves the handle it drops out of the hoverable area a beat
	// before reaching the nav above it. Tracking "open" in state keeps the
	// whole region interactive for the duration of the hover/focus instead.
	const [open, setOpen] = useState(false);

	return (
		<div className="pointer-events-none fixed bottom-0 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center px-10 pt-8">
			{/** biome-ignore lint/a11y/noStaticElementInteractions: hover/focus region only, buttons inside remain the real interactive elements */}
			<div
				className={`flex flex-col items-center ${open ? "pointer-events-auto" : "pointer-events-none"}`}
				onMouseEnter={() => setOpen(true)}
				onMouseLeave={() => setOpen(false)}
				onFocus={() => setOpen(true)}
				onBlur={(e) => {
					if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
				}}
			>
				<nav
					className={`mb-3 flex items-center gap-1 rounded-full border border-white/15 bg-zinc-950/85 px-2 py-1.5 font-mono text-sm shadow-xl backdrop-blur-md transition-all duration-300 ${
						open
							? "translate-y-0 opacity-100"
							: "pointer-events-none translate-y-2 opacity-0"
					}`}
				>
					{THEMES.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => setTheme(option.value)}
							className={`shrink-0 cursor-pointer rounded-full px-3 py-1 transition-colors ${
								theme === option.value
									? "bg-white text-black"
									: "text-zinc-400 hover:text-white"
							}`}
						>
							{option.label}
						</button>
					))}
				</nav>
				{/* Grab handle — hover to reveal the switcher */}
				<div
					className={`pointer-events-auto mb-2 h-1 w-10 rounded-full transition-colors duration-300 ${open ? "bg-white/50" : "bg-white/20"}`}
				/>
			</div>
		</div>
	);
};

export default ThemeSwitcher;
