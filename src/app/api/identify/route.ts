import { NextRequest, NextResponse } from "next/server";

const EMBEDDINGS_API_URL = process.env.EMBEDDINGS_API_URL || "https://embeddings.flashcastr.app";
const LEGACY_IMAGE_HOST = "api.space-invaders.com";

function allowedImageHosts(): Set<string> {
  const hosts = new Set([LEGACY_IMAGE_HOST]);
  try {
    const apiHost = new URL(process.env.NEXT_PUBLIC_FLASHCASTR_API_URL || "").hostname;
    if (apiHost) hosts.add(apiHost);
  } catch {}
  return hosts;
}

function isAllowedImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedImageHosts().has(url.hostname);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image_url, ipfs_cid, top_k = 5 } = await request.json();

    if (typeof ipfs_cid !== "string" || !/^[A-Za-z0-9]+$/.test(ipfs_cid)) {
      return NextResponse.json({ error: "Valid ipfs_cid is required" }, { status: 400 });
    }

    if (!isAllowedImageUrl(image_url)) {
      return NextResponse.json({ error: "Valid image_url is required" }, { status: 400 });
    }

    const topKNumber = Number(top_k);
    const clampedTopK = Number.isInteger(topKNumber) ? Math.min(Math.max(topKNumber, 1), 20) : 5;

    const imageResponse = await fetch(image_url);

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }

    const imageBlob = await imageResponse.blob();

    const formData = new FormData();
    formData.append("file", imageBlob, "image.jpg");

    const embeddingsResponse = await fetch(`${EMBEDDINGS_API_URL}/identify?top_k=${clampedTopK}`, {
      method: "POST",
      body: formData,
    });

    if (!embeddingsResponse.ok) {
      const errorText = await embeddingsResponse.text();
      console.error("Embeddings API error:", errorText);
      return NextResponse.json({ error: "Failed to identify flash" }, { status: 500 });
    }

    const result = await embeddingsResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Identify API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
