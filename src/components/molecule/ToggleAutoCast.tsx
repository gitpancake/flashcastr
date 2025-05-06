"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useUpdateAppUser } from "~/hooks/useUpdateAppUser";

export const ToggleAutoCast = ({ auto_cast }: { auto_cast: boolean }) => {
  const [autoCast, setAutoCast] = useState(auto_cast);

  const { mutateAsync: updateAppUser } = useUpdateAppUser();

  return (
    <div className="flex items-center justify-center gap-2">
      <p className="text-white font-invader tracking-widest text-base">Auto Cast</p>
      <input
        type="checkbox"
        checked={autoCast}
        onChange={() => {
          try {
            updateAppUser({
              auto_cast: !autoCast,
            });

            setAutoCast((prev) => !prev);

            toast.success("Auto cast updated");
          } catch (error) {
            toast.error("Failed to update auto cast");
          }
        }}
      />
    </div>
  );
};
