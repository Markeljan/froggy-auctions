import { ConnectWallet } from "@/components/connect-wallet";
import { BoxesCore } from "@/components/ui/boxes-core";
import { AccordionTabs } from "@/components/ui/accordian-tabs";
import { Hop } from "@/components/hop";
import { Auction } from "@/components/auction";
import { About } from "@/components/about";
import { generateBoxGridData } from "@/app/actions";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

const boxGridData = generateBoxGridData();

const tabsArray = [
  {
    label: "About",
    content: <About />,
  },
  { label: "Hop", content: <Hop /> },
  { label: "Auction", content: <Auction /> },
];

export default function Page() {
  return (
    <main className="relative flex flex-col min-h-[100dvh] w-full justify-start items-center overflow-clip max-2xl:py-2 max-2xl:px-4 py-8 px-8 z-0">
      <BoxesCore boxGridData={boxGridData} />
      <ConnectWallet className="2xl:absolute max-sm:max-w-sm max-lg:max-w-md max-w-3xl max-2xl:relative top-0 2xl:right-0 p-4 max-2xl:mb-2 max-2xl:flex max-2xl:w-full max-2xl:mx-auto 2xl:m-2 justify-center items-center" />
      <Container className="flex flex-col max-sm:max-w-sm max-lg:max-w-md max-w-3xl w-full mb-2 p-4 justify-center items-center z-10">
        <Button className="flex flex-col justify-center items-center bg-none p-4 space-y-2">
          <p className="max-2xl:text-3xl text-4xl font-bold">Froggy Auctions</p>
          <p className="max-2xl:text-sm text-lg">Hop between sOrdinals and SIP-009 NFTs</p>
        </Button>
      </Container>
      <Container className="flex flex-col max-sm:max-w-sm max-lg:max-w-md max-w-3xl w-full max-2xl:p-4 p-8 justify-center items-center z-10">
        <AccordionTabs className="" tabsContentArray={tabsArray} initialTab="About" />
      </Container>
    </main>
  );
}
