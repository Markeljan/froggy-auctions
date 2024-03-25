import { NextRequest, NextResponse } from "next/server";
import { FROGGY_AGENT_ADDRESS, FROGGY_CONTRACT_ADDRESS, transactionsApi } from "@/app/config";
import { FroggyHop, FroggyHopContractCall } from "@/lib/types";
import { inscriptionHashToInscriptionId, tokenIdToInscriptionHash, tokenIdToInscriptionId } from "@/lib/utils/misc";
import { saveFroggyHop, saveFroggyHopBack } from "@/app/actions";
import { bufferCV, cvToValue } from "@stacks/transactions";

const TRANSFER_PREFIX = "0x74";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const data = await request.json();
  const { txid } = data as { txid: string };

  const tx = (await transactionsApi.getTransactionById({ txId: txid })) as FroggyHopContractCall;

  const exampleValidTx = {
    tx_id: "0xedcd42314d8cb7e96de3c9f3d574f75f2af1abe5713019b1ab7f0cfb9215aa66",
    nonce: 4,
    fee_rate: "3000",
    sender_address: "SP2R1VEVDTESA9RBV9A9WE971FP0QDBEQ73ANM1DJ",
    sponsored: false,
    post_condition_mode: "allow",
    post_conditions: [
      {
        type: "stx",
        condition_code: "sent_equal_to",
        amount: "1000001",
        principal: {
          type_id: "principal_standard",
          address: "SP2R1VEVDTESA9RBV9A9WE971FP0QDBEQ73ANM1DJ",
        },
      },
      {
        type: "non_fungible",
        condition_code: "sent",
        principal: {
          type_id: "principal_standard",
          address: "SP2R1VEVDTESA9RBV9A9WE971FP0QDBEQ73ANM1DJ",
        },
        asset: {
          contract_name: "froggys",
          asset_name: "froggys",
          contract_address: "SP25661F2PHYBS56DF2KKEWDQSA53ABNFW8GKQTTC",
        },
        asset_value: { hex: "0x010000000000000000000000000000058c", repr: "u1420" },
      },
    ],
    anchor_mode: "any",
    tx_status: "pending",
    receipt_time: 1711336794,
    receipt_time_iso: "2024-03-25T03:19:54.000Z",
    tx_type: "contract_call",
    contract_call: {
      contract_id: "SP25661F2PHYBS56DF2KKEWDQSA53ABNFW8GKQTTC.froggys",
      function_name: "hop-back",
      function_signature: "(define-public (hop-back (token-id uint)))",
      function_args: [
        {
          hex: "0x010000000000000000000000000000058c",
          repr: "u1420",
          name: "token-id",
          type: "uint",
        },
      ],
    },
  };
  console.log("tx", tx);
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
