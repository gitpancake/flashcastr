"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fromUnixTime } from "date-fns";
import formatTimeAgo from "~/lib/help/formatTimeAgo";
import { getImageUrl } from "~/lib/help/getImageUrl";
import { useFlashLinks } from "~/hooks/useFlashLinks";
import { FlashWithLinkInfo } from "~/lib/flashLinks";

interface InvaderLocation {
  i: number;
  n: string;
  l: {
    lat: number;
    lng: number;
  };
  t: string;
}

interface FlashLinkModalProps {
  invader: InvaderLocation;
  fid: number;
  isOpen: boolean;
  onClose: () => void;
}

export function FlashLinkModal({ invader, fid, isOpen, onClose }: FlashLinkModalProps) {
  const [flashes, setFlashes] = useState<FlashWithLinkInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { linkFlash, unlinkFlash, fetchLinkableFlashes } = useFlashLinks(fid);

  // Extract city from invader name (e.g., "PA_01" -> "Paris")
  const getCityFromInvaderId = (invaderId: string): string => {
    const cityCode = invaderId.split('_')[0];
    // Map of city codes - add more as needed
    const cityMap: Record<string, string> = {
      'PA': 'Paris',
      'LDN': 'London',
      'NYC': 'New York',
      'TKY': 'Tokyo',
      'BCN': 'Barcelona',
      'ROM': 'Rome',
      'AMS': 'Amsterdam',
      'BER': 'Berlin',
      'LA': 'Los Angeles',
      'MAD': 'Madrid',
      'MIL': 'Milan',
      'BRU': 'Brussels'
    };
    return cityMap[cityCode] || cityCode;
  };

  const invaderCity = getCityFromInvaderId(invader.n);

  // Load flashes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFlashes();
    }
  }, [isOpen, invader.n]);

  const loadFlashes = async () => {
    setLoading(true);
    setError(null);
    try {
      const linkableFlashes = await fetchLinkableFlashes(invaderCity);
      setFlashes(linkableFlashes);
    } catch (err) {
      console.error('Error loading flashes:', err);
      setError('Failed to load flashes');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkFlash = async (flashId: number) => {
    try {
      await linkFlash(flashId, invader, invaderCity);
      // Reload flashes to update link status
      await loadFlashes();
    } catch (err) {
      console.error('Error linking flash:', err);
      setError('Failed to link flash');
    }
  };

  const handleUnlinkFlash = async (flashId: number) => {
    try {
      await unlinkFlash(flashId);
      // Reload flashes to update link status
      await loadFlashes();
    } catch (err) {
      console.error('Error unlinking flash:', err);
      setError('Failed to unlink flash');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 font-mono">
      <div className="bg-gray-900 border-2 border-green-400 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-green-400 text-black px-4 py-2 flex justify-between items-center">
          <div className="text-sm font-bold">
            [LINK FLASH] {invader.n}
          </div>
          <button
            onClick={onClose}
            className="text-black hover:bg-black hover:text-green-400 px-2 py-1 border border-black transition-all"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="text-green-400 text-sm animate-pulse">
                LOADING FLASHES...
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 text-sm mb-2">[!] ERROR</div>
              <div className="text-gray-400 text-xs">{error}</div>
              <button
                onClick={loadFlashes}
                className="mt-4 px-4 py-2 text-xs border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all"
              >
                [RETRY]
              </button>
            </div>
          )}

          {!loading && !error && flashes.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-sm mb-2">NO FLASHES IN {invaderCity.toUpperCase()}</div>
              <div className="text-gray-500 text-xs">
                You need to capture a flash in {invaderCity} to link it
              </div>
            </div>
          )}

          {!loading && !error && flashes.length > 0 && (
            <div className="space-y-3">
              <div className="text-green-400 text-xs font-bold mb-2">
                YOUR FLASHES IN {invaderCity.toUpperCase()}:
              </div>

              {flashes.map((flashData) => {
                const flash = flashData.flash;
                const linkedTo = flashData.linked_to;
                const isLinkedToThisInvader = linkedTo?.invader_id === invader.n;
                const isLinkedToOther = linkedTo && !isLinkedToThisInvader;
                const timestampSeconds = Math.floor(flash.timestamp / 1000);
                const timestamp = fromUnixTime(timestampSeconds);

                return (
                  <div
                    key={flash.flash_id}
                    className="bg-black border border-gray-600 p-3 flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-20 relative border border-gray-600">
                      <Image
                        src={getImageUrl(flash)}
                        alt={`Flash ${flash.flash_id}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-green-400 text-xs font-bold">
                        #{flash.flash_id}
                      </div>
                      <div className="text-gray-400 text-[10px]">
                        {formatTimeAgo(timestamp)}
                      </div>
                      <div className="text-white text-xs mt-1">
                        {flash.city} • {flash.player}
                      </div>
                      {isLinkedToOther && (
                        <div className="text-cyan-400 text-[10px] mt-1">
                          ↗ LINKED TO {linkedTo.invader_name}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      {isLinkedToThisInvader ? (
                        <button
                          onClick={() => handleUnlinkFlash(flash.flash_id)}
                          className="px-3 py-2 text-[10px] font-bold border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-all whitespace-nowrap"
                        >
                          [X] UNLINK
                        </button>
                      ) : isLinkedToOther ? (
                        <button
                          onClick={() => handleLinkFlash(flash.flash_id)}
                          className="px-3 py-2 text-[10px] font-bold border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all whitespace-nowrap"
                        >
                          [↗] RELINK
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLinkFlash(flash.flash_id)}
                          className="px-3 py-2 text-[10px] font-bold border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all whitespace-nowrap"
                        >
                          [+] LINK
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-600 px-4 py-3">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-xs font-bold border border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400 transition-all"
          >
            [ESC] CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
