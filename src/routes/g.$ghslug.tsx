import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/g/$ghslug")({
	beforeLoad: ({ params }) => {
		throw redirect({ href: `https://github.com/Badbird5907/${params.ghslug}` });
	},
});
