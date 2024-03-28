import { NextRequest, NextResponse } from "next/server";
import { FROGGY_AGENT_ADDRESS, SORDINALS_CONTRACT_ADDRESS, transactionsApi } from "@/app/config";
import { FroggyHop, FroggyHopContractCall, HopStatus, TxStatus } from "@/lib/types";
import { findFroggy } from "@/lib/utils/misc";
import { addFroggyHop, getAllHoppedFrogs } from "@/app/actions";

const TRANSFER_PREFIX = "0x74";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  const { txId } = data as { txId: string };
  console.log("POST /api/hop txId:", txId);

  const tx = (await transactionsApi.getTransactionById({ txId })) as FroggyHopContractCall;

  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
  const contractFunctionName = tx?.contract_call?.function_name;

  if (contractAddress !== SORDINALS_CONTRACT_ADDRESS || contractFunctionName !== "transfer-memo-single") {
    return NextResponse.json({ error: "Invalid contract" }, { status: 400 });
  }

  const recipient = tx?.contract_call?.function_args[0]?.repr.split("'")[1];
  if (recipient !== FROGGY_AGENT_ADDRESS) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  const memo = tx?.contract_call?.function_args[1]?.repr;
  if (!memo?.startsWith(TRANSFER_PREFIX)) {
    return NextResponse.json({ error: "Invalid memo" }, { status: 400 });
  }

  const inscriptionHashFromMemo = memo.slice(TRANSFER_PREFIX.length);
  const { inscriptionId, id: tokenId } = findFroggy(inscriptionHashFromMemo) || {};
  if (!inscriptionId || !tokenId) {
    return NextResponse.json({ error: "Invalid inscriptionHash" }, { status: 400 });
  }

  const froggyHop = {
    txId,
    sender: tx.sender_address,
    recipient,
    memo,
    tokenId,
    inscriptionId,
    txStatus: TxStatus.PENDING,
    hopStatus: HopStatus.HOPPING,
  } as FroggyHop;

  const writeSuccess = await addFroggyHop(froggyHop);
  if (!writeSuccess) {
    return NextResponse.json({ error: "Failed to save hop" }, { status: 500 });
  }

  return NextResponse.json({ txId }, { status: 200 });
}

export async function GET(): Promise<NextResponse> {
  const hopList = await getAllHoppedFrogs();
  return NextResponse.json(hopList, { status: 200 });
}
