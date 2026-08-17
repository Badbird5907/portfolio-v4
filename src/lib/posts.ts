import type { MDXComponents } from "mdx/types";
import type { ComponentType } from "react";

type Frontmatter = {
	title: string;
	summary: string;
	date: string;
	author: string;
	banner?: string;
	bannerCenter?: boolean;
	featured?: boolean;
	// injected at compile time by remarkReadingTime (see vite.config.ts)
	readingTime: string;
};

type MdxModule = {
	default: ComponentType<{ components?: MDXComponents }>;
	frontmatter: Frontmatter;
};

export type Post = {
	slug: string;
	title: string;
	summary: string;
	date: Date;
	author: string;
	banner?: string;
	readingTime: string;
	Content: ComponentType<{ components?: MDXComponents }>;
};

const modules = import.meta.glob<MdxModule>("/content/posts/*/*.mdx", {
	eager: true,
});

// Sorted newest first
export const allPosts: Post[] = Object.entries(modules)
	.map(([path, mod]) => {
		const slug = path.split("/").at(-2) as string;
		const fm = mod.frontmatter;
		return {
			slug,
			title: fm.title,
			summary: fm.summary,
			date: new Date(fm.date),
			author: fm.author,
			banner: fm.banner,
			readingTime: fm.readingTime,
			Content: mod.default,
		};
	})
	.sort((a, b) => b.date.getTime() - a.date.getTime());

export const formatPostDate = (date: Date, style: "short" | "long" = "long") =>
	date.toLocaleDateString("en-US", {
		month: style === "short" ? "short" : "long",
		day: style === "short" ? undefined : "numeric",
		year: "numeric",
		timeZone: "UTC",
	});
