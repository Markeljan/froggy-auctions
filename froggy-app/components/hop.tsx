"use client";

import { useState } from "react";
import { useUserSession } from "@/app/context";
import { fetchHop } from "@/lib/api/fetch-hop";
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConnect } from "@stacks/connect-react";
import {
  APP_NETWORK,
  FROGGY_AGENT_ADDRESS,
  FROGGY_CONTRACT_ADDRESS,
  SORDINALS_CONTRACT_ADDRESS,
  network,
} from "@/app/config";
import {
  getExplorerUrl,
  inscriptionIdToTokenId,
  tokenIdToInscriptionHash,
  tokenIdToInscriptionId,
} from "@/lib/utils/misc";
import { useFroggysQuery } from "@/lib/api/use-froggys-query";
import {
  AnchorMode,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  createSTXPostCondition,
  createNonFungiblePostCondition,
  uintCV,
  bufferCV,
  createMemoString,
  hexToCV,
  cvToString,
  stringCV,
  serializeMemoString,
  StacksMessageType,
  cvToHex,
  principalCV,
} from "@stacks/transactions";
import { useReadContract } from "@/lib/api/use-contract-query";
import toast from "react-hot-toast";
import Link from "next/link";
import { Froggys } from "@/components/froggys";

export const Hop = () => {
  const { userData } = useUserSession();
  const userAddress = userData?.userAddress;
  const { doContractCall } = useConnect();
  const [inputValue, setInputValue] = useState<string>("");
  const inputValueNumber = parseInt(inputValue);
  const tokenId = inputValueNumber > 10000 ? inscriptionIdToTokenId(inputValueNumber) : inputValueNumber;
  const inscriptionId = inputValueNumber <= 10000 ? tokenIdToInscriptionId(inputValueNumber) : inputValueNumber;
  const [hopTxId, setHopTxId] = useState<string>();
  const { data } = useFroggysQuery({ inscriptionId: inscriptionId });
  
  const { data: readTokenOwner } = useReadContract({
    contractAddress: FROGGY_CONTRACT_ADDRESS,
    contractName: "froggys",
    functionName: "get-owner",
    functionArgs: [tokenId],
    enabled: !!tokenId,
  });

  const froggyImage = `/frogs/${tokenId || 1}.png`;
  const isHopDisabled = !!data?.owner ? data?.owner !== userAddress : true;
  const isHopBackDisabled = !!readTokenOwner ? readTokenOwner !== userAddress : true;

  const handleHop = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userAddress || !tokenId) return;

    const hexString = Buffer.from("t").toString("hex") + tokenIdToInscriptionHash(tokenId);
    const memo = Buffer.from(hexString, "hex");
    const memoCV = bufferCV(memo);

    // user sends froggy to FROGGY_AGENT_ADDRESS
    await doContractCall({
      contractAddress: SORDINALS_CONTRACT_ADDRESS,
      contractName: "sordinals-inscribe",
      functionName: "transfer-memo-single",
      functionArgs: [principalCV(FROGGY_AGENT_ADDRESS), memoCV],
      postConditions: [createSTXPostCondition(userAddress, FungibleConditionCode.Equal, 1n)],
      network: network,
      onCancel: () => {
        toast("Transaction cancelled", { icon: "🚫" });
        return;
      },
      onFinish: async (result) => {
        console.log("STX Transfer result:", result.txId);

        // send hop data to the agent
        await fetchHop({ txid: result.txId });
        console.log("Hop result:", result);

        toast(
          <div className="flex flex-col space-x-2 items-center">
            <p>Hop transaction submitted</p>
            <Link href={getExplorerUrl(result.txId, APP_NETWORK)} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </Link>
          </div>,
          {
            icon: "🐸",
          }
        );

        setHopTxId(result.txId);
      },
    });
  };

  const handleHopBack = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userAddress || !tokenId) return;

    const sendStxPostCondition = createSTXPostCondition(userAddress, FungibleConditionCode.Equal, 1000001n);

    const sendNftPostCondition = createNonFungiblePostCondition(
      userAddress,
      NonFungibleConditionCode.Sends,
      createAssetInfo(FROGGY_CONTRACT_ADDRESS, "froggys", "froggys"),
      uintCV(tokenId)
    );

    await doContractCall({
      contractAddress: FROGGY_CONTRACT_ADDRESS,
      contractName: "froggys",
      functionName: "hop-back",
      functionArgs: [uintCV(tokenId)],
      network: network,
      anchorMode: AnchorMode.Any,
      postConditions: [sendStxPostCondition, sendNftPostCondition],
      onCancel: () => {
        toast("Transaction cancelled", { icon: "🚫" });
        return;
      },
      onFinish: (result) => {
        toast(
          <div className="flex flex-col space-x-2 items-center">
            <p>Transaction submitted</p>
            <Link href={getExplorerUrl(result.txId, APP_NETWORK)} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </Link>
          </div>,
          {
            icon: "✅",
          }
        );
        console.log("Hop Back result:", result);
        setHopTxId(result.txId);
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-y-4 items-center">
      <div className="flex flex-col gap-y-4 items-center">
        <img
          src={froggyImage}
          style={{
            imageRendering: "pixelated",
            filter: isHopDisabled && isHopBackDisabled ? "grayscale(100%)" : "none",
          }}
          alt="Froggy"
          className="w-48 h-48 select-none pointer-events-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
        <form className="flex flex-col gap-y-4">
          <div className="flex gap-x-2">
            <Input
              type="text"
              id="inputValue"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Token / Inscription ID"
              aria-label="Token / Inscription ID"
              className="border-2 flex-grow"
            />
          </div>

          <div className="flex gap-x-2 justify-center">
            <Button disabled={isHopDisabled || !isHopBackDisabled} onClick={handleHop} className="border-2 px-4 py-1">
              Hop
            </Button>
            <Button
              disabled={isHopBackDisabled || !isHopDisabled}
              onClick={handleHopBack}
              className="border-2 px-4 py-1"
            >
              Hop Back
            </Button>
          </div>
        </form>
        <div className="flex gap-x-2 text-blue-500 hover:underline">
          {hopTxId && (
            <Link href={getExplorerUrl(hopTxId, APP_NETWORK)} target="_blank" rel="noopener noreferrer">
              hopTxId: {hopTxId}
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-y-2 w-full mt-4 max-sm:px-0 px-8">
        <p className="text-2xl">Owned Froggys</p>
      </div>
      <Froggys onChange={(value) => setInputValue(value)} />
    </div>
  );
};
