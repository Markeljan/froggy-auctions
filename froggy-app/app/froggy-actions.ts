"use server";

import {
  SignedContractCallOptions,
  makeContractCall,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import { broadcastTransaction, AnchorMode } from "@stacks/transactions";
import { FROGGY_CONTRACT_ADDRESS, network } from "@/app/config";

const senderKey = process.env.FROGGY_AGENT_KEY;

type FormState =
  | {
      tokenId: string;
      recipient: string;
    }
  | undefined;

export const hop = async (formState: FormState, formData: FormData) => {
  console.log("formData:", formData);
  if (!senderKey) {
    console.error("FROGGY_AGENT_KEY is not set");
    return { txid: "" };
  }

  const tokenId = BigInt(formData.get("tokenId") as string);
  const recipient = formData.get("recipient") as string;

  const txOptions: SignedContractCallOptions = {
    anchorMode: AnchorMode.Any,
    network: network,
    contractAddress: FROGGY_CONTRACT_ADDRESS,
    functionName: "hop",
    functionArgs: [uintCV(tokenId), principalCV(recipient)],
    contractName: "froggys",
    senderKey: senderKey,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    console.log("transaction:", transaction);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    console.log("broadcastResponse:", broadcastResponse);
    const { txid, error, reason, reason_data } = broadcastResponse;
    if (error) {
      console.error("Failed to hop", error, reason, reason_data);
    }
    console.log("Hopped", txid);
    return { txid };
  } catch (error) {
    console.error("Failed to hop", error);
  }
};
