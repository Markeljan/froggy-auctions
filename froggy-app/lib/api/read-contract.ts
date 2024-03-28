import { ReadOnlyFunctionSuccessResponse } from "@stacks/blockchain-api-client";
import { FROGGY_AGENT_ADDRESS, smartContractsApi } from "@/app/config";
import { uintCV, cvToHex, hexToCV, cvToValue } from "@stacks/transactions";

export type ReadContractArgs = {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs?: any[];
};

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

  console.log(`readContract: ${contractName}.${functionName}(${functionArgs}) => ${convertedResultVal}`);

  return convertedResultVal || null;
}
