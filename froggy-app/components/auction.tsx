import { Button } from "./ui/button";

export const Auction = () => {
  return (
    <div className="flex w-full flex-col gap-y-4 items-center">
      <div className="flex flex-col gap-y-4 items-center">
        <p className="text-lg text-center">Soon TM</p>
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
        <div className="flex flex-col gap-y-2">
          <p className="text-lg">Price: 0.1 STX</p>
          <p className="text-lg">Highest Bid: 0.2 STX</p>
        </div>

        <Button disabled={true} className="border-2 px-4 py-1">
          Bid
        </Button>
      </div>
    </div>
  );
};
