import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";

export const Auction = () => {
  return (
    <div className="flex w-full flex-col gap-y-4 items-center pb-8">
      <div className="flex flex-col gap-y-4 items-center">
        <img
          src={"/frogs/4546.png"}
          style={{
            imageRendering: "pixelated",
            filter: "grayscale(100%)",
          }}
          alt="Froggy"
          className="w-48 h-48 select-none pointer-events-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
        <div className="flex items-center justify-center">
          <p className="text-lg bg-gray-300 px-4">Highest Bid: 9_000_000</p>
        </div>
        <div className="flex justify-center">
          <Input className="flex w-1/2 mr-2" disabled placeholder="coming soon" />
          <Button disabled={true} className="flex w-1/3 justify-center items-center px-4 py-1">
            Bid
            <img src="/not.png" alt="nothing" className="ml-2 w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};
