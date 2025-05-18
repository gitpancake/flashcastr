"use client";

import sdk from "@farcaster/frame-sdk";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCreateSigner } from "~/hooks/useCreateAndStoreSigner";
import { usePollSigner } from "~/hooks/usePollSigner";
import { FlashesApi } from "~/lib/api.flashcastr.app/flashes";
import { User } from "~/lib/api.flashcastr.app/users";
import { LOCAL_STORAGE_KEYS } from "~/lib/constants";

type SignupProgressStatus =
  | "idle"
  | "username_search_loading"
  | "username_search_found"
  | "username_search_not_found"
  | "username_search_error"
  | "initiating_signup"
  | "pending_approval"
  | "finalizing_signup"
  | "signup_error"
  | "signup_revoked"
  | "signup_timeout";

interface SetupProps {
  onSetupComplete: (user: User) => void;
  onSkip: () => void;
}

export default function Setup({ onSetupComplete, onSkip }: SetupProps) {
  const [signupProgress, setSignupProgress] = useState<SignupProgressStatus>("idle");
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");

  const [signerUuid, setSignerUuid] = useState<string | null>(null);
  const [signerApprovalUrl, setSignerApprovalUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const flashesApi = new FlashesApi();

  const handleUsernameSearch = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username.");
      return;
    }

    if (username.trim().toLowerCase() === "anonymous") {
      setErrorMessage("The username 'Anonymous' is not allowed. Please choose a different username.");
      setSignupProgress("username_search_error");
      setSearchedUsername(username.trim());
      return;
    }

    setSignupProgress("username_search_loading");
    setSearchedUsername(username);
    setErrorMessage(null);

    try {
      const players = await flashesApi.getAllPlayers(username.trim());
      if (players.length > 0) {
        setSignupProgress("username_search_found");
      } else {
        setSignupProgress("username_search_not_found");
      }
    } catch (error) {
      console.error("Failed to search for player:", error);
      toast.error("Error searching for username. Please try again.");
      setSignupProgress("username_search_error");
      setErrorMessage("Error searching for username.");
    }
  };

  const resetStateAndStartOver = () => {
    setSignupProgress("idle");
    setUsername("");
    setSearchedUsername("");
    setErrorMessage(null);
    setSignerUuid(null);
    setSignerApprovalUrl(null);
  };

  const { mutateAsync: initiateSignupMutation, isPending: isInitiatingSignup } = useCreateSigner((response) => {
    setSignerUuid(response.signer_uuid);
    setSignerApprovalUrl(response.signer_approval_url || null);

    if (response.status === "approved" && response.fid && searchedUsername) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FARCASTER_FID, response.fid.toString());
      toast.success("Sign up approved and finalized immediately!");
      if (response.signer_approval_url) {
        setSignupProgress("pending_approval");
      } else {
        setSignupProgress("pending_approval");
      }
    } else if (response.signer_approval_url) {
      setSignupProgress("pending_approval");
    } else {
      setSignupProgress("signup_error");
      setErrorMessage("Unexpected response from signup initiation. No approval URL provided.");
      toast.error("Could not initiate signup properly. No approval URL.");
    }
  });

  const handleProceedToInitiateSignup = async () => {
    setSignupProgress("initiating_signup");
    setErrorMessage(null);
    try {
      const currentUsernameForSignup = searchedUsername || username;
      if (!currentUsernameForSignup) {
        toast.error("Username is missing.");
        setSignupProgress("idle");
        return;
      }
      setSearchedUsername(currentUsernameForSignup);
      await initiateSignupMutation(currentUsernameForSignup);
    } catch (e) {
      setSignupProgress("signup_error");
      if (e instanceof Error) {
        setErrorMessage(e.message || "Failed to start signup process.");
      } else {
        setErrorMessage("An unknown error occurred while starting signup.");
      }
    }
  };

  usePollSigner({
    signerUuid: signerUuid,
    username: searchedUsername,
    enabled: signupProgress === "pending_approval",
    onSuccess: (user: User) => {
      onSetupComplete(user);
    },
    onError: (message: string) => {
      if (message.toLowerCase().includes("timeout")) {
        setSignupProgress("signup_timeout");
      } else if (message.toLowerCase().includes("revoked")) {
        setSignupProgress("signup_revoked");
      } else {
        setSignupProgress("signup_error");
      }
      setErrorMessage(message);
    },
    onSettled: () => {
      if (signupProgress === "pending_approval") {
      }
    },
  });

  const isLoading = signupProgress === "username_search_loading" || isInitiatingSignup || signupProgress === "initiating_signup";

  return (
    <div className="flex items-center justify-center bg-black p-4">
      <div className="px-8 py-10 max-w-md w-full flex flex-col gap-6 items-center shadow-xl bg-gray-900 rounded-lg">
        <h1 className="font-invader text-white text-4xl text-center tracking-wider">LINK FLASH INVADERS</h1>

        {(signupProgress === "idle" ||
          signupProgress === "username_search_error" ||
          signupProgress === "username_search_loading" ||
          signupProgress === "username_search_found" ||
          signupProgress === "username_search_not_found") && (
          <>
            <div className="text-gray-300 text-sm flex flex-col gap-2 mb-2">
              <p>
                Flash Invaders is a game by the artist Invader. Spot and &apos;flash&apos; their street art mosaics hidden in cities around the world using the official app to build your gallery and
                score points.
              </p>
              <p>
                Learn more at the official{" "}
                <a href="https://www.space-invaders.com/flashinvaders/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">
                  Flash Invaders website
                </a>
                .
              </p>
            </div>
            <div className="w-full text-left flex flex-col gap-3">
              <p className="text-gray-300 text-sm">Connect your Flash Invaders account to automatically cast your flashes on Farcaster.</p>
              <p className="text-gray-300 text-sm">Enter your Flash Invaders username (must be public).</p>
            </div>
            <div className="w-full flex flex-col items-start gap-2">
              <label htmlFor="usernameInput" className="font-invader text-white text-md tracking-widest">
                Flash Invaders Username
              </label>
              <input
                id="usernameInput"
                type="text"
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 font-invader text-lg tracking-widest outline-none placeholder-gray-500 rounded-md focus:border-purple-500"
                placeholder="ENTER USERNAME..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.trim());
                  if (signupProgress === "username_search_found" || signupProgress === "username_search_not_found" || signupProgress === "username_search_error") {
                    setSignupProgress("idle");
                  }
                }}
                disabled={signupProgress === "username_search_loading"}
              />
            </div>

            {signupProgress === "idle" && (
              <button
                onClick={handleUsernameSearch}
                className={`w-full bg-[#8A63D2] text-white font-invader text-xl py-3 rounded-md transition-colors tracking-widest ${
                  !username.trim() || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
                }`}
                disabled={!username.trim() || isLoading}
              >
                SEARCH USERNAME
              </button>
            )}
            {signupProgress === "username_search_loading" && <p className="text-purple-400 animate-pulse">Searching for &quot;{searchedUsername}&quot;...</p>}
            {signupProgress === "username_search_error" && errorMessage && (
              <div className="w-full flex flex-col gap-2 items-center text-center">
                <p className="text-red-400">Error: {errorMessage}</p>
                <button onClick={resetStateAndStartOver} className="w-full bg-gray-600 text-white font-invader text-lg py-2 rounded-md hover:bg-gray-700 tracking-widest">
                  TRY DIFFERENT USERNAME
                </button>
              </div>
            )}

            {signupProgress === "username_search_found" && (
              <div className="w-full flex flex-col gap-3 items-center text-center">
                <p className="text-green-400">Found player: &quot;{searchedUsername}&quot;!</p>
                <button onClick={handleProceedToInitiateSignup} className="w-full bg-green-500 text-white font-invader text-lg py-3 rounded-md hover:bg-green-600 tracking-widest">
                  PROCEED AS &quot;{searchedUsername}&quot;
                </button>
                <button onClick={resetStateAndStartOver} className="w-full bg-gray-600 text-white font-invader text-lg py-2 rounded-md hover:bg-gray-700 tracking-widest">
                  TRY DIFFERENT USERNAME
                </button>
              </div>
            )}

            {signupProgress === "username_search_not_found" && (
              <div className="w-full flex flex-col gap-3 items-center text-center">
                <p className="text-yellow-400">Player &quot;{searchedUsername}&quot; not found. Ensure username is correct and public.</p>
                <p className="text-yellow-400 text-xs">Note: Player data is indexed periodically. New accounts may take time to appear.</p>
                <button onClick={handleProceedToInitiateSignup} className="w-full bg-yellow-500 text-black font-invader text-lg py-3 rounded-md hover:bg-yellow-600 tracking-widest">
                  PROCEED ANYWAY WITH &quot;{searchedUsername}&quot;
                </button>
                <button onClick={resetStateAndStartOver} className="w-full bg-gray-600 text-white font-invader text-lg py-2 rounded-md hover:bg-gray-700 tracking-widest">
                  TRY DIFFERENT USERNAME
                </button>
              </div>
            )}

            {(signupProgress === "idle" || signupProgress === "username_search_error" || signupProgress === "username_search_found" || signupProgress === "username_search_not_found") &&
              !isLoading && (
                <button
                  onClick={onSkip}
                  className="w-full text-gray-400 hover:text-white font-invader text-md py-2 rounded-md transition-colors tracking-widest mt-2 border border-gray-700 hover:border-gray-500"
                >
                  SKIP FOR NOW
                </button>
              )}
          </>
        )}

        {(signupProgress === "initiating_signup" || isInitiatingSignup) && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-purple-400 animate-pulse text-lg">Preparing your Farcaster connection for &quot;{searchedUsername}&quot;...</p>
          </div>
        )}

        {signupProgress === "pending_approval" && signerApprovalUrl && (
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-white text-md">Scan the QR code with your Farcaster app (e.g., Warpcast) to approve Flashcastr.</p>
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={signerApprovalUrl} size={256} />
            </div>
            <p className="text-gray-400 text-sm">Or click below if you&apos;re on mobile:</p>
            <button
              onClick={async () => {
                if (signerApprovalUrl) {
                  await sdk.actions.openUrl(signerApprovalUrl);
                }
              }}
              className="w-full max-w-xs bg-[#8A63D2] hover:bg-purple-700 text-white font-invader text-xl py-3 rounded-md transition-colors tracking-widest"
            >
              APPROVE ON MOBILE
            </button>
            <p className="text-purple-400 animate-pulse text-md mt-2">Waiting for approval...</p>
            <button
              onClick={resetStateAndStartOver}
              className="w-full max-w-xs text-gray-400 hover:text-white font-invader text-md py-2 rounded-md transition-colors tracking-widest mt-4 border border-gray-700 hover:border-gray-500"
            >
              CANCEL / CHANGE USERNAME
            </button>
          </div>
        )}

        {(signupProgress === "signup_error" || signupProgress === "signup_timeout" || signupProgress === "signup_revoked") && errorMessage && (
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-red-400 text-2xl font-semibold">
              {signupProgress === "signup_timeout" ? "Signup Timed Out" : signupProgress === "signup_revoked" ? "Approval Revoked" : "Signup Failed"}
            </h2>
            <p className="text-white">{errorMessage}</p>
            <button onClick={resetStateAndStartOver} className="w-full max-w-xs bg-gray-600 hover:bg-gray-700 text-white font-invader text-xl py-3 rounded-md transition-colors tracking-widest mt-2">
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
