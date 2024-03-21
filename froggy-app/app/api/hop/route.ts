import { NextResponse } from "next/server";
import { SignedContractCallOptions, makeContractCall, principalCV, uintCV } from "@stacks/transactions";
import { broadcastTransaction, AnchorMode } from "@stacks/transactions";
import { FROGGY_CONTRACT_ADDRESS_DEVNET, network } from "@/app/config";

const senderKey = process.env.DEPLOYER_PRIVATE_KEY;

type HopArgs = {
  tokenId: number;
  recipient: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  const data = await request.json();

  const { tokenId, recipient } = data as HopArgs;

  if (!senderKey) {
    console.error("DEPLOYER_PRIVATE_KEY is not set");
    return NextResponse.json({ error: "DEPLOYER_PRIVATE_KEY is not set" }, { status: 400 });
  }

  const txOptions: SignedContractCallOptions = {
    anchorMode: AnchorMode.Any,
    contractAddress: FROGGY_CONTRACT_ADDRESS_DEVNET,
    functionName: "hop",
    functionArgs: [uintCV(tokenId), principalCV(recipient)],
    contractName: "Froggys",
    senderKey: senderKey,
    network: network,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    console.log("transaction:", transaction);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    console.log("broadcastResponse:", broadcastResponse);
    const { txid, error, reason, reason_data } = broadcastResponse;
    if (error) {
      console.error("Failed to hop", error, reason, reason_data);
      return NextResponse.json({ error, reason, reason_data }, { status: 400 });
    }
    console.log("Hopped", txid);
    return NextResponse.json({ txid }, { status: 200 });
  } catch (error) {
    console.error("Failed to hop", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
