import { AppNetwork } from "@/app/config";
import { froggyData } from "@/lib/froggy-data";
import toast from "react-hot-toast";

export function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-3)}`;
}

export async function copyToClipboard(text: string) {
  await navigator?.clipboard?.writeText(text);
  toast("Copied to clipboard", { icon: "📋" });
}

export function inscriptionIdToTokenId(inscriptionId: number) {
  return froggyData.find((froggy) => {
    if (froggy.inscriptionId === inscriptionId) {
      return froggy.id;
    }
  })?.id;
}

export function tokenIdToInscriptionId(tokenId: number) {
  return froggyData.find((froggy) => {
    if (froggy.id === tokenId) {
      return froggy.inscriptionId;
    }
  })?.inscriptionId;
}

export function getExplorerUrl(txid: string, network: AppNetwork) {
  switch (network) {
    case "devnet":
      return `http://localhost:8000/txid/${txid}?chain=testnet&api=http://localhost:3999`;
    default:
      return `https://explorer.hiro.so/txid/${txid}?chain=mainnet`;
  }
}

export const validateFroggysMemo = (memo: string) => {
  // require to start with "t"
  if (memo[0] !== "t") return false;

  // require the rest of the memo to be a number
  const restAsNumber = parseInt(memo.slice(1));
  if (isNaN(restAsNumber)) return false;

  // require the memotAsT
  const restAsTokenId = inscriptionIdToTokenId(restAsNumber);
  if (!restAsTokenId) return false;

  return true;
};

export const getInscriptionIdFromMemo = (memo: string) => {
  const inscriptionId = parseInt(memo.slice(1));
  if (isNaN(inscriptionId)) {
    return null;
  }
  return inscriptionId;
};
