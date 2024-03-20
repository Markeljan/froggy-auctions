import { NextResponse } from "next/server";
import { StacksTransaction, deserializeTransaction } from "@stacks/transactions";
import { saveSordEvent, getSordEvents } from "@/app/actions";

export async function POST(request: Request): Promise<NextResponse> {
  const data = await request.json();

  const transaction = data.apply[0].transactions[0];

  const deserializedTx = deserializeTransaction(transaction.metadata.raw_tx) as StacksTransaction & {
    payload: { memo?: { content?: string } };
  };

  const stxReceipt = transaction.metadata.receipt.events.find((e: any) => e.type === "STXTransferEvent");

  const memo = deserializedTx?.payload?.memo?.content;

  if (memo) {
    const stringifiedTx = JSON.stringify({
      txId: transaction.transaction_identifier.hash,
      sender: transaction.metadata.sender,
      recipient: stxReceipt?.data.recipient,
      amount: stxReceipt?.data.amount,
      memo: memo,
    });
    console.log("Saving sord event", stringifiedTx);
    await saveSordEvent(stringifiedTx);
  } else {
    console.log("No memo found in transaction", transaction.transaction_identifier.hash);
  }

  return NextResponse.json(data, { status: 200 });
}

export async function GET(request: Request): Promise<NextResponse> {
  const events = await getSordEvents();
  return NextResponse.json(events, { status: 200 });
}
