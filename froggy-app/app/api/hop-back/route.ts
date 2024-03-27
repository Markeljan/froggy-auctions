import { NextRequest, NextResponse } from "next/server";
import { FROGGY_AGENT_ADDRESS, FROGGY_CONTRACT_ADDRESS, transactionsApi } from "@/app/config";
import { FroggyHop, FroggyHopContractCall, HopStatus, TxStatus } from "@/lib/types";
import { findFroggy } from "@/lib/utils/misc";
import { addFroggyHop } from "@/app/actions";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  const { txId } = data as { txId: string };

  const tx = (await transactionsApi.getTransactionById({ txId })) as FroggyHopContractCall;
  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
  const contractFunctionName = tx?.contract_call?.function_name;

  if (contractAddress !== FROGGY_CONTRACT_ADDRESS || contractFunctionName !== "hop-back") {
    return NextResponse.json({ error: "Invalid contract or function" }, { status: 400 });
  }

  const tokenId = parseInt(tx?.contract_call?.function_args[0]?.repr.split("u")[1]);
  const { inscriptionId, inscriptionHash } = findFroggy(tokenId) || {};
  if (!inscriptionHash || !inscriptionId) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  const memoString = Buffer.from("t").toString("hex") + inscriptionHash;

  const froggyHopBack = {
    txId,
    sender: tx.sender_address,
    recipient: FROGGY_AGENT_ADDRESS,
    memo: memoString,
    tokenId,
    inscriptionId,
    txStatus: TxStatus.PENDING,
    hopStatus: HopStatus.HOPPING,
  } as FroggyHop;

  // push the hop to db
  await addFroggyHop(froggyHopBack);

  return NextResponse.json({ txId }, { status: 200 });
}
