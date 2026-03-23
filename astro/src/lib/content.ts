import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { parse as parseYaml } from "yaml";

const markdownRoot = fileURLToPath(new URL("../../../markdown", import.meta.url));
const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");

type Frontmatter = Record<string, unknown>;

type SliderSlideRecord = {
  id?: string;
  title?: string;
  status?: string;
  order?: number;
  image?: {
    url?: string;
  };
};

type SliderRecord = {
  id?: string;
  title?: string;
  status?: string;
  slides?: SliderSlideRecord[];
};

export type EventDocument = {
  title: string;
  slug: string;
  date: string;
  type?: string;
  status?: string;
  author?: string;
  id?: string;
  tags: string[];
  venue?: string;
  venueAddress?: string;
  organizer?: string;
  titleImage?: string;
  sliders: string[];
  body: string;
  html: string;
  sourcePath: string;
};

export type PageDocument = {
  title: string;
  slug: string;
  date?: string;
  body: string;
  html: string;
  sourcePath: string;
  frontmatter: Frontmatter;
};

export type VendorDocument = {
  id?: string;
  title: string;
  type?: string;
  status?: string;
  slug: string;
  date?: string;
  author?: string;
  content?: string;
  renderedContent?: string;
  tags: string[];
  relatedVenueIds: string[];
  sliderIds: string[];
  menuOrder?: number;
  sourcePath: string;
};

export type SliderImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ParsedMarkdown = {
  frontmatter: Frontmatter;
  body: string;
};

marked.setOptions({
  gfm: true
});

function withBase(pathname: string) {
  return `${baseUrl}${pathname.replace(/^\//, "")}`;
}

function parseMarkdownFile(raw: string): ParsedMarkdown {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      frontmatter: {},
      body: raw.trim()
    };
  }

  return {
    frontmatter: (parseYaml(match[1]) as Frontmatter) ?? {},
    body: match[2].trim()
  };
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  return [String(value)];
}

function formatSpecialSections(body: string, relativePath: string) {
  if (relativePath !== "impressum/index.md") {
    return body;
  }

  return body.replace(
    /\*\*Anschrift\*\*:\s*\r?\n([^\n]+)\r?\n([^\n]+)\r?\n([^\n]+)\r?\n([^\n]+)\r?\n([^\n]+)/,
    (_match, line1, line2, line3, line4, line5) => {
      return `**Anschrift**:<br />${line1}<br />${line2}<br />${line3}<br />${line4}<br />${line5}`;
    }
  );
}

function normalizeBody(body: string, sourceDir: string, relativePath: string): string {
  const withSpecialFormatting = formatSpecialSections(body, relativePath);
  const withoutShortcodes = withSpecialFormatting.replace(/\\?\[metaslider[^\]]*]/g, "");
  const unescaped = withoutShortcodes.replace(/\\([()[\].])/g, "$1");

  return rewriteRelativeMarkdownAssetUrls(unescaped, sourceDir).trim();
}

function rewriteRelativeMarkdownAssetUrls(input: string, sourceDir: string): string {
  return input.replace(/(!?\[[^\]]*])\(([^)]+)\)/g, (full, label, target) => {
    const trimmed = String(target).trim();

    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:") ||
      trimmed.startsWith("#")
    ) {
      return full;
    }

    if (trimmed.startsWith("/")) {
      return `${label}(${withBase(trimmed)})`;
    }

    const cleaned = trimmed.replace(/^\.\/+/, "");
    const assetPath = [sourceDir, cleaned].filter(Boolean).join("/").replace(/\\/g, "/");
    return `${label}(${withBase(`/media/${assetPath}`)})`;
  });
}

function resolveMediaUrl(value: unknown, sourceDir: string) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return withBase(trimmed);
  }

  const cleaned = trimmed.replace(/^\.\/+/, "");
  const assetPath = [sourceDir, cleaned].filter(Boolean).join("/").replace(/\\/g, "/");
  return withBase(`/media/${assetPath}`);
}

async function renderMarkdown(body: string): Promise<string> {
  return await marked.parse(body);
}

async function readMarkdownDocument(relativePath: string): Promise<PageDocument> {
  const sourcePath = path.join(markdownRoot, relativePath);
  const raw = await fs.readFile(sourcePath, "utf8");
  const { frontmatter, body } = parseMarkdownFile(raw);
  const sourceDir = path.dirname(relativePath).replace(/\\/g, "/");
  const normalizedBody = normalizeBody(body, sourceDir, relativePath);

  return {
    title: String(frontmatter.title ?? ""),
    slug: String(frontmatter.slug ?? path.basename(path.dirname(sourcePath))),
    date: frontmatter.date ? String(frontmatter.date) : undefined,
    body: normalizedBody,
    html: await renderMarkdown(normalizedBody),
    sourcePath,
    frontmatter
  };
}

export async function getHomePage() {
  return readMarkdownDocument("home/index.md");
}

export async function getAboutPage() {
  return readMarkdownDocument("about-us/index.md");
}

export async function getSupportPage() {
  return readMarkdownDocument("support-us/index.md");
}

export async function getImpressumPage() {
  return readMarkdownDocument("impressum/index.md");
}

export async function getEvents(): Promise<EventDocument[]> {
  const eventsDir = path.join(markdownRoot, "events");
  const entries: string[] = await fs.readdir(eventsDir);
  const eventFiles = entries.filter((entry: string) => entry.endsWith(".md")).sort();

  const items = await Promise.all(
    eventFiles.map(async (fileName: string) => {
      const relativePath = path.join("events", fileName);
      const sourcePath = path.join(markdownRoot, relativePath);
      const raw = await fs.readFile(sourcePath, "utf8");
      const { frontmatter, body } = parseMarkdownFile(raw);
      const normalizedBody = normalizeBody(body, "events", relativePath.replace(/\\/g, "/"));

      return {
        title: String(frontmatter.title ?? fileName),
        slug: String(frontmatter.slug ?? fileName.replace(/\.md$/, "")),
        date: String(frontmatter.date ?? ""),
        type: frontmatter.type ? String(frontmatter.type) : undefined,
        status: frontmatter.status ? String(frontmatter.status) : undefined,
        author: frontmatter.author ? String(frontmatter.author) : undefined,
        id: frontmatter.id ? String(frontmatter.id) : undefined,
        tags: toStringArray(frontmatter.tags),
        venue: frontmatter.venue ? String(frontmatter.venue) : undefined,
        venueAddress: frontmatter.venue_address ? String(frontmatter.venue_address) : undefined,
        organizer: frontmatter.organizer ? String(frontmatter.organizer) : undefined,
        titleImage: resolveMediaUrl(frontmatter.title_image, "events"),
        sliders: toStringArray(frontmatter.sliders),
        body: normalizedBody,
        html: await renderMarkdown(normalizedBody),
        sourcePath
      } satisfies EventDocument;
    })
  );

  return items.sort((left: EventDocument, right: EventDocument) => {
    return Date.parse(left.date) - Date.parse(right.date);
  });
}

export async function getEventBySlug(slug: string) {
  const events = await getEvents();
  return events.find((event) => event.slug === slug);
}

export async function getVendors(): Promise<VendorDocument[]> {
  const vendorsDir = path.join(markdownRoot, "vendors");
  const entries: string[] = await fs.readdir(vendorsDir);
  const vendorFiles = entries.filter((entry: string) => entry.endsWith(".json")).sort();

  const vendors = await Promise.all(
    vendorFiles.map(async (fileName: string) => {
      const sourcePath = path.join(vendorsDir, fileName);
      const raw = await fs.readFile(sourcePath, "utf8");
      const parsed = JSON.parse(raw) as Record<string, unknown>;

      return {
        id: parsed.id ? String(parsed.id) : undefined,
        title: String(parsed.title ?? fileName),
        type: parsed.type ? String(parsed.type) : undefined,
        status: parsed.status ? String(parsed.status) : undefined,
        slug: String(parsed.slug ?? fileName.replace(/\.json$/, "")),
        date: parsed.date ? String(parsed.date) : undefined,
        author: parsed.author ? String(parsed.author) : undefined,
        content: parsed.content ? String(parsed.content) : undefined,
        renderedContent: parsed.renderedContent ? String(parsed.renderedContent) : undefined,
        tags: toStringArray(parsed.tags),
        relatedVenueIds: toStringArray(parsed.relatedVenueIds),
        sliderIds: toStringArray(parsed.sliderIds),
        menuOrder: typeof parsed.menuOrder === "number" ? parsed.menuOrder : undefined,
        sourcePath
      } satisfies VendorDocument;
    })
  );

  return vendors.sort((left: VendorDocument, right: VendorDocument) => {
    return left.title.localeCompare(right.title);
  });
}

export async function getSliderImagesByIds(sliderIds: string[]) {
  if (sliderIds.length === 0) {
    return [] as SliderImage[];
  }

  const slidersDir = path.join(markdownRoot, "sliders");
  const entries: string[] = await fs.readdir(slidersDir);
  const sliderFiles = entries.filter((entry: string) => entry.endsWith(".json"));
  const normalizedIds = new Set(sliderIds.map((id) => String(id)));
  const collected: Array<{ sliderId: string; images: SliderImage[] }> = [];

  for (const fileName of sliderFiles) {
    const sourcePath = path.join(slidersDir, fileName);
    const raw = await fs.readFile(sourcePath, "utf8");
    const parsed = JSON.parse(raw) as SliderRecord;

    if (!parsed.id || !normalizedIds.has(String(parsed.id)) || parsed.status !== "publish") {
      continue;
    }

    const images = (parsed.slides ?? [])
      .filter((slide) => slide.status === "publish" && slide.image?.url)
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .map((slide, index) => ({
        src: String(slide.image?.url ?? ""),
        alt: slide.title ? String(slide.title) : `${parsed.title ?? "Slider"} image ${index + 1}`,
        caption: slide.title && !/^Slider \d+ - image$/i.test(String(slide.title)) ? String(slide.title) : undefined
      } satisfies SliderImage));

    if (images.length > 0) {
      collected.push({
        sliderId: String(parsed.id),
        images
      });
    }
  }

  return sliderIds.flatMap((sliderId) => {
    const match = collected.find((slider) => slider.sliderId === String(sliderId));
    return match ? match.images : [];
  });
}

function normalizeLookup(value: string | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export async function getVendorByTitle(title: string | undefined) {
  if (!title) {
    return undefined;
  }

  const vendors = await getVendors();
  const target = normalizeLookup(title);

  return vendors.find((vendor) => {
    return normalizeLookup(vendor.title) === target || normalizeLookup(vendor.slug) === target;
  });
}

export function splitEventsByDate(events: EventDocument[]) {
  const now = new Date();
  const upcoming: EventDocument[] = [];
  const past: EventDocument[] = [];

  for (const event of events) {
    if (Date.parse(event.date) >= now.getTime()) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  }

  upcoming.sort((left, right) => Date.parse(left.date) - Date.parse(right.date));
  past.sort((left, right) => Date.parse(right.date) - Date.parse(left.date));

  return { upcoming, past };
}

async function collectMediaFiles(relativeDirectory: string, collected: string[]) {
  const absoluteDir = path.join(markdownRoot, relativeDirectory);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.posix.join(relativeDirectory.replace(/\\/g, "/"), entry.name);

    if (entry.isDirectory()) {
      await collectMediaFiles(relativePath, collected);
      continue;
    }

    if (entry.name.endsWith(".md") || entry.name.endsWith(".json")) {
      continue;
    }

    collected.push(relativePath);
  }
}

export async function getStaticMediaPaths() {
  const directories = ["about-us", "assets"];
  const collected: string[] = [];

  for (const directory of directories) {
    await collectMediaFiles(directory, collected);
  }

  return collected.sort();
}

export async function readMediaFile(relativeMediaPath: string) {
  const normalized = path.posix.normalize(relativeMediaPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(markdownRoot, normalized);
  const resolvedMarkdownRoot = path.resolve(markdownRoot);
  const resolvedAsset = path.resolve(absolutePath);

  if (!resolvedAsset.startsWith(resolvedMarkdownRoot)) {
    throw new Error("Invalid media path");
  }

  return {
    buffer: await fs.readFile(resolvedAsset),
    absolutePath: resolvedAsset
  };
}

export function getContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
