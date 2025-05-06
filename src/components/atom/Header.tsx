import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import Link from "next/link";

export const Header = async () => {
  const context = await sdk.context;

  return (
    <div className="flex w-full justify-between items-center bg-black px-4">
      <Link href="/">
        <Image src="/splash.png" width={1920} height={1080} alt="Flashcastr" className="h-[60px] w-[60px]" />
      </Link>

      {context && (
        <Link href="/profile">
          <Image src={context?.user.pfpUrl ?? `/splash.png`} width={32} height={32} alt="Profile" />
        </Link>
      )}
    </div>
  );
};
