# Content Workflow

This site is designed to stay statically generated for GitHub Pages.

## Deploy

Push to `main` and GitHub Actions will build and deploy the `astro/` app to GitHub Pages using [deploy-pages.yml](../.github/workflows/deploy-pages.yml).

## Add Content Quickly

From `astro/` run:

- `npm run new:event`
- `npm run new:venue`
- `npm run new:slider`

The generator writes directly into the shared `markdown/` source tree.

## Recommended Event Workflow

1. Run `npm run new:slider` if the event needs a gallery and paste the remote image URLs.
2. Copy the printed slider ID.
3. Run `npm run new:event` and paste that slider ID into the `Slider IDs` prompt.
4. If the venue does not exist yet, run `npm run new:venue` first.
5. Review the generated file and then run `npm run build`.

## Why No Full Admin Panel

A true write-capable admin panel on top of GitHub Pages is not a pure static feature. It needs external authentication and a git-writing backend or OAuth app.

For this repository, the simplest robust approach is the generator script above. If you later want a browser-based CMS, the clean next step is Decap CMS with a GitHub backend, but that requires extra OAuth setup beyond plain GitHub Pages.
