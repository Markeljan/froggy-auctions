"use client";

import { useState } from "react";
import { useUserSession } from "@/app/context";
import { postHop } from "@/lib/api/post-hop";
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
import { getExplorerUrl, findFroggy } from "@/lib/utils/misc";
import { useFroggysQuery } from "@/lib/hooks/use-froggys-query";
import {
  AnchorMode,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  createSTXPostCondition,
  createNonFungiblePostCondition,
  uintCV,
  bufferCV,
  principalCV,
} from "@stacks/transactions";
import { useReadContract } from "@/lib/hooks/use-contract-query";
import toast from "react-hot-toast";
import Link from "next/link";
import { Froggys } from "@/components/froggys";
import { HopStatus, SordinalsFroggyData } from "@/lib/types";
import { postHopBack } from "@/lib/api/post-hop-back";

export const Hop = () => {
  const { userData } = useUserSession();
  const userAddress = userData?.userAddress;
  const { doContractCall } = useConnect();
  const [inputValue, setInputValue] = useState<string>("");
  const inputValueNumber = parseInt(inputValue);
  const tokenId = inputValueNumber > 10000 ? findFroggy(inputValueNumber)?.id : inputValueNumber;
  const inscriptionId = inputValueNumber <= 10000 ? findFroggy(inputValueNumber)?.inscriptionId : inputValueNumber;
  const [hopTxId, setHopTxId] = useState<string>();
  const { data } = useFroggysQuery({ inscriptionId: inscriptionId }) as {
    data: SordinalsFroggyData & { hopStatus: HopStatus };
  };
  console.log("data", data);
  const { data: readTokenOwner } = useReadContract({
    contractAddress: FROGGY_CONTRACT_ADDRESS,
    contractName: "froggys",
    functionName: "get-owner",
    functionArgs: [tokenId],
    enabled: !!tokenId,
  });
  console.log("readTokenOwner", readTokenOwner);
  const froggyImage = `/frogs/${tokenId || 1}.png`;
  const isHopping = data?.hopStatus === HopStatus.HOPPING || data?.hopStatus === HopStatus.HOPPING_BACK;
  const isHopDisabled = isHopping ? true : !!data?.owner ? data?.owner !== userAddress : true;
  const isHopBackDisabled = isHopping ? true : !!readTokenOwner ? readTokenOwner !== userAddress : true;

  console.log("readTokenOwner", readTokenOwner);

  console.log("isHopDisabled", isHopDisabled);
  console.log("isHopBackDisabled", isHopBackDisabled);
  console.log("isHopping", isHopping);

  const handleHop = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userAddress || !tokenId) return;

    const hexString = Buffer.from("t").toString("hex") + findFroggy(tokenId)?.inscriptionHash;
    const memo = Buffer.from(hexString, "hex");
    const memoCV = bufferCV(memo);

    // user sends froggy to FROGGY_AGENT_ADDRESS
    await doContractCall({
      contractAddress: SORDINALS_CONTRACT_ADDRESS,
      contractName: "sordinals-inscribe",
      functionName: "transfer-memo-single",
      functionArgs: [principalCV(FROGGY_AGENT_ADDRESS), memoCV],
      postConditions: [createSTXPostCondition(userAddress, FungibleConditionCode.Equal, 1n)],
      fee: 100000,
      network: network,
      onCancel: () => {
        toast("Transaction cancelled", { icon: "🚫" });
        return;
      },
      onFinish: async (result) => {
        console.log("STX Transfer result:", result.txId);
        // send hop data to the agent
        await postHop({ txId: result.txId });
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
      postConditions: [sendStxPostCondition, sendNftPostCondition],
      fee: 100000,
      network: network,
      anchorMode: AnchorMode.Any,
      onCancel: () => {
        toast("Transaction cancelled", { icon: "🚫" });
        return;
      },
      onFinish: async (result) => {
        await postHopBack({ txId: result.txId });
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
      <div className="flex max-sm:flex-col gap-y-2 w-full mt-4 max-sm:px-0 px-8 justify-between items-baseline">
        <p className="text-2xl">Owned Froggys</p>
        <div className="flex max-sm:text-sm font-normal max-sm:space-x-[4px] space-x-4">
          <div className="bg-purple-300 h-4 w-4 rounded-full" />
          <div>sOrdinals</div>
          <div className="bg-green-400 h-4 w-4 rounded-full" />
          <div>Hopping</div>
          <div className="bg-orange-400 h-4 w-4 rounded-full" />
          <div>SIP-9</div>
        </div>
      </div>

      <Froggys onChange={(value) => setInputValue(value)} />
    </div>
  );
};
