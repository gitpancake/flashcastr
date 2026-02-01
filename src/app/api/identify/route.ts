import { NextRequest, NextResponse } from "next/server";

const EMBEDDINGS_API_URL = process.env.EMBEDDINGS_API_URL || "https://embeddings.flashcastr.app";
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://fuchsia-rich-lungfish-648.mypinata.cloud/ipfs";

export async function POST(request: NextRequest) {
  try {
    const { ipfs_cid, top_k = 5 } = await request.json();

    if (!ipfs_cid) {
      return NextResponse.json({ error: "ipfs_cid is required" }, { status: 400 });
    }

    // Fetch the image from IPFS
    const imageUrl = `${IPFS_GATEWAY}/${ipfs_cid}`;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image from IPFS" }, { status: 500 });
    }

    const imageBlob = await imageResponse.blob();

    // Create form data for embeddings API
    const formData = new FormData();
    formData.append("file", imageBlob, "image.jpg");

    // Call embeddings API
    const embeddingsResponse = await fetch(`${EMBEDDINGS_API_URL}/identify?top_k=${top_k}`, {
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
