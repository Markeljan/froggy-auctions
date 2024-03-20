import { ConnectWallet } from "@/components/connect-wallet";
import { BoxesCore } from "@/components/ui/boxes-core";
import { AccordionTabs } from "@/components/ui/accordian-tabs";
import { Hop } from "@/components/hop";
import { MyFroggys } from "@/components/my-froggys";
import { Auction } from "@/components/auction";
import { generateBoxGridData } from "@/app/actions";
import { DraggableContainer } from "@/components/ui/draggable-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const boxGridData = generateBoxGridData();

const tabsArray = [
  {
    label: "Auction",
    content: <Auction />,
  },
  { label: "Froggys", content: <MyFroggys /> },
  { label: "Hop", content: <Hop /> },
];

export default function Page() {
  return (
    <main className="relative flex flex-col min-h-[100dvh] w-full justify-center items-center overflow-clip space-y-4 z-0 p-8">
      <ConnectWallet className="absolute max-sm:static top-0 sm:right-0 m-2 max-sm:flex max-sm:max-w-sm max-sm:w-full max-sm:mx-auto justify-center items-center" />
      <BoxesCore boxGridData={boxGridData} />
      <DraggableContainer className="max-sm:hidden flex flex-col max-sm:max-w-sm max-xl:max-w-xl max-w-3xl w-full max-sm:p-2 p-4 justify-center items-center">
        <Button className="flex flex-col justify-center items-center bg-none p-4 space-y-2">
          <p className="text-4xl font-bold">Froggy Auctions</p>
          <p className="text-lg">Hop between sOrdinals and SIP-009 NFTs</p>
        </Button>
      </DraggableContainer>

      <DraggableContainer className="flex flex-col max-sm:max-w-sm max-xl:max-w-xl max-w-3xl w-full max-sm:p-2 p-8 justify-center items-center">
        <AccordionTabs className="" tabsContentArray={tabsArray} initialTab="Auction" />
      </DraggableContainer>
    </main>
  );
}
