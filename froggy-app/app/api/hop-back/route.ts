import { NextResponse } from "next/server";
import {
  SignedContractCallOptions,
  SignedTokenTransferOptions,
  getAddressFromPrivateKey,
  getNonce,
  makeContractCall,
  makeSTXTokenTransfer,
  uintCV,
} from "@stacks/transactions";
import { broadcastTransaction, AnchorMode } from "@stacks/transactions";
import { FROGGY_CONTRACT_ADDRESS_DEVNET, network } from "@/app/config";
import { tokenIdToInscriptionId } from "@/lib/utils/misc";

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

  const senderAddress = getAddressFromPrivateKey(senderKey, network.version);

  const nonce = (await getNonce(senderAddress, network)) + BigInt(1);

  const txOptions: SignedContractCallOptions = {
    anchorMode: AnchorMode.Any,
    contractAddress: FROGGY_CONTRACT_ADDRESS_DEVNET,
    functionName: "hop-back",
    functionArgs: [uintCV(tokenId)],
    contractName: "Froggys",
    senderKey: senderKey,
    network: network,
    nonce: nonce,
  };

  // send a transaction to the recipient with a memo that includes the tokenId
  const inscriptionId = tokenIdToInscriptionId(tokenId);
  const memo = `t${inscriptionId}`;

  const sordTxOptions: SignedTokenTransferOptions = {
    anchorMode: AnchorMode.Any,
    recipient,
    amount: 1000000n,
    network: network,
    senderKey: senderKey,
    memo: memo,
    nonce: nonce + BigInt(1),
  };

  try {
    const sordTransaction = await makeSTXTokenTransfer(sordTxOptions);
    console.log("sordTransaction:", sordTransaction);
    const sordBroadcastResponse = await broadcastTransaction(sordTransaction, network);
    console.log("sordBroadcastResponse:", sordBroadcastResponse);
    const { txid: sordTxId, error: sordError } = sordBroadcastResponse;
    if (sordError) {
      console.error("Failed to sord", sordError);
      return NextResponse.json({ sordError }, { status: 400 });
    }
    console.log("sordTx", sordTxId);

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
    return NextResponse.json({ sordTxId, txid }, { status: 200 });
  } catch (error) {
    console.error("Failed to hop", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
