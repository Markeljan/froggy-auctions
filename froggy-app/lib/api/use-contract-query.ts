"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ReadOnlyFunctionSuccessResponse,
  SmartContractsApi,
  SmartContractsApiInterface,
} from "@stacks/blockchain-api-client";
import { FROGGY_AGENT_ADDRESS_DEVNET, apiConfig } from "@/app/config";
import { uintCV, cvToHex, hexToCV, cvToValue } from "@stacks/transactions";

const contractsApi: SmartContractsApiInterface = new SmartContractsApi(apiConfig);

type ReadContractArgs = {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: any[];
};

// call a read-only function
async function readContract({ contractAddress, contractName, functionName, functionArgs }: ReadContractArgs) {
  const functionArgsCV =
    functionArgs?.map((arg) => {
      if (typeof arg === "number") {
        return cvToHex(uintCV(arg));
      } else {
        return arg;
      }
    }) || [];

  const fnCall: ReadOnlyFunctionSuccessResponse = await contractsApi.callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName,
    readOnlyFunctionArgs: {
      sender: FROGGY_AGENT_ADDRESS_DEVNET,
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
