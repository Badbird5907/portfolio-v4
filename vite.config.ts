import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import rehypePrettyCode from "rehype-pretty-code";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

// Injects a readingTime field into each post's frontmatter export
const remarkReadingTime =
	() =>
	(
		tree: { children: Array<{ type: string; value?: string }> },
		file: { value?: unknown },
	) => {
		const words = String(file.value ?? "")
			.trim()
			.split(/\s+/).length;
		const minutes = Math.max(1, Math.ceil(words / 200));
		const yaml = tree.children.find((node) => node.type === "yaml");
		if (yaml?.value) {
			yaml.value += `\nreadingTime: "${minutes} min read"`;
		}
	};

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	server: {
		port: 8712,
		host: true,
		allowedHosts: ["evans-macbook-pro.coin-squeaker.ts.net"],
	},
	plugins: [
		{
			enforce: "pre",
			...mdx({
				remarkPlugins: [
					remarkFrontmatter,
					remarkReadingTime,
					remarkMdxFrontmatter,
				],
				rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
			}),
		},
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
