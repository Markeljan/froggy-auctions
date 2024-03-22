import { NextRequest, NextResponse } from "next/server";
import { FROGGY_AGENT_ADDRESS, transactionsApi } from "@/app/config";
import { FroggyHop, FroggyHopTransaction } from "@/lib/types";
import { validateFroggysMemo } from "@/lib/utils/misc";
import { saveFroggyHop } from "@/app/actions";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  const { txid } = data as { txid: string };

  const tx = (await transactionsApi.getTransactionById({ txId: txid })) as FroggyHopTransaction;

  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const recipient = tx?.token_transfer?.recipient_address;
  const serializedMemo = tx?.token_transfer?.memo;

  const cleanHexString = serializedMemo.startsWith("0x") ? serializedMemo.slice(2) : serializedMemo;
  const buffer = Buffer.from(cleanHexString, "hex");
  const memo = buffer.toString("utf-8");
  const isValidMemo = validateFroggysMemo(memo);

  const inscriptionId = parseInt(memo.slice(1));
  if (isNaN(inscriptionId)) {
    return NextResponse.json({ error: "Invalid inscriptionId" }, { status: 400 });
  }
  const isValidHop = recipient === FROGGY_AGENT_ADDRESS && isValidMemo && inscriptionId;

  if (!isValidHop) {
    return NextResponse.json({ error: "Not a valid Froggys" }, { status: 400 });
  }

  const froggyHop = {
    txid,
    sender: tx.sender_address,
    recipient,
    memo,
    inscriptionId,
    txStatus: tx.tx_status,
    hopStatus: "pending",
  } as FroggyHop;

  // push the hop to db
  await saveFroggyHop(JSON.stringify(froggyHop));

  return NextResponse.json({ txid }, { status: 200 });
}
