"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IPFS } from "~/lib/constants";
import { useKeyboardShortcuts } from "~/hooks/useKeyboardShortcuts";

interface FlashIdentificationInfo {
  id: number;
  matched_flash_id: string;
  matched_flash_name: string | null;
  similarity: number;
  confidence: number;
}

interface IdentifyMatch {
  flash_id: number;
  flash_name: string;
  similarity: number;
  confidence: number;
}

interface FlashData {
  flash_id: number;
  city: string;
  player: string;
  img: string;
  ipfs_cid?: string | null;
  text: string;
  timestamp: number;
  farcaster_username?: string;
  farcaster_pfp?: string;
  farcaster_fid?: number;
  cast_hash?: string;
  identification?: FlashIdentificationInfo;
}

interface FlashPageClientProps {
  flash: FlashData;
  timeAgo: string;
}

function getFlashImageUrl(flash: FlashData): string {
  if (!flash.ipfs_cid?.trim()) {
    return '';
  }
  return `${IPFS.GATEWAY}${flash.ipfs_cid}`;
}

function generateShareText(flash: FlashData, currentUrl: string): string {
  return `[>] Space Invaders Flash #${flash.flash_id}

[IMG] by @${flash.farcaster_username || flash.player}
[LOC] ${flash.city}${flash.text ? `\n[TXT] "${flash.text}"` : ''}

Check it out on Flashcastr
${currentUrl}`;
}

export default function FlashPageClient({ flash, timeAgo }: FlashPageClientProps) {
  const router = useRouter();

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [identifyMatches, setIdentifyMatches] = useState<IdentifyMatch[]>([]);
  const [identifyError, setIdentifyError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [currentIdentification, setCurrentIdentification] = useState(flash.identification);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = async () => {
    const currentUrl = window.location.href;
    const shareText = generateShareText(flash, currentUrl);
    try {
      await navigator.clipboard.writeText(shareText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
    setShowShareMenu(false);
  };

  const handleShareToFarcaster = () => {
    const currentUrl = window.location.href;
    const shareText = generateShareText(flash, currentUrl);
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://warpcast.com/~/compose?text=${encodedText}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareToTwitter = () => {
    const currentUrl = window.location.href;
    const shareText = generateShareText(flash, currentUrl);
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
    setShowShareMenu(false);
  };

  const handleIdentify = async () => {
    if (!flash.ipfs_cid) {
      setIdentifyError("No IPFS CID available for this flash");
      return;
    }

    setShowIdentifyModal(true);
    setIdentifyLoading(true);
    setIdentifyError(null);
    setIdentifyMatches([]);

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipfs_cid: flash.ipfs_cid, top_k: 5 }),
      });

      if (!response.ok) {
        throw new Error('Failed to identify flash');
      }

      const data = await response.json();
      setIdentifyMatches(data.matches || []);
    } catch (error) {
      console.error('Identify error:', error);
      setIdentifyError('Failed to identify flash. Please try again.');
    } finally {
      setIdentifyLoading(false);
    }
  };

  const handleSelectMatch = async (match: IdentifyMatch) => {
    if (!flash.ipfs_cid) return;

    setSavingId(match.flash_id);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_FLASHCASTR_API_URL;
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation SaveFlashIdentification($source_ipfs_cid: String!, $matched_flash_id: String!, $matched_flash_name: String, $similarity: Float!, $confidence: Float!) {
              saveFlashIdentification(source_ipfs_cid: $source_ipfs_cid, matched_flash_id: $matched_flash_id, matched_flash_name: $matched_flash_name, similarity: $similarity, confidence: $confidence) {
                id
                matched_flash_id
                matched_flash_name
                similarity
                confidence
              }
            }
          `,
          variables: {
            source_ipfs_cid: flash.ipfs_cid,
            matched_flash_id: match.flash_id.toString(),
            matched_flash_name: match.flash_name,
            similarity: match.similarity,
            confidence: match.confidence,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to save identification');
      }

      // Update local state with new identification
      setCurrentIdentification({
        id: result.data.saveFlashIdentification.id,
        matched_flash_id: result.data.saveFlashIdentification.matched_flash_id,
        matched_flash_name: result.data.saveFlashIdentification.matched_flash_name,
        similarity: result.data.saveFlashIdentification.similarity,
        confidence: result.data.saveFlashIdentification.confidence,
      });

      setShowIdentifyModal(false);
    } catch (error) {
      console.error('Save identification error:', error);
      setIdentifyError('Failed to save identification. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onBack: handleBack,
    onShare: handleShare,
  });

  // Determine display name: use identification if confidence >= 80%, otherwise flash_id
  const hasHighConfidenceId = currentIdentification?.confidence && currentIdentification.confidence >= 0.8;
  const displayName = hasHighConfidenceId && currentIdentification?.matched_flash_name
    ? currentIdentification.matched_flash_name
    : `#${flash.flash_id.toLocaleString()}`;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 font-mono bg-black min-h-screen">
      {/* Action Bar */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={handleBack}
          className="p-2 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 font-bold text-xs"
        >
          [&larr;] BACK
        </button>

        <div className="flex-1"></div>

        {/* Identify Button - only show if no high-confidence identification */}
        {!hasHighConfidenceId && flash.ipfs_cid && (
          <button
            onClick={handleIdentify}
            className="p-2 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200 font-bold text-xs"
          >
            [?] IDENTIFY
          </button>
        )}

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={handleShare}
            className="p-2 border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-200 font-bold text-xs"
          >
            [&nearr;] SHARE
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-1 bg-gray-900 border-2 border-purple-400 z-50 min-w-[160px]">
              <button
                onClick={handleShareToFarcaster}
                className="w-full text-left px-3 py-2 text-purple-400 hover:bg-gray-800 text-xs transition-colors duration-200"
              >
                [FC] FARCASTER
              </button>
              <button
                onClick={handleShareToTwitter}
                className="w-full text-left px-3 py-2 text-purple-400 hover:bg-gray-800 text-xs transition-colors duration-200"
              >
                [TW] TWITTER
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-3 py-2 text-purple-400 hover:bg-gray-800 text-xs transition-colors duration-200"
              >
                [CP] COPY LINK
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Copy Success Message */}
      {copySuccess && (
        <div className="mb-4 p-2 bg-green-900 border border-green-400 text-green-400 text-xs">
          [OK] COPIED TO CLIPBOARD
        </div>
      )}

      {/* Flash Card - Blown Up Version */}
      <div className="bg-black border-2 border-green-400 overflow-hidden relative">
        {/* Flash Image */}
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={getFlashImageUrl(flash)}
            alt={`Flash ${flash.flash_id}`}
            fill
            className="object-cover"
          />
        </div>

        {/* Flash Info - Match Feed UI */}
        <div className="p-4 space-y-3 bg-gray-900">
          {/* Flash Name/ID */}
          <div className="text-green-400 text-lg font-bold">
            {displayName}
          </div>

          {/* Identification badge if available */}
          {currentIdentification && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
              hasHighConfidenceId
                ? 'bg-green-900 border border-green-400 text-green-400'
                : 'bg-yellow-900 border border-yellow-400 text-yellow-400'
            }`}>
              {hasHighConfidenceId ? '[ID VERIFIED]' : '[ID PENDING]'}
              <span className="opacity-70">
                {(currentIdentification.confidence * 100).toFixed(0)}%
              </span>
            </div>
          )}

          {/* Clickable User Info - Match Feed Design */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 -mx-2 rounded transition-colors duration-200"
            onClick={() => {
              const fid = flash.farcaster_fid || flash.player;
              router.push(`/profile/${fid}`);
            }}
          >
            {flash.farcaster_pfp && (
              <Image
                src={flash.farcaster_pfp}
                alt={flash.farcaster_username || flash.player}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <div className="text-white text-sm">
              @ {flash.farcaster_username || flash.player}
            </div>
          </div>

          <div className="text-gray-400 text-sm">
            {">"} {flash.city}
          </div>

          <div className="text-gray-500 text-sm">{timeAgo}</div>

          {/* View on Farcaster link if cast_hash exists */}
          {flash.cast_hash && (
            <a
              href={`https://warpcast.com/~/conversations/${flash.cast_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-purple-400 hover:text-purple-300 text-xs underline"
            >
              View on Farcaster &rarr;
            </a>
          )}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 border-2 border-green-400/20 animate-pulse pointer-events-none" />
      </div>

      {/* Identify Modal */}
      {showIdentifyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-yellow-400 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-yellow-400/30">
              <div className="flex items-center justify-between">
                <h2 className="text-yellow-400 font-bold">IDENTIFY FLASH</h2>
                <button
                  onClick={() => setShowIdentifyModal(false)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  [X]
                </button>
              </div>
            </div>

            <div className="p-4">
              {identifyLoading && (
                <div className="text-center py-8">
                  <div className="text-yellow-400 animate-pulse">Analyzing image...</div>
                </div>
              )}

              {identifyError && (
                <div className="text-red-400 text-sm p-2 bg-red-900/30 border border-red-400 rounded mb-4">
                  {identifyError}
                </div>
              )}

              {!identifyLoading && identifyMatches.length === 0 && !identifyError && (
                <div className="text-gray-400 text-center py-8">
                  No matches found
                </div>
              )}

              {!identifyLoading && identifyMatches.length > 0 && (
                <div className="space-y-2">
                  <div className="text-gray-400 text-xs mb-4">
                    Select the best match:
                  </div>
                  {identifyMatches.map((match) => (
                    <button
                      key={match.flash_id}
                      onClick={() => handleSelectMatch(match)}
                      disabled={savingId !== null}
                      className={`w-full p-3 text-left border rounded transition-all ${
                        savingId === match.flash_id
                          ? 'border-green-400 bg-green-900/30'
                          : 'border-gray-600 hover:border-yellow-400 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{match.flash_name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          match.confidence >= 0.8
                            ? 'bg-green-900 text-green-400'
                            : match.confidence >= 0.5
                            ? 'bg-yellow-900 text-yellow-400'
                            : 'bg-red-900 text-red-400'
                        }`}>
                          {(match.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Flash ID: {match.flash_id}
                      </div>
                      {savingId === match.flash_id && (
                        <div className="text-green-400 text-xs mt-2 animate-pulse">
                          Saving...
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
