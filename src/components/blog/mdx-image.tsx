import { useState } from "react";

export const resolveBlogAsset = (src: string, slug: string) => {
	if (src.startsWith("http") || src.startsWith("/")) return src;
	return `/blog/${slug}/${src.startsWith("@") ? src.slice(1) : src}`;
};

export type BlogImageProps = {
	src: string;
	alt?: string;
	slug?: string;
	width?: number | string;
	className?: string;
};

// Markdown images render standalone; clicking opens a simple lightbox. Only
// button/span elements are used so it stays valid inside MDX paragraphs.
export function BlogImage({
	slug = "",
	src,
	alt,
	width,
	className,
}: BlogImageProps) {
	const [open, setOpen] = useState(false);
	const resolved = resolveBlogAsset(src, slug);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`my-8 block cursor-zoom-in border-none bg-transparent p-0 ${
					width ? "" : "w-full"
				}`}
			>
				<img
					src={resolved}
					alt={alt || ""}
					loading="lazy"
					style={width ? { width } : undefined}
					className={`h-auto w-full rounded-lg shadow-lg ${className || ""}`}
				/>
			</button>
			{open && (
				<button
					type="button"
					aria-label="Close image preview"
					onClick={() => setOpen(false)}
					className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
				>
					<img
						src={resolved}
						alt={alt || ""}
						className="max-h-[90vh] max-w-[90vw] rounded-md object-contain shadow-2xl"
					/>
				</button>
			)}
		</>
	);
}
