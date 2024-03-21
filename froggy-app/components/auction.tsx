import { Button } from "./ui/button";
import Input from "./ui/input";

export const Auction = () => {
  return (
    <div className="flex w-full flex-col gap-y-4 items-center pb-8">
      <div className="flex flex-col gap-y-4 items-center">
        <img
          src={"/78942.png"}
          style={{
            imageRendering: "pixelated",
            filter: "grayscale(100%)",
          }}
          alt="Froggy"
          className="w-48 h-48 select-none pointer-events-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />

        {/* fake price and info */}
        <div className="flex items-center justify-center">
          <p className="text-sm">Highest Bid: 9m</p>
          <img src="/not.png" alt="nothing" className="w-8 h-8" />
        </div>
        <div className="flex gap-x-2 justify-center">
          <Input disabled placeholder="amount" />
          <Button disabled={true} className="border-2 px-4 py-1">
            Bid
          </Button>
        </div>
      </div>
    </div>
  );
};
