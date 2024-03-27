import { NextRequest, NextResponse } from "next/server";
import { FROGGY_AGENT_ADDRESS, FROGGY_CONTRACT_ADDRESS, transactionsApi } from "@/app/config";
import { FroggyHop, FroggyHopContractCall } from "@/lib/types";
import { tokenIdToInscriptionHash, tokenIdToInscriptionId } from "@/lib/utils/misc";
import { saveFroggyHopBack } from "@/app/actions";

const TRANSFER_PREFIX = "0x74";

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

  const tokenId = parseInt(tx?.contract_call?.function_args[0]?.repr.split("u")[1]);
  const inscriptionId = tokenIdToInscriptionId(tokenId);
  const inscriptionHash = tokenIdToInscriptionHash(tokenId);
  if (!inscriptionHash) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  const hexString = Buffer.from("t").toString("hex") + inscriptionHash; // inscription hash is a 64 symbols long hex identifier

  const froggyHopBack = {
    txid,
    sender: tx.sender_address,
    recipient: FROGGY_AGENT_ADDRESS,
    memo: hexString,
    inscriptionId,
    txStatus: tx.tx_status,
    hopStatus: "pending",
  } as FroggyHop;

  // push the hop to db
  await saveFroggyHopBack(froggyHopBack);

  return NextResponse.json({ txid }, { status: 200 });
}
