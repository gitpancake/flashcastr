"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useUpdateAppUser } from "~/hooks/useUpdateAppUser";

export const ToggleAutoCast = ({ auto_cast }: { auto_cast: boolean }) => {
  const [autoCast, setAutoCast] = useState(auto_cast);

  const { mutateAsync: updateAppUser } = useUpdateAppUser();

  return (
    <div className="flex flex-col w-full gap-0 px-4">
      <p className="text-white text-base">Auto Casting</p>
      <div className="flex gap-2 items-center">
        <p className="text-white text-sm basis-10/12">When this is enabled, Flashcastr will automatically cast your flash to your Farcaster account.</p>
        <input
          type="checkbox"
          className="grow"
          checked={autoCast}
          onChange={async () => {
            const toastId = toast.loading("Updating auto cast...");

            try {
              await updateAppUser({
                auto_cast: !autoCast,
              });

              setAutoCast((prev) => !prev);

              toast.success("Auto cast updated", { id: toastId });
            } catch {
              toast.error("Failed to update auto cast", { id: toastId });
            }
          }}
        />
      </div>
    </div>
  );
};
