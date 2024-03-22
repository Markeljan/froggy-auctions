import { NextRequest, NextResponse } from "next/server";
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
import { FROGGY_CONTRACT_ADDRESS, network, transactionsApi } from "@/app/config";
import { tokenIdToInscriptionId } from "@/lib/utils/misc";
import { FroggyHopContractCall } from "@/lib/types";

const senderKey = process.env.FROGGY_AGENT_KEY;

if (!senderKey) {
  throw new Error("FROGGY_AGENT_KEY is not set");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  const { txid } = data as { txid: string };

  const tx = (await transactionsApi.getTransactionById({ txId: txid })) as FroggyHopContractCall;

  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
  const contractFunctionName = tx?.contract_call?.function_name;

  if (contractAddress !== FROGGY_CONTRACT_ADDRESS || contractFunctionName !== "hop-back") {
    return NextResponse.json({ error: "Invalid contract or function" }, { status: 400 });
  }

  //temp

  return NextResponse.json({ txid }, { status: 200 });

  // const txOptions: SignedContractCallOptions = {
  //   anchorMode: AnchorMode.Any,
  //   contractAddress: FROGGY_CONTRACT_ADDRESS,
  //   functionName: "hop-back",
  //   functionArgs: [uintCV(tokenId)],
  //   contractName: "froggys",
  //   senderKey: senderKey,
  //   network: network,
  //   nonce: nonce,
  // };

  // // send a transaction to the recipient with a memo that includes the tokenId
  // const inscriptionId = tokenIdToInscriptionId(tokenId);
  // const memo = `t${inscriptionId}`;

  // const sordTxOptions: SignedTokenTransferOptions = {
  //   anchorMode: AnchorMode.Any,
  //   recipient,
  //   amount: 1000000n,
  //   network: network,
  //   senderKey: senderKey,
  //   memo: memo,
  //   nonce: nonce + BigInt(1),
  // };

  // try {
  //   const sordTransaction = await makeSTXTokenTransfer(sordTxOptions);
  //   console.log("sordTransaction:", sordTransaction);
  //   const sordBroadcastResponse = await broadcastTransaction(sordTransaction, network);
  //   console.log("sordBroadcastResponse:", sordBroadcastResponse);
  //   const { txid: sordTxId, error: sordError } = sordBroadcastResponse;
  //   if (sordError) {
  //     console.error("Failed to sord", sordError);
  //     return NextResponse.json({ sordError }, { status: 400 });
  //   }
  //   console.log("sordTx", sordTxId);

  //   const transaction = await makeContractCall(txOptions);
  //   console.log("transaction:", transaction);
  //   const broadcastResponse = await broadcastTransaction(transaction, network);
  //   console.log("broadcastResponse:", broadcastResponse);
  //   const { txid, error, reason, reason_data } = broadcastResponse;
  //   if (error) {
  //     console.error("Failed to hop", error, reason, reason_data);
  //     return NextResponse.json({ error, reason, reason_data }, { status: 400 });
  //   }
  //   console.log("Hopped", txid);
  //   return NextResponse.json({ sordTxId, txid }, { status: 200 });
  // } catch (error) {
  //   console.error("Failed to hop", error);
  //   return NextResponse.json({ error: error }, { status: 500 });
  // }
}
