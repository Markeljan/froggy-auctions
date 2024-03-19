import { ConnectWallet } from "@/components/connect-wallet";
import { BoxesCore } from "@/components/ui/boxes-core";
import { AccordionTabs } from "@/components/ui/accordian-tabs";
import { Hop } from "@/components/hop";
import { MyFroggys } from "@/components/my-froggys";
import { Home } from "@/components/home";
import { generateBoxGridData } from "@/app/actions";
import { DraggableContainer } from "@/components/ui/draggable-container";

const boxGridData = generateBoxGridData();

const tabsArray = [
  {
    label: "Home",
    content: <Home />,
  },
  { label: "Wallet", content: <MyFroggys /> },
  { label: "Hop", content: <Hop /> },
];

export default function Page() {
  return (
    <main className="relative flex flex-col min-h-[100dvh] w-full justify-center items-center overflow-clip space-y-4 z-0">
      <ConnectWallet className="absolute top-0 sm:right-0 m-2 max-sm:flex  max-sm:max-w-xs max-sm:w-full max-sm:mx-auto justify-center items-center" />
      <BoxesCore boxGridData={boxGridData} />

      <DraggableContainer className="flex flex-col max-sm:max-w-xs max-w-3xl w-full max-sm:p-4 p-4 justify-center items-center">
        <AccordionTabs className="" tabsContentArray={tabsArray} initialTab="Home" />
      </DraggableContainer>
    </main>
  );
}
