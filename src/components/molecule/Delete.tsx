"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FiTrash } from "react-icons/fi";
import { useDeleteAppUser } from "~/hooks/useDeleteAppUser";

export const DeleteProfile = () => {
  const router = useRouter();

  const [deleteStep, setDeleteStep] = useState(0);

  const { mutateAsync: deleteAppUser } = useDeleteAppUser();

  return (
    <div className="flex flex-col w-full gap-0 px-4">
      <p className="text-base text-red-600">Delete Account</p>
      <div className="flex gap-2 items-center">
        {deleteStep === 0 && <p className="text-sm text-red-600 basis-10/12">This will delete your account and all associated data. Your Flash Invader flashes will not be deleted.</p>}
        {deleteStep === 1 && <p className="text-sm text-red-600 basis-10/12">Are you sure you want to delete your account? This action cannot be undone.</p>}
        {deleteStep === 2 && <p className="text-sm text-red-600 basis-10/12">Are you ONE HUNDRED PERCENT sure you want to delete your account? This action cannot be undone.</p>}
        <FiTrash
          className="grow text-red-600 hover:cursor-pointer"
          onClick={async () => {
            if (deleteStep < 2) {
              setDeleteStep((prev) => prev + 1);
              return;
            }

            const toastId = toast.loading("Deleting account...");

            try {
              await deleteAppUser();

              localStorage.clear();

              router.refresh();

              toast.success("Deleted account & all associated data", { id: toastId });
            } catch {
              toast.error("Failed to delete account", { id: toastId });
            }
          }}
        />
      </div>
    </div>
  );
};
