import AppInitializer from "~/components/organism/AppInitializer";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { FETCH } from "~/lib/constants";

export default async function App() {
  const initialFlashes = await new FlashesApi().getFlashes(FETCH.INITIAL_PAGE, FETCH.LIMIT);

  return <AppInitializer initialFlashes={initialFlashes} />;
}
