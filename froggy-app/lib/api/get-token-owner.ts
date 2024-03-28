import { FROGGY_CONTRACT_ADDRESS } from "@/app/config";
import { readContract } from "@/lib/api/read-contract";

export async function getFroggyTokenOwner(tokenId: number) {
  const readContractResponse = await readContract({
    contractAddress: FROGGY_CONTRACT_ADDRESS,
    contractName: "froggys",
    functionName: "get-owner",
    functionArgs: [tokenId],
  });

  return readContractResponse;
}
