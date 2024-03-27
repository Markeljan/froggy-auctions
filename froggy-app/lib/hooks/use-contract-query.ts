"use client";

import { useQuery } from "@tanstack/react-query";
import { ReadOnlyFunctionSuccessResponse } from "@stacks/blockchain-api-client";
import { FROGGY_AGENT_ADDRESS, apiConfig, smartContractsApi } from "@/app/config";
import { uintCV, cvToHex, hexToCV, cvToValue } from "@stacks/transactions";

type ReadContractArgs = {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: any[];
};

// call a read-only function
export async function readContract({ contractAddress, contractName, functionName, functionArgs }: ReadContractArgs) {
  const functionArgsCV =
    functionArgs?.map((arg) => {
      if (typeof arg === "number") {
        return cvToHex(uintCV(arg));
      } else {
        return arg;
      }
    }) || [];

  const fnCall: ReadOnlyFunctionSuccessResponse = await smartContractsApi.callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName,
    readOnlyFunctionArgs: {
      sender: FROGGY_AGENT_ADDRESS,
      arguments: functionArgsCV,
    },
  });

  const convertedResultVal = fnCall.result && cvToValue(hexToCV(fnCall.result))?.value?.value;

  return convertedResultVal || null;
}

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
