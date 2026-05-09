"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { SignerStatusResponse, UsersApi } from "~/lib/api.flashcastr.app/users";

const usersApi = new UsersApi();

export const SignerStatus = ({ fid }: { fid: number }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SignerStatusResponse | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await usersApi.checkSignerStatus(fid);
      setResult(response);
      if (response.ok) {
        toast.success("Signer OK");
      } else {
        toast.error(`Signer BAD: ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Test failed";
      setResult({ ok: false, status: "REQUEST_FAILED", fid: null, message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-1 px-4">
      <p className="text-cyan-400 text-base">Test Neynar Signer</p>
      <div className="flex gap-2 items-center">
        <p className="text-white text-sm basis-10/12">
          Verify that your stored signer is still approved on Neynar.
        </p>
        <button
          onClick={handleTest}
          disabled={loading}
          className={`grow text-xs border px-2 py-1 ${
            loading
              ? "border-gray-600 text-gray-600 cursor-not-allowed"
              : "border-cyan-400 text-cyan-400 hover:text-white"
          }`}
        >
          {loading ? "TESTING..." : "[T] TEST SIGNER"}
        </button>
      </div>
      {result && (
        <div className="mt-1 text-xs font-mono">
          <div className={result.ok ? "text-green-400" : "text-red-400"}>
            {`>> STATUS: ${result.ok ? "OK" : "BAD"}`}
          </div>
          <div className="text-gray-400">{`>> neynar: ${result.status.toLowerCase()}`}</div>
          {typeof result.fid === "number" && (
            <div className="text-gray-400">{`>> fid: ${result.fid}`}</div>
          )}
          {result.message && (
            <div className="text-gray-500 break-words">{`>> ${result.message}`}</div>
          )}
        </div>
      )}
    </div>
  );
};
