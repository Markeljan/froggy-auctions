import { FroggyHop } from "@/lib/types";
import { findFroggy } from "@/lib/utils/misc";

export async function getLastTxByInscriptionId(inscriptionId: string | number) {
  const tokenId = findFroggy(Number(inscriptionId))?.id;
  if (!tokenId) {
    throw new Error("Unable to find froggy, invalid inscriptionId");
  }
  const response = await fetch(`/api/query/last-tx/?tokenId=${tokenId}`);
  const data = await response.json();
  return data as FroggyHop;
}
