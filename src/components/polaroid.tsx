import { ImageDithering } from "@paper-design/shaders-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

// Photo reveal (dither/chroma themes): a true ordered dither (8x8 Bayer) that
// refines in discrete steps — pixel size and color quantization jump, no
// continuous scaling — then crossfades into the real image
const REVEAL_STEPS = [
	{ size: 6, colorSteps: 1 },
	{ size: 4, colorSteps: 2 },
	{ size: 4, colorSteps: 3 },
	{ size: 2, colorSteps: 4 },
	{ size: 2, colorSteps: 6 },
];
const STEP_MS = 100;

const DitherReveal = ({
	src,
	revealDelay,
}: {
	src: string;
	revealDelay: number;
}) => {
	const [step, setStep] = useState(0);
	const [revealed, setRevealed] = useState(false);
	const [gone, setGone] = useState(false);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		let fadeTimeout: ReturnType<typeof setTimeout> | undefined;
		const timeout = setTimeout(() => {
			let i = 0;
			interval = setInterval(() => {
				i += 1;
				if (i >= REVEAL_STEPS.length) {
					clearInterval(interval);
					setRevealed(true);
					fadeTimeout = setTimeout(() => setGone(true), 400);
					return;
				}
				setStep(i);
			}, STEP_MS);
		}, revealDelay);
		return () => {
			clearTimeout(timeout);
			if (interval) clearInterval(interval);
			if (fadeTimeout) clearTimeout(fadeTimeout);
		};
	}, [revealDelay]);

	if (gone) return null;
	const { size, colorSteps } = REVEAL_STEPS[step];

	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
			style={{ opacity: revealed ? 0 : 1 }}
		>
			<ImageDithering
				image={src}
				originalColors
				colorSteps={colorSteps}
				type="8x8"
				size={size}
				fit="cover"
				style={{ width: "100%", height: "100%" }}
			/>
		</div>
	);
};

const Polaroid = ({
	src,
	alt,
	caption,
	rotate,
	float = 0,
	revealDelay = 0,
	className = "",
}: {
	src: string;
	alt: string;
	caption: string;
	rotate: number;
	float?: number;
	revealDelay?: number;
	className?: string;
}) => {
	const { theme } = useTheme();
	return (
		<motion.div
			animate={{ y: [0, -7, 0] }}
			transition={{
				duration: 6 + float,
				delay: float,
				repeat: Infinity,
				ease: "easeInOut",
			}}
			className={className}
		>
			<motion.figure
				animate={{ rotate }}
				whileHover={{ rotate: 0, scale: 1.05 }}
				transition={{ type: "spring", stiffness: 200, damping: 18 }}
				className="relative w-40 bg-[#f4f1ea] p-2 pb-8 shadow-2xl shadow-black/50 md:w-48"
			>
				<div className="relative aspect-[4/5] overflow-hidden">
					<img
						src={src}
						alt={alt}
						className={`absolute inset-0 h-full w-full object-cover ${
							theme === "spread" ? "saturate-[0.9]" : ""
						}`}
					/>
					{theme !== "spread" && (
						<DitherReveal src={src} revealDelay={revealDelay} />
					)}
				</div>
				<figcaption className="absolute bottom-2.5 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-600">
					{caption}
				</figcaption>
			</motion.figure>
		</motion.div>
	);
};

export default Polaroid;
