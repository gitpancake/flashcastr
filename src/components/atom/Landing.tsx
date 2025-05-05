import Image from "next/image";

export const Landing = () => {
  return (
    <div className="h-screen w-screen bg-black flex justify-center items-center">
      <div className="flex flex-col items-center animate-fade-in">
        <Image src="/splash.png" alt="Flashcastr" width={1920} height={1080} className="h-[120px] w-[120px] my-[-15px]" />
        <h2 className="text-white font-invader text-[54px] my-[-10px]">Flashcastr</h2>
        <p className="text-white text-[24px] font-invader mt-[-10px]">Cast your flashes</p>
        <button className="bg-[#8A63D2] py-[7px] px-[51px]">
          <p className="text-white text-[24px] font-invader">Enter</p>
        </button>
      </div>
    </div>
  );
};
