"use client";

import { FROGGYS_PARENT_HASH, FROGGY_AGENT_ADDRESS } from "@/app/config";
import { useQuery } from "@tanstack/react-query";
import { SordinalsFroggyData } from "@/lib/types";
import { getAllHoppedFrogs } from "@/lib/api/get-hopped-froggs";

async function fetchFroggys({ address, inscriptionId }: { address?: string; inscriptionId?: number }) {
  const response = await fetch(
    `https://api.sordinals.com/api/v1/inscriptions/owner/${FROGGY_AGENT_ADDRESS}?limit=10000`
  );
  const { data } = (await response.json()) as { data: SordinalsFroggyData[] };
  const agentFroggys = data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
  const hoppedFrogsList = await getAllHoppedFrogs();
  if (address) {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${address}?limit=10000`);
    const { data } = (await response.json()) as { data: SordinalsFroggyData[] };
    const froggys = data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
    const userHoppedFroggys = hoppedFrogsList
      .map((hop) => {
        if (hop.sender === address) {
          return agentFroggys.find((sord) => sord.id === hop.inscriptionId.toString());
        }
      })
      .filter(Boolean) as SordinalsFroggyData[];
    const userFroggys = [...froggys, ...userHoppedFroggys];
    userFroggys.sort((a: SordinalsFroggyData, b: SordinalsFroggyData) => parseInt(a.id) - parseInt(b.id));
    return userFroggys;
  } else {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/${inscriptionId}`);
    const data = (await response.json()) as SordinalsFroggyData;
    return data;
  }
}

export function useFroggysQuery({ address, inscriptionId }: { address?: string; inscriptionId?: number } = {}) {
  return useQuery({
    queryKey: ["froggys", address || inscriptionId],
    queryFn: () => fetchFroggys({ address, inscriptionId }),
    enabled: !!address || !!inscriptionId,
  });
}
