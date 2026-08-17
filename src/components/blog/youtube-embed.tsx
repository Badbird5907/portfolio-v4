export function YouTubeEmbed({
	videoId,
	title = "YouTube video player",
	className = "w-full aspect-video",
}: {
	videoId: string;
	title?: string;
	className?: string;
}) {
	return (
		<div className={className}>
			<iframe
				width="100%"
				height="100%"
				src={`https://www.youtube.com/embed/${videoId}`}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				referrerPolicy="strict-origin-when-cross-origin"
				allowFullScreen
			/>
		</div>
	);
}
