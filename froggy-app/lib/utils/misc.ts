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

export function getExplorerUrl(txid: string, network: string) {
  switch (network) {
    case "devnet":
      return `http://localhost:8000/txid/${txid}?chain=testnet&api=http://localhost:3999`;
    case "testnet":
      return `https://explorer.hiro.so/txid/${txid}?chain=testnet`;
    default:
      return `https://explorer.hiro.so/txid/${txid}?chain=mainnet`;
  }
}
