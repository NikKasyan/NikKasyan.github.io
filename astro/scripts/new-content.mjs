import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const markdownDir = path.resolve(rootDir, "..", "markdown");

const rl = readline.createInterface({ input, output });

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function nextNumericPrefix(fileNames) {
  const max = fileNames.reduce((current, fileName) => {
    const match = fileName.match(/^(\d+)-/);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);

  return String(max + 1).padStart(3, "0");
}

function uniqueId() {
  return String(Date.now());
}

async function ask(question, fallback = "") {
  const suffix = fallback ? ` (${fallback})` : "";
  const value = (await rl.question(`${question}${suffix}: `)).trim();
  return value || fallback;
}

async function createEvent() {
  const dir = path.join(markdownDir, "events");
  const files = await fs.readdir(dir);
  const prefix = nextNumericPrefix(files);
  const title = await ask("Event title");
  const slug = await ask("Slug", slugify(title));
  const date = await ask("Date and time", "2026-01-01 17:00:00");
  const venue = await ask("Venue", "");
  const venueAddress = await ask("Venue address", "");
  const organizer = await ask("Organizer", "");
  const tagsInput = await ask("Tags comma-separated", "Symposium");
  const sliderIdsInput = await ask("Slider IDs comma-separated", "");
  const body = await ask("Optional body text", "");
  const fileName = `${prefix}-${slug}.md`;
  const filePath = path.join(dir, fileName);
  const tags = tagsInput.split(",").map((value) => value.trim()).filter(Boolean);
  const sliderIds = sliderIdsInput.split(",").map((value) => value.trim()).filter(Boolean);

  const lines = [
    "---",
    `title: \"${title.replaceAll('"', '\\"')}\"`,
    `id: \"${uniqueId()}\"`,
    'type: "tribe_events"',
    'status: "publish"',
    `slug: \"${slug}\"`,
    `date: \"${date}\"`,
    'author: "admin"'
  ];

  if (venue) lines.push(`venue: \"${venue.replaceAll('"', '\\"')}\"`);
  if (venueAddress) lines.push(`venue_address: \"${venueAddress.replaceAll('"', '\\"')}\"`);
  if (organizer) lines.push(`organizer: \"${organizer.replaceAll('"', '\\"')}\"`);
  if (sliderIds.length > 0) {
    lines.push("sliders:");
    sliderIds.forEach((id) => lines.push(`  - \"${id}\"`));
  }
  lines.push("tags:");
  tags.forEach((tag) => lines.push(`  - \"${tag.replaceAll('"', '\\"')}\"`));
  lines.push("---", "");
  if (body) lines.push(body, "");

  await fs.writeFile(filePath, `${lines.join("\n")}`);
  console.log(`Created ${filePath}`);
}

async function createVenue() {
  const dir = path.join(markdownDir, "vendors");
  const files = await fs.readdir(dir);
  const prefix = nextNumericPrefix(files);
  const title = await ask("Venue title");
  const slug = await ask("Slug", slugify(title));
  const content = await ask("Optional description", "");
  const fileName = `${prefix}-${slug}.json`;
  const filePath = path.join(dir, fileName);

  const payload = {
    id: uniqueId(),
    title,
    type: "tribe_venue",
    status: "publish",
    slug,
    date: new Date().toISOString().slice(0, 19).replace("T", " "),
    author: "admin",
    content,
    renderedContent: content,
    tags: [],
    relatedVenueIds: [],
    sliderIds: [],
    menuOrder: 0
  };

  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Created ${filePath}`);
}

async function createSlider() {
  const dir = path.join(markdownDir, "sliders");
  const files = await fs.readdir(dir);
  const prefix = nextNumericPrefix(files);
  const title = await ask("Slider title");
  const slug = await ask("Slug", slugify(title));
  const imageUrlsInput = await ask("Image URLs comma-separated", "");
  const imageUrls = imageUrlsInput.split(",").map((value) => value.trim()).filter(Boolean);
  const sliderId = uniqueId();
  const fileName = `${prefix}-${slug}.json`;
  const filePath = path.join(dir, fileName);

  const slides = imageUrls.map((url, index) => ({
    id: uniqueId() + index,
    title: `${title} image ${index + 1}`,
    type: "ml-slide",
    status: "publish",
    slug: `${slugify(title)}-image-${index + 1}`,
    date: new Date().toISOString().slice(0, 19).replace("T", " "),
    author: "admin",
    renderedContent: "",
    order: index,
    sliderIds: [sliderId],
    image: {
      url
    }
  }));

  const payload = {
    id: sliderId,
    title,
    type: "ml-slider",
    status: "publish",
    slug,
    date: new Date().toISOString().slice(0, 19).replace("T", " "),
    author: "admin",
    renderedContent: "",
    sliderIds: [],
    slides
  };

  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Created ${filePath}`);
  console.log(`Slider ID: ${sliderId}`);
}

const type = process.argv[2];

try {
  if (type === "event") {
    await createEvent();
  } else if (type === "venue") {
    await createVenue();
  } else if (type === "slider") {
    await createSlider();
  } else {
    console.log("Usage: node scripts/new-content.mjs <event|venue|slider>");
    process.exitCode = 1;
  }
} finally {
  rl.close();
}
