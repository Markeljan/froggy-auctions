"use client";

import { useQuery } from "@tanstack/react-query";
import { ReadContractArgs, readContract } from "@/lib/api/read-contract";

export function useReadContract({
  contractAddress,
  contractName,
  functionName,
  functionArgs,
  enabled,
}: ReadContractArgs & { enabled?: boolean }) {
  return useQuery({
    queryKey: ["read-contract", contractAddress, contractName, functionName, functionArgs],
    queryFn: () => readContract({ contractAddress, contractName, functionName, functionArgs }),
    enabled: enabled,
  });
}
