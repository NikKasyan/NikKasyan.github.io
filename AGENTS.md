# AGENTS.md

## Project Purpose

This repository contains the content source for the Vienna Symposium website, built in Astro.
The site is for a Viennese symposium/verein focused on philosophy, classics, literature, history, discussion, seminars, wine, and civic-intellectual community.

The website should feel:

- thoughtful
- editorial
- calm
- European
- literary rather than startup-like

Avoid making it look like a SaaS landing page, conference-tech site, or generic event template.

## Source Of Truth

The primary content source is the [`markdown/`](./markdown) directory.

Key sections:

- [`markdown/events/`](./markdown/events): symposium and seminar event entries
- [`markdown/home/`](./markdown/home): homepage content
- [`markdown/about-us/`](./markdown/about-us): organisation and people
- [`markdown/support-us/`](./markdown/support-us): membership/support content
- [`markdown/impressum/`](./markdown/impressum): legal page
- [`markdown/vendors/`](./markdown/vendors): JSON venue/vendor knowledge loaded at runtime
- [`markdown/assets/`](./markdown/assets): logo and PDF assets

When making changes, inspect the `markdown/` directory first. Do not invent schema or content structure if it can be inferred from existing files.

## Content Model

### Event Markdown

Event files in [`markdown/events/`](./markdown/events) use frontmatter-first content. Common fields:

- `title`
- `id`
- `type` with value `tribe_events`
- `status`
- `slug`
- `date`
- `author`
- `tags`

Optional fields that appear in some events:

- `venue`
- `venue_address`

Important constraints:

- Many event files have little or no body content. Treat frontmatter as the main event data source.
- Do not assume every event has a description, excerpt, image, venue, or address.
- Preserve existing IDs, slugs, and dates unless the task explicitly asks to change content.
- Keep date values stable and machine-readable.

### Page Markdown

Page content in [`markdown/home/index.md`](./markdown/home/index.md), [`markdown/about-us/index.md`](./markdown/about-us/index.md), [`markdown/support-us/index.md`](./markdown/support-us/index.md), and [`markdown/impressum/index.md`](./markdown/impressum/index.md) is editorial content meant to be rendered as readable longform blocks.

Important constraints:

- Preserve authorial tone: serious, human, community-oriented.
- Keep formatting simple and robust.
- Image references in markdown should remain compatible with the Astro content pipeline.

### Runtime JSON Knowledge

JSON files in [`markdown/vendors/`](./markdown/vendors) act as runtime knowledge for venues/vendors.

Treat them as structured lookup data, not presentation-first content.

Common fields include:

- `id`
- `title`
- `type`
- `status`
- `slug`
- `date`
- `author`
- `content`
- `renderedContent`
- `tags`
- `relatedVenueIds`
- `sliderIds`
- `menuOrder`

Rules:

- Use vendor JSON as knowledge for venue names, placeholder venues, and metadata enrichment.
- Do not hardcode venue information in components if it can come from these JSON files.
- Expect incomplete data. Some entries are minimal, such as `TBA`.
- Be defensive in UI rendering: missing `content` or empty `renderedContent` is normal.

## Design Direction

The design should be clean, restrained, and intentional.

### Visual Character

- Prefer an editorial/cultural-institution feel over a product-marketing feel.
- Use warm neutrals, paper tones, charcoal ink, and one restrained accent color.
- The visual language should suggest salons, printed essays, and symposium invitations.
- Keep layouts spacious and typographic.

### Typography

- Prioritise elegant serif-forward typography for headings and quotes.
- Use a readable companion font for interface text and metadata.
- Avoid default-looking modern startup stacks.
- Let titles, dates, and venue details feel like event cards from a cultural programme.

### Layout

- Keep page structure simple and readable.
- Use strong vertical rhythm and generous whitespace.
- Prefer clear content sections over decorative complexity.
- On the homepage, foreground mission, upcoming discussions, and the character of the community.
- On events pages, prioritise title, date, status, venue, and reading/discussion context.

### Components

If building or editing Astro components, favour:

- reusable content cards
- consistent metadata rows
- a restrained hero area
- clear upcoming/past event separation
- readable prose sections for mission/about/support pages

Avoid:

- heavy glassmorphism
- flashy gradients
- loud animation
- crowded cards
- overly rounded generic UI

### Motion

- Use minimal motion only where it improves hierarchy or clarity.
- Subtle fades, reveal-on-load, and restrained hover states are acceptable.
- Motion should never compete with the text.

## Implementation Guidance For Astro

- Keep content loading close to the filesystem structure in `markdown/`.
- Prefer predictable collection logic over clever abstractions.
- Build pages so they degrade gracefully when optional fields are missing.
- Sort events by `date` and clearly separate upcoming and past events.
- Use vendor JSON to enrich venue display when possible, but do not block rendering if no match exists.
- Keep legal and support pages simple and text-forward.

## Encoding And Text Safety

Some existing files show encoding artifacts such as broken accent or umlaut sequences.

Rules:

- Do not introduce new encoding corruption.
- Preserve valid umlauts and accented characters when editing.
- If you fix encoding, do it deliberately and only where you can confirm the intended text.
- Prefer UTF-8-safe edits throughout.

## Editing Rules

- Make minimal, precise changes.
- Preserve frontmatter structure and field names.
- Do not rename files casually; routes may depend on slugs and filenames.
- Do not remove empty bodies from event markdown unless the task explicitly requires cleanup.
- Do not convert JSON knowledge files into markdown or vice versa.
- If schema assumptions are needed, derive them from the existing files first.

## Preferred Agent Workflow

1. Inspect the relevant files in `markdown/` before changing code or content.
2. Infer the real content schema from existing event/page/json files.
3. Implement Astro pages/components around that schema, including missing-field fallbacks.
4. Preserve the symposium's editorial tone and restrained visual identity.
5. Verify that pages remain readable on both mobile and desktop.

## When Unsure

- Choose clarity over novelty.
- Choose typography over decoration.
- Choose robust content rendering over perfect mock-data assumptions.
- Choose the existing markdown/json structure over invented abstractions.
