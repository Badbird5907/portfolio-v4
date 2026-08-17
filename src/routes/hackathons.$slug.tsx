import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { hackathons } from "@/lib/hackathons";

export const Route = createFileRoute("/hackathons/$slug")({
	beforeLoad: ({ params }) => {
		const hackathon = hackathons.find((h) => h.slug === params.slug);
		if (!hackathon) throw notFound();
		// Redirect to the first link if it exists, otherwise the hackathon URL
		throw redirect({ href: hackathon.links?.[0]?.url || hackathon.url });
	},
});
