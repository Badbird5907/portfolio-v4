import { Dithering, MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

// Background dither resolves from coarse to fine on load
const LOADIN_STEPS = [18, 12, 8, 5, 3];

// The shaders default to 2x antialiased rendering with a 4K pixel budget —
// brutal on weak GPUs. These sit behind a dark scrim, so render at native
// resolution and cap the per-frame fill cost. The dither field gets a larger
// budget than the mesh so its pixel grid stays reasonably crisp on retina.
const MESH_PERF = { minPixelRatio: 1, maxPixelCount: 1920 * 1080 };
const DITHER_PERF = { minPixelRatio: 1, maxPixelCount: 2560 * 1440 };

// Chroma's cursor interaction: one dither layer whose mask is mostly
// semi-transparent (0.6 x 0.42 = the ambient 25%) but fully opaque in a soft
// circle that trails the pointer — a local reveal with no extra canvas.
// Positioned via CSS variables mutated directly, so nothing re-renders.
const SPOT_MASK =
	"radial-gradient(320px circle at var(--spot-x, -999px) var(--spot-y, -999px), black 0%, rgba(0,0,0,0.42) 70%)";

const useCursorSpot = (ref: React.RefObject<HTMLDivElement | null>) => {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let raf = 0;
		let seen = false;
		const target = { x: -999, y: -999 };
		const current = { x: -999, y: -999 };
		const tick = () => {
			current.x += (target.x - current.x) * 0.16;
			current.y += (target.y - current.y) * 0.16;
			el.style.setProperty("--spot-x", `${current.x}px`);
			el.style.setProperty("--spot-y", `${current.y}px`);
			raf =
				Math.abs(target.x - current.x) > 0.5 ||
				Math.abs(target.y - current.y) > 0.5
					? requestAnimationFrame(tick)
					: 0;
		};
		const onMove = (event: PointerEvent) => {
			target.x = event.clientX;
			target.y = event.clientY;
			if (!seen) {
				// First sighting: appear at the cursor instead of gliding in
				seen = true;
				current.x = target.x;
				current.y = target.y;
			}
			if (!raf) raf = requestAnimationFrame(tick);
		};
		const onLeave = () => {
			// Glide the spot away so it doesn't linger at the last position
			target.x = -999;
			target.y = -999;
			if (!raf) raf = requestAnimationFrame(tick);
		};
		window.addEventListener("pointermove", onMove);
		document.documentElement.addEventListener("pointerleave", onLeave);
		return () => {
			window.removeEventListener("pointermove", onMove);
			document.documentElement.removeEventListener("pointerleave", onLeave);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [ref]);
};

const useDitherLoadIn = () => {
	const [size, setSize] = useState(LOADIN_STEPS[0]);
	useEffect(() => {
		let step = 0;
		const id = setInterval(() => {
			step += 1;
			if (step >= LOADIN_STEPS.length) {
				clearInterval(id);
				return;
			}
			setSize(LOADIN_STEPS[step]);
		}, 200);
		return () => clearInterval(id);
	}, []);
	return size;
};

const SpreadBackground = ({ paused }: { paused: boolean }) => (
	<>
		<MeshGradient
			{...MESH_PERF}
			colors={["#050507", "#0c1b3a", "#123c33", "#241a45", "#050507"]}
			distortion={0.8}
			swirl={0.5}
			grainOverlay={0.35}
			speed={paused ? 0 : 0.15}
			style={{ width: "100%", height: "100%" }}
		/>
		<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
	</>
);

const DitherBackground = ({ paused }: { paused: boolean }) => {
	const size = useDitherLoadIn();
	return (
		<>
			<Dithering
				{...DITHER_PERF}
				colorBack="#050507"
				colorFront="#22304f"
				shape="warp"
				type="4x4"
				size={size}
				speed={paused ? 0 : 0.25}
				style={{ width: "100%", height: "100%" }}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
		</>
	);
};

const ChromaBackground = ({ paused }: { paused: boolean }) => {
	const size = useDitherLoadIn();
	const spotRef = useRef<HTMLDivElement>(null);
	useCursorSpot(spotRef);
	return (
		<>
			<MeshGradient
				{...MESH_PERF}
				colors={[
					"#050509",
					"#0e1e40",
					"#0e352f",
					"#221845",
					"#3c2136",
					"#050509",
				]}
				distortion={0.8}
				swirl={0.5}
				speed={paused ? 0 : 0.18}
				style={{ width: "100%", height: "100%" }}
			/>
			<div
				ref={spotRef}
				className="absolute inset-0 opacity-60 mix-blend-overlay"
				style={{ maskImage: SPOT_MASK, WebkitMaskImage: SPOT_MASK }}
			>
				<Dithering
					{...DITHER_PERF}
					colorBack="#00000000"
					colorFront="#ffffff"
					shape="warp"
					type="4x4"
					size={size}
					speed={paused ? 0 : 0.25}
					style={{ width: "100%", height: "100%" }}
				/>
			</div>
			<div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
		</>
	);
};

const Background = () => {
	const { theme } = useTheme();
	// speed=0 stops the shader's rAF loop entirely — a static frame for
	// reduced-motion users and zero recurring GPU cost
	const paused = useReducedMotion() ?? false;
	return (
		<div className="fixed inset-0">
			{theme === "spread" && <SpreadBackground paused={paused} />}
			{theme === "dither" && <DitherBackground paused={paused} />}
			{theme === "chroma" && <ChromaBackground paused={paused} />}
		</div>
	);
};

export default Background;
