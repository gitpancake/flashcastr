"use client";

import { useState } from "react";

export default function ConnectPage() {
  const [username, setUsername] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-8 max-w-md w-full flex flex-col items-center shadow-lg">
        <h1 className="font-invader text-white text-3xl text-center mb-2 tracking-wide">
          CAST YOUR
          <br />
          FLASHES
        </h1>
        <div className="text-gray-300 text-center text-xs mb-8">Join @henry & many others who are already flashcasting</div>
        <div className="w-full text-left mb-8">
          <h2 className="text-white text-lg font-semibold mb-2">How it works</h2>
          <p className="text-white text-sm mb-3">Flashcastr automatically casts from your Farcaster account whenever you flash a space invader using the flash invaders app.</p>
          <p className="text-white text-sm mb-3">{`Ensure that your Flash Invaders username is set to 'public'.`}</p>
          <p className="text-white text-sm mb-3">Set your username below, then sign in. Flashcastr needs permission to cast on your behalf.</p>
          <p className="text-white text-sm">Auto-cast can be toggled on/off depending on how much you would like to share</p>
        </div>
        <div className="w-full flex flex-col items-start mb-6">
          <label className="font-invader text-white text-sm mb-2 tracking-widest">Enter Flash Invaders Username</label>
          <input
            type="text"
            className="w-full bg-black border border-white text-white px-4 py-2 font-invader text-lg tracking-widest outline-none placeholder-white mb-4"
            placeholder="USERNAME..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-invader text-xl py-3 rounded transition-colors tracking-widest" disabled={!username.trim()}>
          BEGIN
        </button>
      </div>
    </div>
  );
}
