import Image from "next/image";
import { notFound } from "next/navigation";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";

export default async function FlashPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flashesApi = new FlashesApi();
  const flash = await flashesApi.getFlashById(id);

  if (!flash) return notFound();

  return (
    <div className="max-w-xl mx-auto p-4">
      <Image src={flash.flash.img} alt={`Flash #${flash.flash.flash_id}`} width={1920} height={1080} className="w-full rounded-lg shadow-lg mb-4" priority />
      <div className="bg-gray-900 rounded-lg p-4 text-white">
        <div className="text-lg font-bold mb-2">Flash #{flash.flash.flash_id}</div>
        <div className="mb-1">
          Player: <span className="font-mono">{flash.flash.player}</span>
        </div>
        <div className="mb-1">
          City: <span className="font-mono">{flash.flash.city}</span>
        </div>
      </div>
    </div>
  );
}
