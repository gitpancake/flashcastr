"use client";

import sdk from "@farcaster/frame-sdk";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSigner } from "~/hooks/useCreateAndStoreSigner";
import { usePollSigner } from "~/hooks/usePollSigner";
import { User } from "~/lib/api.flashcastr.app/users";

type Phase =
  | "idle"
  | "initiating"
  | "pending_approval"
  | "error"
  | "revoked"
  | "timeout";

export const RefreshSigner = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [phase, setPhase] = useState<Phase>("idle");
  const [signerUuid, setSignerUuid] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = () => {
    setPhase("idle");
    setUsername(user.username);
    setSignerUuid(null);
    setApprovalUrl(null);
    setErrorMessage(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const { mutateAsync: initiateSignup, isPending } = useCreateSigner((response) => {
    setSignerUuid(response.signer_uuid);
    setApprovalUrl(response.signer_approval_url || null);
    if (response.signer_approval_url) {
      setPhase("pending_approval");
    } else {
      setPhase("error");
      setErrorMessage("No approval URL returned.");
    }
  });

  const handleStart = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      toast.error("Username required.");
      return;
    }
    if (trimmed.toLowerCase() === "anonymous") {
      setPhase("error");
      setErrorMessage("Username 'Anonymous' not allowed.");
      return;
    }
    setPhase("initiating");
    setErrorMessage(null);
    try {
      await initiateSignup(trimmed);
    } catch (e) {
      setPhase("error");
      setErrorMessage(e instanceof Error ? e.message : "Failed to start refresh.");
    }
  };

  usePollSigner({
    signerUuid,
    username: username.trim(),
    enabled: phase === "pending_approval",
    onSuccess: () => {
      toast.success("Signer refreshed.");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      close();
    },
    onError: (message: string) => {
      const lower = message.toLowerCase();
      if (lower.includes("timeout")) setPhase("timeout");
      else if (lower.includes("revoked")) setPhase("revoked");
      else setPhase("error");
      setErrorMessage(message);
    },
  });

  if (!open) {
    return (
      <div className="flex flex-col w-full gap-0 px-4">
        <p className="text-cyan-400 text-base">Refresh Neynar Signer</p>
        <div className="flex gap-2 items-center">
          <p className="text-white text-sm basis-10/12">
            Generate new signer if auto-casting stops working or you revoked the old one.
          </p>
          <button
            onClick={() => setOpen(true)}
            className="grow text-cyan-400 hover:text-white text-xs border border-cyan-400 px-2 py-1"
          >
            REFRESH
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-2 px-4 py-3 border border-cyan-400 bg-black">
      <div className="flex justify-between items-center">
        <p className="text-cyan-400 text-base font-bold">REFRESH NEYNAR SIGNER</p>
        <button onClick={close} className="text-gray-400 hover:text-white text-xs">
          [X]
        </button>
      </div>

      {(phase === "idle" || phase === "error") && (
        <>
          <div>
            <div className="text-green-400 text-xs font-bold mb-1">USERNAME</div>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 text-sm font-mono focus:border-green-400 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="your.username"
            />
            <div className="text-gray-500 text-[10px] mt-1">
              Flash Invaders username. Edit if you want to relink under different name.
            </div>
          </div>
          {phase === "error" && errorMessage && (
            <div className="text-red-400 text-xs">ERROR: {errorMessage}</div>
          )}
          <button
            onClick={handleStart}
            disabled={!username.trim() || isPending}
            className={`w-full p-2 border-2 transition-all duration-200 font-bold text-xs ${
              !username.trim() || isPending
                ? "border-gray-600 text-gray-600 cursor-not-allowed"
                : "border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
            }`}
          >
            [G] GENERATE NEW SIGNER
          </button>
        </>
      )}

      {(phase === "initiating" || isPending) && (
        <div className="text-center py-6">
          <div className="text-cyan-400 text-xs animate-pulse mb-1">CONNECTING...</div>
          <div className="text-gray-500 text-[10px]">{`>> Preparing "${username.trim()}" <<`}</div>
        </div>
      )}

      {phase === "pending_approval" && approvalUrl && (
        <div className="text-center">
          <div className="text-cyan-400 text-xs font-bold mb-2">APPROVE NEW SIGNER</div>
          <div className="text-gray-400 text-[10px] mb-3">Scan QR with Farcaster app</div>
          <div className="bg-white p-3 mb-3 inline-block">
            <QRCodeSVG value={approvalUrl} size={160} />
          </div>
          <div className="space-y-2 mb-2">
            <button
              onClick={async () => {
                if (approvalUrl) await sdk.actions.openUrl(approvalUrl);
              }}
              className="w-full p-2 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-200 font-bold text-xs"
            >
              [M] APPROVE ON MOBILE
            </button>
            <button
              onClick={reset}
              className="w-full p-2 border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white text-xs"
            >
              [ESC] CANCEL
            </button>
          </div>
          <div className="text-cyan-400 text-[10px] animate-pulse">{`>> WAITING FOR APPROVAL <<`}</div>
        </div>
      )}

      {(phase === "timeout" || phase === "revoked") && (
        <div className="text-center py-3">
          <div className="text-red-400 text-xs font-bold mb-1">
            {phase === "timeout" ? "TIMEOUT" : "REVOKED"}
          </div>
          <div className="text-gray-400 text-[10px] mb-3">{errorMessage}</div>
          <button
            onClick={reset}
            className="w-full p-2 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-black font-bold text-xs"
          >
            [R] TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
