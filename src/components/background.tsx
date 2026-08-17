import { Dithering, MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

// Background dither resolves from coarse to fine on load
const LOADIN_STEPS = [18, 12, 8, 5, 3];

// The shaders default to 2x antialiased rendering with a 4K pixel budget —
// brutal on weak GPUs. These sit behind a dark scrim, so start from a
// viewport-proportional budget (mesh ~1.2x CSS resolution, dither ~1.5x —
// it needs more to keep its pixel grid defined) and then let a frame-rate
// probe find the device's real ceiling. Phones also get a single canvas (no
// chroma overlay), and devices reporting very little memory get a static
// frame (speed 0 stops the render loop entirely).
const MESH_MAX = 1920 * 1080;
const DITHER_MAX = 2560 * 1440;

// Frame-rate probe: after the load noise settles, sample fps in 1s windows
// and walk the render scale down on weak devices — or up toward native
// resolution on strong ones — until ~60fps sticks. The settled scale is
// cached per screen configuration so the probe runs once per device.
const SCALE_KEY = () =>
	`shader-scale:v1:${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`;
const SETTLE_MS = 2500;
const WINDOW_MS = 1000;
const MAX_WINDOWS = 6;

const useAdaptiveScale = (enabled: boolean) => {
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const cached = Number(localStorage.getItem(SCALE_KEY()));
		if (cached > 0) {
			setScale(cached);
			return;
		}
		if (!enabled) return;

		let raf = 0;
		let scaleNow = 1;
		// Highest scale a good window has actually confirmed — an up-step is
		// speculative until the next window measures it
		let lastValidated = 1;
		let steppedDown = false;
		let windows = 0;
		// >1 renders beyond the viewport-based guess, up to native resolution
		const maxScale = Math.max(1, window.devicePixelRatio ** 2);
		const finish = () => {
			const settled = steppedDown ? scaleNow : lastValidated;
			setScale(settled);
			localStorage.setItem(SCALE_KEY(), String(settled));
		};

		const settle = setTimeout(() => {
			let frames = 0;
			let windowStart = performance.now();
			let last = windowStart;
			const loop = (now: number) => {
				if (now - last > 1000) {
					// Tab was hidden or the thread stalled — restart the window
					frames = 0;
					windowStart = now;
				}
				last = now;
				frames += 1;
				const elapsed = now - windowStart;
				if (elapsed >= WINDOW_MS) {
					const fps = (frames * 1000) / elapsed;
					frames = 0;
					windowStart = now;
					windows += 1;
					if (fps < 45) {
						steppedDown = true;
						scaleNow = Math.max(0.25, scaleNow * 0.65);
						setScale(scaleNow);
					} else if (fps > 55 && !steppedDown && scaleNow < maxScale) {
						lastValidated = scaleNow;
						scaleNow = Math.min(maxScale, scaleNow * 1.3);
						setScale(scaleNow);
					} else {
						// Stable window — lock in what this window just measured
						lastValidated = scaleNow;
						finish();
						return;
					}
					if (windows >= MAX_WINDOWS) {
						finish();
						return;
					}
				}
				raf = requestAnimationFrame(loop);
			};
			raf = requestAnimationFrame(loop);
		}, SETTLE_MS);

		return () => {
			clearTimeout(settle);
			cancelAnimationFrame(raf);
		};
	}, [enabled]);

	return scale;
};

const useShaderPerf = (paused: boolean) => {
	const [env, setEnv] = useState<{
		cssPixels: number;
		// null until measured so the chroma overlay never mounts on phones
		coarsePointer: boolean | null;
		frozen: boolean;
	}>({ cssPixels: MESH_MAX, coarsePointer: null, frozen: false });

	useEffect(() => {
		const update = () => {
			const memory = (navigator as Navigator & { deviceMemory?: number })
				.deviceMemory;
			setEnv({
				cssPixels: window.innerWidth * window.innerHeight,
				coarsePointer: window.matchMedia("(pointer: coarse)").matches,
				frozen: memory !== undefined && memory <= 2,
			});
		};
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	// No point probing while the shaders are static; wait until env is measured
	const scale = useAdaptiveScale(
		!paused && !env.frozen && env.coarsePointer !== null,
	);
	const budget = (factor: number, ceiling: number) =>
		Math.min(ceiling, Math.round(env.cssPixels * factor * scale));

	return {
		mesh: { minPixelRatio: 1, maxPixelCount: budget(1.5, MESH_MAX) },
		dither: { minPixelRatio: 1, maxPixelCount: budget(2.2, DITHER_MAX) },
		coarsePointer: env.coarsePointer,
		frozen: env.frozen,
	};
};

// Chroma's cursor interaction: one dither layer whose mask is mostly
// semi-transparent (0.6 x 0.42 = the ambient 25%) but fully opaque in a soft
// circle that trails the pointer — a local reveal with no extra canvas.
// Positioned via CSS variables mutated directly, so nothing re-renders.
const SPOT_MASK =
	"radial-gradient(320px circle at var(--spot-x, -999px) var(--spot-y, -999px), black 0%, rgba(0,0,0,0.42) 70%)";

const useCursorSpot = (
	ref: React.RefObject<HTMLDivElement | null>,
	enabled: boolean,
) => {
	useEffect(() => {
		const el = ref.current;
		if (!enabled || !el) return;
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
	}, [ref, enabled]);
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

const SpreadBackground = ({ paused }: { paused: boolean }) => {
	const { mesh, frozen } = useShaderPerf(paused);
	return (
		<>
			<MeshGradient
				{...mesh}
				colors={["#050507", "#0c1b3a", "#123c33", "#241a45", "#050507"]}
				distortion={0.8}
				swirl={0.5}
				grainOverlay={0.35}
				speed={paused || frozen ? 0 : 0.15}
				style={{ width: "100%", height: "100%" }}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
		</>
	);
};

const DitherBackground = ({ paused }: { paused: boolean }) => {
	const size = useDitherLoadIn();
	const { dither, frozen } = useShaderPerf(paused);
	return (
		<>
			<Dithering
				{...dither}
				colorBack="#050507"
				colorFront="#22304f"
				shape="warp"
				type="4x4"
				size={size}
				speed={paused || frozen ? 0 : 0.25}
				style={{ width: "100%", height: "100%" }}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
		</>
	);
};

const ChromaBackground = ({ paused }: { paused: boolean }) => {
	const size = useDitherLoadIn();
	const { mesh, dither, coarsePointer, frozen } = useShaderPerf(paused);
	const spotRef = useRef<HTMLDivElement>(null);
	// The dither overlay only exists on fine-pointer devices: phones pay for a
	// single canvas and skip the cursor spotlight (touch has no hover anyway)
	const withOverlay = coarsePointer === false;
	useCursorSpot(spotRef, withOverlay);
	return (
		<>
			<MeshGradient
				{...mesh}
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
				speed={paused || frozen ? 0 : 0.18}
				style={{ width: "100%", height: "100%" }}
			/>
			{withOverlay && (
				<div
					ref={spotRef}
					className="absolute inset-0 opacity-60 mix-blend-overlay"
					style={{ maskImage: SPOT_MASK, WebkitMaskImage: SPOT_MASK }}
				>
					<Dithering
						{...dither}
						colorBack="#00000000"
						colorFront="#ffffff"
						shape="warp"
						type="4x4"
						size={size}
						speed={paused || frozen ? 0 : 0.25}
						style={{ width: "100%", height: "100%" }}
					/>
				</div>
			)}
			<div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/65" />
		</>
	);
};

const Background = () => {
	const { theme } = useTheme();
	// speed=0 stops the shader's rAF loop entirely — a static frame with zero
	// recurring GPU cost (reduced-motion users, and low-memory devices via
	// the frozen flag in useShaderPerf)
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
