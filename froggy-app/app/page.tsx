"use client";

import { ContractCallVote } from "@/components/contract-call-vote";
import { ConnectWallet } from "@/components/connect-wallet";
import { BoxesCore } from "@/components/ui/boxes-core";
import Container from "@/components/ui/container";
import AccordionTabs from "@/components/ui/accordian-tabs";
import { useState } from "react";
import Tabs from "@/components/ui/tabs";
import Accordion from "@/components/ui/accordian";

const tabsArray = [
  { label: "Tab 1", content: "Welcome to Froggy Auctions" },
  { label: "Tab 2", content: "First, you need to connect your wallet" },
  { label: "Tab 3", content: "Then you can begin to wrap your Froggy inscriptions into SIP-009 NFTs" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Tab 1");
  return (
    <main className="relative flex flex-col min-h-[100dvh] w-full justify-center items-center overflow-clip space-y-4">
      <BoxesCore />
      <Container className="flex flex-col z-10 min-h-[600px] max-w-4xl space-y-8">
        <ConnectWallet />
        <ContractCallVote />
        <AccordionTabs tabsContentArray={tabsArray} className="z-10" />
      </Container>

      {/* <Tabs tabsArray={tabsArray} activeTab={activeTab} setActiveTab={setActiveTab} className="z-10" />
      <Accordion label="Accordion" content="This is the answer" className="z-10" /> */}
    </main>
  );
}
