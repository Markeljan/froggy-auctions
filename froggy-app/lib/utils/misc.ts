import { froggyData } from "../froggyData";

export function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

export function inscriptionIdToTokenId(inscriptionId: number) {
  return froggyData.findIndex((froggy) => {
    if (froggy.inscriptionId === inscriptionId) {
      return froggy.id;
    }
  });
}

export function tokenIdToInscriptionId(tokenId: number) {
  return froggyData.find((froggy) => {
    if (froggy.id === tokenId) {
      return froggy.inscriptionId;
    }
  });
}
