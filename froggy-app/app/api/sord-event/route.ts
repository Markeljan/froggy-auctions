import { NextResponse } from "next/server";
import { StacksTransaction, TokenTransferPayload, deserializeTransaction } from "@stacks/transactions";
import { saveSordEvent, getSordEvents } from "@/app/actions";
import { validateFroggysMemo } from "@/lib/utils/misc";
import { FROGGY_AGENT_ADDRESS } from "@/app/config";

const CHAINHOOK_AUTH_KEY = process.env.CHAINHOOK_AUTH_KEY;
if (!CHAINHOOK_AUTH_KEY) {
  throw new Error("ENV variable misssing");
}

export async function POST(request: Request): Promise<NextResponse> {
  console.log("request", request);
  console.log("request.headers", request.headers);

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${CHAINHOOK_AUTH_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  const txFromChainhook = data.apply[0].transactions[0];

  const stxReceipt = txFromChainhook.metadata.receipt.events.find((e: any) => e.type === "STXTransferEvent");
  const recipient = stxReceipt?.data.recipient;

  const deserializedTx = deserializeTransaction(txFromChainhook.metadata.raw_tx) as StacksTransaction & {
    payload: TokenTransferPayload;
  };

  const memo = deserializedTx?.payload?.memo?.content;

  const isValidFroggysHopTransaction = recipient === FROGGY_AGENT_ADDRESS && validateFroggysMemo(memo);

  if (isValidFroggysHopTransaction) {
    const stringifiedTx = JSON.stringify({
      txId: txFromChainhook.transaction_identifier.hash,
      sender: txFromChainhook.metadata.sender,
      recipient,
      amount: stxReceipt?.data.amount,
      memo,
    });
    console.log("Saving valid Froggy deposit", stringifiedTx);
    await saveSordEvent(stringifiedTx);
  } else {
    console.log("No memo found in transaction", txFromChainhook.transaction_identifier.hash);
  }

  return NextResponse.json(data, { status: 200 });
}

export async function GET(request: Request): Promise<NextResponse> {
  const events = await getSordEvents();
  return NextResponse.json(events, { status: 200 });
}
