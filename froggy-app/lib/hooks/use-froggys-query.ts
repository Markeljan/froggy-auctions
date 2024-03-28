"use client";

import { FROGGYS_PARENT_HASH, FROGGY_AGENT_ADDRESS } from "@/app/config";
import { useQuery } from "@tanstack/react-query";
import { FroggyHopWithIdAndOwner, HopStatus, SordinalsFroggyData } from "@/lib/types";
import { getAllHoppedFrogs, getAllHoppingFrogs } from "@/lib/api/get-hopped-froggs";

async function fetchFroggys({ address, inscriptionId }: { address?: string; inscriptionId?: number }) {
  const response = await fetch(
    `https://api.sordinals.com/api/v1/inscriptions/owner/${FROGGY_AGENT_ADDRESS}?limit=10000`
  );
  const { data } = (await response.json()) as { data: SordinalsFroggyData[] };
  const agentFroggys = data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
  const hoppedFrogsList = await getAllHoppedFrogs();
  const hoppingFrogsList = await getAllHoppingFrogs();
  if (address) {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${address}?limit=10000`);
    const { data } = (await response.json()) as { data: SordinalsFroggyData[] };
    const froggys = data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
    const userHoppedFroggys = hoppedFrogsList
      .map((hop) => {
        if (hop.recipient === address) {
          return agentFroggys.find((sord) => sord.id === hop.inscriptionId.toString());
        }
      })
      .filter(Boolean) as SordinalsFroggyData[];
    const userHoppingFroggys = hoppingFrogsList
      .map((hop) => {
        console.log("hop", hop);

        const isMatchingSender = hop.sender === address;
        const isMatchingRecipient = hop.recipient === address;
        if (isMatchingSender || isMatchingRecipient) {
          return {
            ...hop,
            id: hop.inscriptionId.toString(),
            owner: isMatchingSender ? hop.sender : hop.recipient,
          };
        }
      })
      .filter(Boolean) as FroggyHopWithIdAndOwner[];
    console.log("all hopped froggys", hoppedFrogsList);
    console.log("userHoppingFroggys", userHoppingFroggys);
    const userFroggys = [...froggys, ...userHoppedFroggys, ...userHoppingFroggys] as FroggyHopWithIdAndOwner[];

    const hopModifier = (hopStatus: HopStatus) => {
      switch (hopStatus) {
        case HopStatus.HOPPING:
          return -1;
        case HopStatus.HOPPING_BACK:
          return -1;
        case HopStatus.HOPPED:
          return 0;
        default:
          return 1;
      }
    };

    // sort by hopStatus and inscriptionId
    userFroggys.sort((a, b) => {
      const aInscriptionIdModifier = parseInt(a.id) - parseInt(b.id);
      return hopModifier(a.hopStatus) + aInscriptionIdModifier - hopModifier(b.hopStatus);
    });

    // remove duplicates
    const uniqueUserFroggys = userFroggys.reduce((acc, froggy) => {
      if (!acc.some((f) => f.id === froggy.id)) {
        acc.push(froggy);
      }
      return acc;
    }, [] as Array<FroggyHopWithIdAndOwner>);

    return uniqueUserFroggys;
  } else {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/${inscriptionId}`);
    const data = (await response.json()) as SordinalsFroggyData & { hopStatus: HopStatus };
    //get the froggy's HopStatus
    const froggyHopStatus = hoppedFrogsList.find((hop) => hop.inscriptionId === inscriptionId)?.hopStatus;
    const froggy = {
      ...data,
      hopStatus: froggyHopStatus,
    };
    return froggy;
  }
}

export function useFroggysQuery({ address, inscriptionId }: { address?: string; inscriptionId?: number } = {}) {
  return useQuery({
    queryKey: ["froggys", address || inscriptionId],
    queryFn: () => fetchFroggys({ address, inscriptionId }),
    enabled: !!address || !!inscriptionId,
  });
}
