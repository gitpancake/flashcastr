"use client";

import sdk from "@farcaster/frame-sdk";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCreateSigner } from "~/hooks/useCreateAndStoreSigner";
import { usePollSigner } from "~/hooks/usePollSigner";
import { LOCAL_STORAGE_KEYS } from "~/lib/constants";

type FarcasterUser = {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
};

export default function Setup() {
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null);

  const router = useRouter();

  const { mutateAsync: createAndStoreSigner } = useCreateSigner((signer) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_USER, JSON.stringify(signer));
    setFarcasterUser(signer);
  });

  usePollSigner(
    username,
    (user) => {
      setFarcasterUser(user);
    },
    farcasterUser
  );

  return (
    <div className="flex items-center justify-center bg-black">
      <div className="px-8 max-w-md w-full flex flex-col gap-4 items-center shadow-lg">
        <h1 className="font-invader text-white text-3xl text-center tracking-wide">
          CAST YOUR
          <br />
          FLASHES
        </h1>
        {!farcasterUser ? (
          <>
            <div className="text-gray-300 text-center text-xs">Join @henry & many others who are already flashcasting</div>
            <div className="w-full text-left flex flex-col gap-4">
              <h2 className="text-white text-lg font-semibold">How it works</h2>
              <div className="flex flex-col gap-2">
                <p className="text-white text-sm">Flashcastr automatically casts from your Farcaster account whenever you flash a space invader using the Flash Invaders app.</p>
                <p className="text-white text-sm">If you do not have a Flash Invaders account, you need to download the app and create an account. Then return to this app and enter your username.</p>
                <p className="text-white text-sm">{`Ensure that your Flash Invaders username is set to 'public'.`}</p>
                <p className="text-white text-sm">Set your username below, then sign in. Flashcastr needs permission to cast on your behalf.</p>
                <p className="text-white text-sm">After setup, your historic sync will begin. This can take up to 10 minutes.</p>
                <p className="text-white text-sm">Auto-cast can be toggled on/off depending on how much you would like to share</p>
              </div>
            </div>
            <div className="w-full flex flex-col items-start">
              <label className="font-invader text-white text-sm tracking-widest">Enter Flash Invaders Username</label>
              <input
                type="text"
                className="w-full bg-black border border-white text-white px-4 py-2 font-invader text-lg tracking-widest outline-none placeholder-white"
                placeholder="USERNAME..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button
              onClick={async () => {
                setLoading(true);

                try {
                  await createAndStoreSigner();
                } catch {
                  toast.error("An error occurred, please message @flashcastr on Farcaster");
                } finally {
                  setLoading(false);
                }
              }}
              className={`w-full bg-[#8A63D2] text-white font-invader text-xl py-3 rounded transition-colors tracking-widest ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-75"}`}
              disabled={!username || loading}
            >
              {loading ? "SAVING..." : "SAVE"}
            </button>
          </>
        ) : farcasterUser?.status == "pending_approval" && farcasterUser?.signer_approval_url ? (
          <div className="flex flex-col items-center gap-8">
            <p className="text-white text-sm text-center">Please scan the QR code below and approve Flashcastr to cast on your behalf. If you are on mobile, please click the button below.</p>
            <QRCodeSVG value={farcasterUser.signer_approval_url} />
            <button
              onClick={async () => {
                if (farcasterUser.signer_approval_url) {
                  await sdk.actions.openUrl(farcasterUser.signer_approval_url);
                }
              }}
              className="px-4 bg-[#8A63D2] hover:bg-purple-600 text-white font-invader text-xl py-3 rounded transition-colors tracking-widest"
            >
              I am on mobile
            </button>
          </div>
        ) : farcasterUser?.status === "approved" ? (
          <>
            <div className="w-full text-left flex flex-col gap-4">
              <h2 className="text-white text-lg font-semibold">Approved!</h2>
              <div className="flex flex-col gap-2">
                <p className="text-white text-sm">Flashcastr automatically casts from your Farcaster account whenever you flash a space invader using the Flash Invaders app.</p>
                <p className="text-white text-sm">{`Ensure that your Flash Invaders username is set to 'public'.`}</p>
              </div>
              <button
                onClick={async () => {
                  await sdk.actions
                    .addFrame()
                    .then(() => {
                      router.push("/profile");
                    })
                    .catch(() => {
                      router.push("/profile");
                    });
                }}
                className="w-full bg-[#8A63D2] hover:bg-purple-600 text-white font-invader text-base py-1 rounded transition-colors tracking-widest"
              >
                Add to My Apps
              </button>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
