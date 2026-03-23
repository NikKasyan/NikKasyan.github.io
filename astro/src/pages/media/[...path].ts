import type { APIRoute } from "astro";
import { getContentType, getStaticMediaPaths, readMediaFile } from "../../lib/content";

export async function getStaticPaths() {
  const paths = await getStaticMediaPaths();
  return paths.map((assetPath) => ({
    params: {
      path: assetPath
    }
  }));
}

export const GET: APIRoute = async ({ params }) => {
  const mediaPath = params.path;

  if (!mediaPath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { buffer, absolutePath } = await readMediaFile(mediaPath);
    return new Response(buffer, {
      headers: {
        "Content-Type": getContentType(absolutePath),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
