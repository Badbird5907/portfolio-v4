import { motion } from "motion/react";

const Badge = () => (
	<motion.div
		animate={{ rotate: 360 }}
		transition={{ duration: 32, ease: "linear", repeat: Infinity }}
		className="relative size-24 md:size-28"
	>
		<svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
			<title>rotating badge</title>
			<defs>
				<path
					id="badge-circle"
					d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
				/>
			</defs>
			<text className="fill-white/40 font-mono text-[7.5px] uppercase">
				<textPath
					href="#badge-circle"
					textLength={237}
					lengthAdjust="spacingAndGlyphs"
				>
					Evan Yu · Toronto · Software Engineer ·
				</textPath>
			</text>
		</svg>
		<span className="absolute inset-0 flex items-center justify-center font-serif text-xl italic text-white/50">
			ey
		</span>
	</motion.div>
);

export default Badge;
