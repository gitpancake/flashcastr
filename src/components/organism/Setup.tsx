"use client";

import sdk, { SignIn as SignInCore } from "@farcaster/frame-sdk";
import { QRCodeSVG } from "qrcode.react";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getCsrfToken, signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const [signingIn, setSigningIn] = useState(false);
  
  const [signupProgress, setSignupProgress] = useState<SignupProgressStatus>("idle");
  const [username, setUsername] = useState("");
  const [searchedUsername, setSearchedUsername] = useState("");

  const [signerUuid, setSignerUuid] = useState<string | null>(null);
  const [signerApprovalUrl, setSignerApprovalUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const flashesApi = new FlashesApi();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      setSigningIn(true);

      const nonce = await getNonce();
      const result = await sdk.actions.signIn({ nonce });

      await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false, // Don't redirect, stay in setup flow
      });
    } catch (e) {
      if (e instanceof SignInCore.RejectedByUser) {
        // User rejected, they can try again
        setSigningIn(false);
        return;
      }
      setSigningIn(false);
      setErrorMessage("Failed to sign in with Farcaster");
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

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
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-6 font-mono bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-black border-2 border-green-400 p-4 relative">
        {/* ASCII Header */}
        <div className="text-center mb-4">
          <pre className="text-green-400 text-[8px] sm:text-[10px] leading-none mb-2">
{`
██╗     ██╗███╗   ██╗██╗  ██╗
██║     ██║████╗  ██║██║ ██╔╝
██║     ██║██╔██╗ ██║█████╔╝ 
██║     ██║██║╚██╗██║██╔═██╗ 
███████╗██║██║ ╚████║██║  ██╗
╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝

 ██████╗  ██████╗ ██████╗ ██████╗ ██╗   ██╗███╗   ██╗████████╗
██╔══██╗██╔════╝██╔════╝██╔═══██╗██║   ██║████╗  ██║╚══██╔══╝
███████║██║     ██║     ██║   ██║██║   ██║██╔██╗ ██║   ██║   
██╔══██║██║     ██║     ██║   ██║██║   ██║██║╚██╗██║   ██║   
██║  ██║╚██████╗╚██████╗╚██████╔╝╚██████╔╝██║ ╚████║   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   
`}
          </pre>
          <div className="text-gray-400 text-xs">CONNECT FLASH INVADERS ACCOUNT</div>
        </div>

        {/* Show Farcaster Sign-in first if not authenticated */}
        {!session ? (
          <div className="text-center">
            <div className="bg-gray-900 border border-gray-600 p-3 mb-4 text-xs">
              <div className="text-green-400 font-bold mb-2">STEP 1: FARCASTER AUTH</div>
              <div className="text-gray-300 leading-relaxed">
                <p>Sign in with Farcaster to connect your Flash Invaders account.</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className={`w-full p-2 border-2 transition-all duration-200 font-bold text-xs ${
                  signingIn 
                    ? "border-gray-600 text-gray-600 cursor-not-allowed" 
                    : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                }`}
              >
                {signingIn ? "SIGNING IN..." : "[S] SIGN IN WITH FARCASTER"}
              </button>
              
              <button
                onClick={onSkip}
                className="w-full p-2 border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white transition-all duration-200 text-xs"
              >
                [ESC] SKIP FOR NOW
              </button>
            </div>
            
            {errorMessage && (
              <div className="text-red-400 text-xs mb-2">{errorMessage}</div>
            )}
          </div>
        ) : (
          <>
            {/* Flash Invaders Account Setup - Only shown after Farcaster auth */}
            <div className="bg-gray-900 border border-gray-600 p-3 mb-4 text-xs">
              <div className="text-green-400 font-bold mb-2">STEP 2: FLASH INVADERS</div>
              <div className="text-gray-300 leading-relaxed">
                <p>Connect your Flash Invaders account for auto-casting.</p>
              </div>
            </div>

        {(signupProgress === "idle" ||
          signupProgress === "username_search_error" ||
          signupProgress === "username_search_loading" ||
          signupProgress === "username_search_found" ||
          signupProgress === "username_search_not_found") && (
          <>
            {/* Username Input */}
            <div className="mb-4">
              <div className="text-green-400 text-xs font-bold mb-2">USERNAME</div>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-600 text-white px-3 py-2 text-sm font-mono focus:border-green-400 outline-none placeholder-gray-500"
                placeholder="your.username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.trim());
                  if (signupProgress === "username_search_found" || signupProgress === "username_search_not_found" || signupProgress === "username_search_error") {
                    setSignupProgress("idle");
                  }
                }}
                disabled={signupProgress === "username_search_loading"}
              />
              <div className="text-gray-500 text-[10px] mt-1">Must be public in Flash Invaders app</div>
            </div>

            {signupProgress === "idle" && (
              <button
                onClick={handleUsernameSearch}
                className={`w-full p-2 border-2 transition-all duration-200 font-bold text-xs mb-2 ${
                  !username.trim() || isLoading 
                    ? "border-gray-600 text-gray-600 cursor-not-allowed" 
                    : "border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                }`}
                disabled={!username.trim() || isLoading}
              >
                [S] SEARCH USERNAME
              </button>
            )}
            {signupProgress === "username_search_loading" && (
              <div className="text-center py-4">
                <div className="text-green-400 text-xs animate-pulse">SEARCHING...</div>
                <div className="text-gray-500 text-[10px] mt-1">{`>> "${searchedUsername}" <<`}</div>
              </div>
            )}
            
            {signupProgress === "username_search_error" && errorMessage && (
              <div className="text-center mb-4">
                <div className="text-red-400 text-xs mb-2">ERROR: {errorMessage}</div>
                <button 
                  onClick={resetStateAndStartOver} 
                  className="w-full p-2 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-all duration-200 font-bold text-xs"
                >
                  [R] RETRY
                </button>
              </div>
            )}

            {signupProgress === "username_search_found" && (
              <div className="text-center mb-4">
                <div className="text-green-400 text-xs mb-3">✓ FOUND: &quot;{searchedUsername}&quot;</div>
                <div className="space-y-2">
                  <button 
                    onClick={handleProceedToInitiateSignup} 
                    className="w-full p-2 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 font-bold text-xs"
                  >
                    [P] PROCEED
                  </button>
                  <button 
                    onClick={resetStateAndStartOver} 
                    className="w-full p-2 border-2 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-200 font-bold text-xs"
                  >
                    [C] CHANGE
                  </button>
                </div>
              </div>
            )}

            {signupProgress === "username_search_not_found" && (
              <div className="text-center mb-4">
                <div className="text-yellow-400 text-xs mb-2">? NOT FOUND: &quot;{searchedUsername}&quot;</div>
                <div className="text-gray-500 text-[10px] mb-3">Check spelling or make profile public</div>
                <div className="space-y-2">
                  <button 
                    onClick={handleProceedToInitiateSignup} 
                    className="w-full p-2 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all duration-200 font-bold text-xs"
                  >
                    [P] PROCEED ANYWAY
                  </button>
                  <button 
                    onClick={resetStateAndStartOver} 
                    className="w-full p-2 border-2 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white transition-all duration-200 font-bold text-xs"
                  >
                    [C] CHANGE
                  </button>
                </div>
              </div>
            )}

            {(signupProgress === "idle" || signupProgress === "username_search_error" || signupProgress === "username_search_found" || signupProgress === "username_search_not_found") &&
              !isLoading && (
                <button
                  onClick={onSkip}
                  className="w-full p-2 border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white transition-all duration-200 text-xs"
                >
                  [ESC] SKIP FOR NOW
                </button>
              )}
          </>
        )}

        {(signupProgress === "initiating_signup" || isInitiatingSignup) && (
          <div className="text-center py-8">
            <div className="text-green-400 text-xs animate-pulse mb-2">CONNECTING...</div>
            <div className="text-gray-500 text-[10px]">{`>> Preparing "${searchedUsername}" <<`}</div>
          </div>
        )}

        {signupProgress === "pending_approval" && signerApprovalUrl && (
          <div className="text-center">
            <div className="text-green-400 text-xs font-bold mb-3">APPROVE CONNECTION</div>
            <div className="text-gray-400 text-[10px] mb-4">Scan QR with Farcaster app</div>
            
            <div className="bg-white p-3 mb-4 inline-block">
              <QRCodeSVG value={signerApprovalUrl} size={180} />
            </div>
            
            <div className="space-y-2 mb-4">
              <button
                onClick={async () => {
                  if (signerApprovalUrl) {
                    await sdk.actions.openUrl(signerApprovalUrl);
                  }
                }}
                className="w-full p-2 border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-all duration-200 font-bold text-xs"
              >
                [M] APPROVE ON MOBILE
              </button>
              
              <button
                onClick={resetStateAndStartOver}
                className="w-full p-2 border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white transition-all duration-200 text-xs"
              >
                [ESC] CANCEL
              </button>
            </div>
            
            <div className="text-cyan-400 text-[10px] animate-pulse">{`>> WAITING FOR APPROVAL <<`}</div>
          </div>
        )}

        {(signupProgress === "signup_error" || signupProgress === "signup_timeout" || signupProgress === "signup_revoked") && errorMessage && (
          <div className="text-center">
            <div className="text-red-400 text-xs font-bold mb-2">
              {signupProgress === "signup_timeout" ? "TIMEOUT" : signupProgress === "signup_revoked" ? "REVOKED" : "ERROR"}
            </div>
            <div className="text-gray-400 text-[10px] mb-4">{errorMessage}</div>
            <button 
              onClick={resetStateAndStartOver} 
              className="w-full p-2 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-all duration-200 font-bold text-xs"
            >
              [R] TRY AGAIN
            </button>
          </div>
        )}
          </>
        )}

        {/* Glow effect */}
        <div className="absolute inset-0 border-2 border-green-400/20 animate-pulse pointer-events-none" />
      </div>
    </div>
  );
}
