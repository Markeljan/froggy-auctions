"use client";

import { useEffect, useState } from "react";
import { useUserSession } from "@/app/context";
import { ImageCard } from "@/components/ui/image-card";
import { useFroggysQuery } from "@/lib/api/use-froggys-query";
import { VscLoading } from "react-icons/vsc";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { useChainhooksQuery } from "@/lib/api/use-chainhooks-query";
import toast from "react-hot-toast";
import { shortenAddress } from "@/lib/utils/misc";
import Link from "next/link";
import { Badge } from "./ui/badge";

export const Froggys = ({ onChange }: { onChange: (value: string) => void }) => {
  const isClient = useIsClient();
  const { userData } = useUserSession();
  const { userAddress } = userData;
  const { data, isLoading } = useFroggysQuery({ address: userAddress });
  const { data: sordEvents } = useChainhooksQuery();
  const [lastShownTxId, setLastShownTxId] = useState<string | null>(null);

  useEffect(() => {
    if (sordEvents?.length > 0) {
      const latestEvent = sordEvents[0];
      if (latestEvent?.txId !== lastShownTxId && lastShownTxId !== null) {
        console.log("New sOrdinals event", latestEvent?.sender, latestEvent?.recipient, latestEvent?.memo);
        toast(
          <div>
            <p>New sOrdinals event</p>
            <p>Sender: {shortenAddress(latestEvent?.sender)}</p>
            <p>Recipient: {shortenAddress(latestEvent?.recipient)}</p>
            <p>memo: {latestEvent?.memo}</p>
          </div>
        );
      }
      setLastShownTxId(latestEvent?.txId);
    }
  }, [sordEvents, lastShownTxId]);

  if (!isClient) {
    return null;
  }

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center w-full pb-8">
        <p className="text-lg text-gray-500 text-center">Connect your wallet to see your Froggys</p>
      </div>
    );
  }

  if (userAddress && !isLoading && !data?.length) {
    return (
      <div className="flex items-center justify-center w-full pb-8">
        <p className="text-lg text-gray-500 text-center">{`You don't have any Froggys! Go get some!`}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 max-sm:grid-cols-2 grid-cols-4 relative pb-8 w-full px-4">
      {isLoading ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[250px] h-[250px]">
          <VscLoading className="animate-spin w-full h-full" />
        </div>
      ) : (
        data?.map((froggy: { fileUrl: string; id: string }, index: number) => (
          <ImageCard
            onClick={() => {
              onChange(froggy.id);
            }}
            className="max-w-[150px] w-full mx-auto cursor-pointer "
            imageUrl={froggy.fileUrl}
            key={index}
          >
            {froggy.id}
          </ImageCard>
        ))
      )}
    </div>
  );
};
