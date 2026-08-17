import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { resolveBlogAsset } from "@/components/blog/mdx-image";

type CarouselItem = { src: string; caption: string };

export type ImageCarouselProps = { items: CarouselItem[] };

export function ImageCarousel({
	items,
	slug,
}: ImageCarouselProps & { slug: string }) {
	const [index, setIndex] = useState(0);
	const current = items[index];
	const arrowClass =
		"absolute top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white/80 opacity-0 backdrop-blur-sm transition-opacity hover:text-white group-hover:opacity-100";

	return (
		<figure className="my-8">
			<div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/30">
				<img
					src={resolveBlogAsset(current.src, slug)}
					alt={current.caption}
					className="aspect-video w-full object-contain"
				/>
				{items.length > 1 && (
					<>
						<button
							type="button"
							aria-label="Previous image"
							onClick={() =>
								setIndex((index - 1 + items.length) % items.length)
							}
							className={`${arrowClass} left-2`}
						>
							<ChevronLeft className="size-4" />
						</button>
						<button
							type="button"
							aria-label="Next image"
							onClick={() => setIndex((index + 1) % items.length)}
							className={`${arrowClass} right-2`}
						>
							<ChevronRight className="size-4" />
						</button>
					</>
				)}
			</div>
			<figcaption className="mt-2 text-center font-mono text-[11px] tracking-wide text-white/50">
				{current.caption}
				{items.length > 1 && ` — ${index + 1}/${items.length}`}
			</figcaption>
		</figure>
	);
}
