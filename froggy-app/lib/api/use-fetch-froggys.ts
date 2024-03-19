"use client";

import { useQuery } from "@tanstack/react-query";

const FROGGYS_PARENT_HASH = "3388f08d493392bcd5b63aa6f1152c29fa11ab28dd1e730cba6b3c16415c00e2";

async function fetchFroggys(address?: string) {
  if (!address) return;
  const response = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${address}?order=-1`);
  const data = await response.json();
  const froggys = data?.data?.filter((sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH);
  return froggys;
}

export function useFetchFroggys(address?: string) {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["froggys", address],
    queryFn: () => fetchFroggys(address),
    enabled: !!address,
  });

  return { isPending, error, data, isFetching };
}
