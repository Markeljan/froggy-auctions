"use client";

import { useUserSession } from "@/app/context";
import { ImageCard } from "./ui/image-card";
import { useFroggysQuery } from "@/lib/api/use-froggys-query";
import { VscLoading } from "react-icons/vsc";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { useChainhooksQuery } from "@/lib/api/use-chainhooks-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { shortenAddress } from "@/lib/utils/misc";

const DEV_ADDRESS = "SP2X3WZ9WX28BB37ZAHM18T7PV76ZN4NGYWVH99PE";

export const MyFroggys = () => {
  const isClient = useIsClient();
  const { userData } = useUserSession();
  const { userAddress } = userData;
  const { data, isLoading, error } = useFroggysQuery({ address: userAddress });
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
      <div className="flex items-center justify-center w-full h-32">
        <p className="text-lg text-center">Connect your wallet to see your froggys</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 relative">
      {isLoading ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[250px] h-[250px]">
          <VscLoading className="animate-spin w-full h-full" />
        </div>
      ) : (
        data?.map((froggy: { fileUrl: string; id: string }, index: number) => (
          <ImageCard className="max-w-[250px] w-full mx-auto cursor-pointer " imageUrl={froggy.fileUrl} key={index}>
            {froggy.id}
          </ImageCard>
        ))
      )}
    </div>
  );
};
