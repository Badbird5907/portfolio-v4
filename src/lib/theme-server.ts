import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { isTheme, type Theme } from "@/lib/theme";

export const getThemeServerFn = createServerFn().handler((): Theme => {
	const cookie = getCookie("theme");
	return isTheme(cookie) ? cookie : "spread";
});
