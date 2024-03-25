import { NextRequest, NextResponse } from "next/server";
import {
  FungibleConditionCode,
  SignedContractCallOptions,
  bufferCV,
  createSTXPostCondition,
  getNonce,
  makeContractCall,
  principalCV,
} from "@stacks/transactions";
import { broadcastTransaction, AnchorMode } from "@stacks/transactions";
import {
  FROGGYS_PARENT_HASH,
  FROGGY_AGENT_ADDRESS,
  SORDINALS_CONTRACT_ADDRESS,
  network,
  transactionsApi,
} from "@/app/config";
import { getFroggyHopBacks, updateFroggyHopBackByIndex } from "@/app/actions";
import { FroggyHopTransaction } from "@/lib/types";
import { inscriptionIdToTokenId } from "@/lib/utils/misc";

const FROGGY_AGENT_KEY = `${process.env.FROGGY_AGENT_KEY}`;

const CRON_SECRET = `${process.env.CRON_SECRET}`;

if (!FROGGY_AGENT_KEY || !CRON_SECRET) {
  throw new Error("FROGGY_AGENT_KEY or CRON_SECRET is not set");
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hopList = await getFroggyHopBacks();
  if (!hopList || hopList.length === 0) {
    return NextResponse.json({ message: "No hops to execute" }, { status: 200 });
  }

  const sordinalsResponse = await fetch(`https://api.sordinals.com/api/v1/inscriptions/owner/${FROGGY_AGENT_ADDRESS}?limit=10000`);
  const sordinalsData = await sordinalsResponse.json();
  const agentFroggys = sordinalsData?.data?.filter(
    (sord: { parentHash: string }) => sord.parentHash === FROGGYS_PARENT_HASH
  );

  // get the nonce from the wallet
  const nonce = await getNonce(FROGGY_AGENT_ADDRESS, network);
  const executedHops = [];
  // loop through the hops, until one is successfully executed
  for (let i = 0; i < hopList.length; i++) {
    const hop = hopList[i];
    const { inscriptionId, txStatus, hopStatus, recipient, txid, sender } = hop;
    if (hopStatus !== "pending") {
      continue;
    }

    // check if the froggy agent owns the froggy
    const isFroggyHeldByAgent = agentFroggys?.some((sord: { id: string }) => sord.id === inscriptionId.toString());

    if (!isFroggyHeldByAgent) {
      console.error(`Froggy not held by agent: ${inscriptionId}`);
      continue;
    }
    // confirm the transaction status is success
    const transaction = (await transactionsApi.getTransactionById({ txId: txid })) as FroggyHopTransaction;
    if (!transaction) {
      console.error(`Transaction not found for txid: ${txid}`);
      continue;
    }

    if (transaction.tx_status !== "success") {
      console.error(`Transaction has not been confirmed yet for txid: ${txid}`);
      continue;
    }

    const tokenId = inscriptionIdToTokenId(inscriptionId);
    if (!tokenId) {
      console.error(`Failed to get tokenId for inscriptionId: ${inscriptionId}`);
      continue;
    }

    const memoBuffer = Buffer.from(hop.memo, "hex");
    const memoCV = bufferCV(memoBuffer);

    // execute the hop
    const txOptions: SignedContractCallOptions = {
      anchorMode: AnchorMode.Any,
      contractAddress: SORDINALS_CONTRACT_ADDRESS,
      contractName: "sordinals-inscribe",
      functionName: "transfer-memo-single",
      functionArgs: [principalCV(hop.sender), memoCV],
      postConditions: [createSTXPostCondition(FROGGY_AGENT_ADDRESS, FungibleConditionCode.Equal, 1n)],
      senderKey: FROGGY_AGENT_KEY,
      network: network,
      fee: 100000n, // 0.10 STX
      nonce: nonce + BigInt(i),
    };

    try {
      const hopTransaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction(hopTransaction, network);
      const { txid, error, reason, reason_data } = broadcastResponse;
      if (error) {
        console.error("Failed to hopback", error, reason, reason_data);
        return NextResponse.json({ error, reason, reason_data }, { status: 400 });
      }
      // update the hop status
      hop.hopStatus = "completed";
      hop.txStatus = transaction.tx_status;
      hop.txid = txid;

      // update froggy by the index
      await updateFroggyHopBackByIndex(hopList.indexOf(hop), hop);
      executedHops.push(hop);
    } catch (error) {
      console.error("Failed to hopback", error);
      return NextResponse.json({ error: error }, { status: 500 });
    }
  }

  if (executedHops.length > 0) {
    return NextResponse.json({ executedHops }, { status: 200 });
  }

  return NextResponse.json({ message: "No hopbacks executed" }, { status: 200 });
}
