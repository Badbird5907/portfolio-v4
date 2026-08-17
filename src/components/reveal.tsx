import { motion } from "motion/react";
import { hasNavigated } from "@/lib/entrance";
import { type Theme, useTheme } from "@/lib/theme";

// Entrance animation per theme: Spread fades up, Dither/Chroma flicker in
// like a CRT. Spread motion props onto any motion.* element via revealProps.
// After a client-side navigation this returns nothing — content renders
// immediately and the view transition animates the page change instead.
export const revealProps = (theme: Theme, delay = 0) => {
	if (hasNavigated()) return {};
	return theme === "spread"
		? {
				initial: { opacity: 0, y: 14 },
				animate: { opacity: 1, y: 0 },
				transition: { duration: 0.7, delay },
			}
		: {
				initial: { opacity: 0 },
				animate: { opacity: [0, 1, 0.25, 1] },
				transition: {
					duration: 0.5,
					times: [0, 0.4, 0.6, 1],
					delay,
					ease: "linear" as const,
				},
			};
};

const Reveal = ({
	delay = 0,
	className = "",
	children,
}: {
	delay?: number;
	className?: string;
	children: React.ReactNode;
}) => {
	const { theme } = useTheme();
	return (
		<motion.div {...revealProps(theme, delay)} className={className}>
			{children}
		</motion.div>
	);
};

export default Reveal;
