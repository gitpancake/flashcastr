"use client";

import sdk, { SignIn as SignInCore } from "@farcaster/frame-sdk";
import { getCsrfToken, signIn } from "next-auth/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export const Landing = () => {
  const [signingIn, setSigningIn] = useState(false);

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
        redirect: true,
        callbackUrl: "/",
      });
    } catch (e) {
      if (e instanceof SignInCore.RejectedByUser) {
        handleSignIn();
        return;
      }
      setSigningIn(false);
    }
  }, [getNonce]);

  useEffect(() => {
    handleSignIn();
  }, [handleSignIn]);

  return (
    <div className="h-screen w-screen bg-black flex justify-center items-center">
      <div className="flex flex-col items-center animate-fade-in">
        <Image src="/splash.png" alt="Flashcastr" width={1920} height={1080} className="h-[120px] w-[120px] my-[-15px]" />
        <h2 className="text-white font-invader text-[54px] my-[-10px]">Flashcastr</h2>
        {signingIn ? (
          <p className="text-white text-[24px] font-invader mt-[-10px] animate-pulse">Signing you in...</p>
        ) : (
          <p className="text-white text-[24px] font-invader mt-[-10px]">Cast your flashes</p>
        )}
      </div>
    </div>
  );
};
