import { NextResponse } from "next/server";
import { getFarcasterMetadata } from "../../../lib/farcaster/metadata";

export async function GET() {
  try {
    const config = await getFarcasterMetadata();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error generating metadata:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
