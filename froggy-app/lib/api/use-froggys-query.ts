"use client";

import { useQuery } from "@tanstack/react-query";

const FROGGYS_PARENT_HASH = "3388f08d493392bcd5b63aa6f1152c29fa11ab28dd1e730cba6b3c16415c00e2";

async function fetchFroggys({ address, inscriptionId }: { address?: string; inscriptionId?: number }) {
  if (address) {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${address}?order=-1`);
    const data = await response.json();
    const froggys = data?.data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
    return froggys;
  } else {
    const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/${inscriptionId}`);
    const data = await response.json();
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
