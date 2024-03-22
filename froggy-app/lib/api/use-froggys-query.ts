"use client";

import { FROGGYS_PARENT_HASH } from "@/app/config";
import { useQuery } from "@tanstack/react-query";
import { SordinalsFroggyData } from "@/lib/types";

async function fetchFroggys({ address, inscriptionId }: { address?: string; inscriptionId?: number }) {
  if (address) {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${address}?order=-1`);
    const { data } = (await response.json()) as { data: SordinalsFroggyData[] };
    const froggys = data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
    return froggys;
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
