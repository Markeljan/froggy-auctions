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

export function findFroggy(froggyValue: number | string) {
  switch (typeof froggyValue) {
    case "string":
      return froggyData.find((froggy) => froggy.inscriptionHash === froggyValue);
    case "number":
      if (froggyValue > 10000) {
        return froggyData.find((froggy) => froggy.inscriptionId === froggyValue);
      } else {
        return froggyData.find((froggy) => froggy.id === froggyValue);
      }
  }
}

export function getExplorerUrl(txId: string, network: AppNetwork) {
  switch (network) {
    case "devnet":
      return `http://localhost:8000/txid/${txId}?chain=testnet&api=http://localhost:3999`;
    default:
      return `https://explorer.hiro.so/txid/${txId}?chain=mainnet`;
  }
}

export const validateFroggysMemo = (memo: string) => {
  // require to start with "t"
  if (memo[0] !== "t") return false;

  // require the rest of the memo to be a number
  const restAsNumber = parseInt(memo.slice(1));
  if (isNaN(restAsNumber)) return false;

  const restAsTokenId = findFroggy(restAsNumber)?.id;
  if (!restAsTokenId) return false;

  return true;
};

const colors = ["#7dd3fc", "#f9a8d4", "#86efac", "#fde047", "#fca5a5", "#c4b5fd", "#93c5fd", "#a5b4fc", "#c4b5fd"];

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomFroggy = () => {
  return froggyData[Math.floor(Math.random() * froggyData.length)];
};

export const generateBoxGridData = () => {
  const rows = new Array(24).fill(1);
  const cols = new Array(24).fill(1);
  return rows.map(() =>
    cols.map(() => {
      const froggy = getRandomFroggy();
      return { ...froggy, color: getRandomColor() };
    })
  );
};
