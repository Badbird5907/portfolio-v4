# portfolio-v4

Evan Yu's portfolio, rebuilt on [TanStack Start](https://tanstack.com/start).

Three themes share a single set of pages — a switcher (hover the handle at the
bottom of the screen) swaps between them:

- **Spread** — magazine-spread layout over an animated mesh gradient
- **Dither** — the same layout over an ordered-dither field, with dithered
  load-in animations
- **Chroma** — dither + spread merged: the mesh gradient with a dither overlay

The theme is stored in a `theme` cookie (read server-side, so SSR renders the
right theme) and only affects the background shader, the entrance animation,
and the polaroid photo reveal — pages are never duplicated per theme.

## Development

```sh
git submodule update --init   # blog content lives in a submodule (./content)
pnpm install
pnpm dev                      # http://localhost:8712
```

Blog posts are MDX files in `content/posts/<slug>/<slug>.mdx`; their images are
copied to `public/blog/` by `scripts/sync-blog-assets.mjs` (runs automatically
before `dev` and `build`). Reading time is computed at compile time by a small
remark plugin in `vite.config.ts`.

## Stack

- TanStack Start (Vite) + React
- Tailwind CSS v4 (+ typography for post bodies)
- [@paper-design/shaders-react](https://shaders.paper.design/) for the
  MeshGradient / Dithering / ImageDithering backgrounds
- motion for animations
- MDX with `rehype-pretty-code` for posts
