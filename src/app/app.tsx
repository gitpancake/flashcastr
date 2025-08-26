import AppInitializer from "~/components/organism/AppInitializer";
import { FlashesApi, FlashResponse } from "~/lib/api.flashcastr.app/flashes";
import { FETCH } from "~/lib/constants";

export default async function App() {
  let initialFlashes: FlashResponse[] = [];
  
  try {
    initialFlashes = await new FlashesApi().getFlashes(FETCH.INITIAL_PAGE, FETCH.LIMIT);
  } catch (error) {
    console.error("Failed to fetch initial flashes, using empty array:", error);
    // App will work in fallback mode with empty flashes
  }

  return <AppInitializer initialFlashes={initialFlashes} />;
}
