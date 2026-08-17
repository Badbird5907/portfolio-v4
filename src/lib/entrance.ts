// Entrance animations play on first load and after a theme switch, but are
// skipped on client-side navigations — there, view transitions own the
// between-page motion, and a morph target mid-fade would snapshot invisible.
// Only mutated on the client, so SSR always renders the animated variant.
let navigated = false;

export const markNavigated = () => {
	navigated = true;
};

export const resetEntrance = () => {
	navigated = false;
};

export const hasNavigated = () => navigated;
