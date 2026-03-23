import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const markdownRoot = fileURLToPath(new URL("../../../markdown", import.meta.url));

export type AdminCollectionKey = "events" | "vendors" | "sliders" | "organizers";

export type AdminRecord = {
  collection: AdminCollectionKey;
  relativePath: string;
  fileName: string;
  format: "markdown" | "json";
  title: string;
  slug?: string;
  status?: string;
  date?: string;
  source: string;
};

export type AdminSlideAsset = {
  fileName: string;
  relativePath: string;
  mediaUrl: string;
};

const collectionFormats: Record<AdminCollectionKey, "markdown" | "json"> = {
  events: "markdown",
  vendors: "json",
  sliders: "json",
  organizers: "json"
};

function parseMarkdownMeta(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fallback = {
    title: "Untitled",
    slug: undefined,
    status: undefined,
    date: undefined
  };

  if (!match) {
    return fallback;
  }

  const fields = new Map<string, string>();

  for (const line of match[1].split(/\r?\n/)) {
    const fieldMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);

    if (!fieldMatch) {
      continue;
    }

    const rawValue = fieldMatch[2].trim();
    const cleaned = rawValue.replace(/^"(.*)"$/, "$1").replace(/\\"/g, '"');
    fields.set(fieldMatch[1], cleaned);
  }

  return {
    title: fields.get("title") || fallback.title,
    slug: fields.get("slug") || undefined,
    status: fields.get("status") || undefined,
    date: fields.get("date") || undefined
  };
}

function parseJsonMeta(source: string) {
  try {
    const parsed = JSON.parse(source) as Record<string, unknown>;
    return {
      title: typeof parsed.title === "string" && parsed.title ? parsed.title : "Untitled",
      slug: typeof parsed.slug === "string" ? parsed.slug : undefined,
      status: typeof parsed.status === "string" ? parsed.status : undefined,
      date: typeof parsed.date === "string" ? parsed.date : undefined
    };
  } catch {
    return {
      title: "Invalid JSON",
      slug: undefined,
      status: undefined,
      date: undefined
    };
  }
}

async function loadCollection(collection: AdminCollectionKey): Promise<AdminRecord[]> {
  const directory = path.join(markdownRoot, collection);
  const format = collectionFormats[collection];

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((entry) => (format === "markdown" ? entry.endsWith(".md") : entry.endsWith(".json")))
      .sort();

    return Promise.all(
      files.map(async (fileName) => {
        const relativePath = path.posix.join(collection, fileName);
        const source = await fs.readFile(path.join(directory, fileName), "utf8");
        const meta = format === "markdown" ? parseMarkdownMeta(source) : parseJsonMeta(source);

        return {
          collection,
          relativePath,
          fileName,
          format,
          title: meta.title,
          slug: meta.slug,
          status: meta.status,
          date: meta.date,
          source
        } satisfies AdminRecord;
      })
    );
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function getAdminSlideAssets(): Promise<AdminSlideAsset[]> {
  const slidesDir = path.join(markdownRoot, "assets", "slides");

  try {
    const entries = await fs.readdir(slidesDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        fileName: entry.name,
        relativePath: path.posix.join("assets", "slides", entry.name),
        mediaUrl: `/media/assets/slides/${entry.name}`
      }))
      .sort((left, right) => left.fileName.localeCompare(right.fileName));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function getAdminRecords() {
  const collections = await Promise.all([
    loadCollection("events"),
    loadCollection("vendors"),
    loadCollection("sliders"),
    loadCollection("organizers")
  ]);

  return collections.flat().sort((left, right) => {
    if (left.collection !== right.collection) {
      return left.collection.localeCompare(right.collection);
    }

    return left.fileName.localeCompare(right.fileName);
  });
}
