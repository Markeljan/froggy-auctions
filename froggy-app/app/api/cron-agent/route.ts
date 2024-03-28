import { NextRequest, NextResponse } from "next/server";
import {
  FungibleConditionCode,
  NonFungibleConditionCode,
  SignedContractCallOptions,
  bufferCV,
  createAssetInfo,
  createNonFungiblePostCondition,
  createSTXPostCondition,
  getNonce,
  makeContractCall,
  principalCV,
  uintCV,
} from "@stacks/transactions";
import { broadcastTransaction, AnchorMode } from "@stacks/transactions";
import {
  CRON_SECRET,
  FROGGY_AGENT_ADDRESS,
  FROGGY_AGENT_KEY,
  FROGGY_CONTRACT_ADDRESS,
  SORDINALS_CONTRACT_ADDRESS,
  TRANSFER_PREFIX,
  network,
  transactionsApi,
} from "@/app/config";
import { addFroggyHop, getPendingFroggyTxs, updateFroggyHop } from "@/app/actions";
import { FroggyHop, FroggyHopContractCall, HopStatus, TxStatus } from "@/lib/types";
import { findFroggy } from "@/lib/utils/misc";
import { getOwnedFroggysByPrinciple } from "@/lib/api/get-owned-froggys";
import { getFroggyTokenOwner } from "@/lib/api/get-token-owner";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // get all pending txs
  const dbPendingTxs = await getPendingFroggyTxs();
  console.log("dbPendingTxs", dbPendingTxs);
  if (dbPendingTxs.length === 0) {
    return NextResponse.json({ message: "No pending hops to execute" }, { status: 200 });
  }
  const nonce = await getNonce(FROGGY_AGENT_ADDRESS, network);
  const executedTxIds: string[] = [];
  console.log();
  const dbTxById = new Map(dbPendingTxs.map((hop) => [hop.txId, hop]));
  // fetch all the transactions using the txId and promise.all
  const liveTransactions = (await Promise.all(
    dbPendingTxs.map(async (hop) => {
      const { txId } = hop;
      return transactionsApi.getTransactionById({ txId });
    })
  )) as FroggyHopContractCall[];

  // filter out the successful transactions
  const successfulTransactions = liveTransactions.filter((tx) => {
    if (!tx) {
      return false;
    }
    return tx.tx_status === "success";
  });
  console.log("# of successfulTransactions", successfulTransactions.length);
  // handle HOPPING transactions
  successfulTransactions.forEach(async (tx) => {
    console.log("tx", tx.tx_id);
    console.log("dbTxById", dbTxById);
    const matchingHop = dbTxById.get(tx.tx_id);
    if (matchingHop?.hopStatus !== HopStatus.HOPPING) {
      return null;
    }
    console.log("matchingHop", matchingHop);
    const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
    const contractFunctionName = tx?.contract_call?.function_name;
    if (contractAddress !== SORDINALS_CONTRACT_ADDRESS || contractFunctionName !== "transfer-memo-single") {
      return null;
    }
    const sender = tx.sender_address;
    const recipient = tx?.contract_call?.function_args[0]?.repr.split("'")[1];
    if (recipient !== FROGGY_AGENT_ADDRESS || !sender) {
      return null;
    }
    const memo = tx?.contract_call?.function_args[1]?.repr;
    if (!memo?.startsWith(TRANSFER_PREFIX)) {
      return null;
    }
    const inscriptionHashFromMemo = memo.slice(TRANSFER_PREFIX.length);
    const { inscriptionId, id: tokenId } = findFroggy(inscriptionHashFromMemo) || {};
    if (!inscriptionId || !tokenId) {
      return null;
    }
    const agentFroggys = await getOwnedFroggysByPrinciple(FROGGY_AGENT_ADDRESS);
    console.log("agentFroggys", agentFroggys);
    const isFroggyHeldByAgent = agentFroggys?.some((sord: { id: string }) => sord.id === inscriptionId.toString());
    if (!isFroggyHeldByAgent) {
      return null;
    }

    const tokenIdHolder = await getFroggyTokenOwner(tokenId);
    const isTokenIdVaulted = tokenIdHolder === `${FROGGY_CONTRACT_ADDRESS}.froggys`;

    console.log("tokenIdHolder", tokenIdHolder);

    const contractSendsNFTPostCondition = createNonFungiblePostCondition(
      FROGGY_CONTRACT_ADDRESS,
      NonFungibleConditionCode.Sends,
      createAssetInfo(FROGGY_CONTRACT_ADDRESS, "froggys", "froggys"),
      uintCV(tokenId)
    );

    const txOptions: SignedContractCallOptions = {
      anchorMode: AnchorMode.Any,
      contractAddress: FROGGY_CONTRACT_ADDRESS,
      contractName: "froggys",
      functionName: "hop",
      functionArgs: [uintCV(tokenId), principalCV(sender)],
      senderKey: FROGGY_AGENT_KEY,
      network: network,
      postConditions: isTokenIdVaulted ? [contractSendsNFTPostCondition] : [],
      fee: 100000n, // 0.10 STX
      nonce: nonce + BigInt(executedTxIds.length),
    };
    // execute the hop
    const hopTxId = await executeFroggyTransaction(txOptions, matchingHop, HopStatus.HOPPED);
    if (hopTxId) {
      executedTxIds.push(hopTxId);
    }
  });

  // handle HOPPING-BACK transactions
  successfulTransactions.forEach(async (tx) => {
    const matchingHop = dbTxById.get(tx.tx_id);
    if (matchingHop?.hopStatus !== HopStatus.HOPPING_BACK) {
      return null;
    }
    const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
    const contractFunctionName = tx?.contract_call?.function_name;
    if (contractAddress !== FROGGY_CONTRACT_ADDRESS || contractFunctionName !== "hop-back") {
      return false;
    }
    const sender = tx.sender_address;
    // get the tokenId from the tx function args
    const tokenId = parseInt(tx?.contract_call?.function_args[0]?.repr.split("u")[1]);
    const { inscriptionId, inscriptionHash } = findFroggy(tokenId) || {};
    if (!inscriptionHash || !inscriptionId) {
      return false;
    }
    // validate that the sender owns the hopped froggy
    const tokenIdHolder = await getFroggyTokenOwner(tokenId);
    if (tokenIdHolder !== sender) {
      console.error(`Token holder does not match sender: ${tokenIdHolder} !== ${sender}`);
      return false;
    }

    // validate that the agent owns the froggy inscription
    const agentFroggys = await getOwnedFroggysByPrinciple(FROGGY_AGENT_ADDRESS);
    const isFroggyHeldByAgent = agentFroggys?.some((sord: { id: string }) => sord.id === inscriptionId.toString());
    if (!isFroggyHeldByAgent) {
      console.error(`Froggy inscription not held by agent: ${inscriptionId}`);
      return false;
    }
    const memoString = Buffer.from("t").toString("hex") + inscriptionHash;
    const txOptions: SignedContractCallOptions = {
      anchorMode: AnchorMode.Any,
      contractAddress: SORDINALS_CONTRACT_ADDRESS,
      contractName: "sordinals-inscribe",
      functionName: "transfer-memo-single",
      functionArgs: [principalCV(FROGGY_AGENT_ADDRESS), bufferCV(Buffer.from(memoString, "hex"))],
      senderKey: FROGGY_AGENT_KEY,
      network: network,
      fee: 100000n, // 0.10 STX
      nonce: nonce + BigInt(executedTxIds.length),
      postConditions: [createSTXPostCondition(FROGGY_AGENT_ADDRESS, FungibleConditionCode.Equal, 1n)],
    };
    // execute the hop-back
    const hopBackTxId = await executeFroggyTransaction(txOptions, matchingHop, HopStatus.NONE);
    if (hopBackTxId) {
      executedTxIds.push(hopBackTxId);
    }
  });

  // handle HOPPED and NONE pending transactions (update the txStatus on dbFroggyHop)
  successfulTransactions.forEach(async (tx) => {
    const matchingHop = dbTxById.get(tx.tx_id);
    if (!matchingHop) {
      return null;
    }
    if (matchingHop.hopStatus === HopStatus.HOPPED || matchingHop.hopStatus === HopStatus.NONE) {
      await updateFroggyHop({ ...matchingHop, txStatus: TxStatus.SUCCESS });
    }
  });

  // return executed txIds
  return NextResponse.json({ executedTxIds }, { status: 200 });
}

async function executeFroggyTransaction(
  txOptions: SignedContractCallOptions,
  dbFroggyHop: FroggyHop,
  newHopStatus: HopStatus
): Promise<string | null> {
  const hopTransaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(hopTransaction, network);
  const { txid, error, reason, reason_data } = broadcastResponse;
  if (error) {
    console.error("Failed to hop", error, reason, reason_data);
    return null;
  }
  // update the previous dbFroggyHop
  await updateFroggyHop({ ...dbFroggyHop, txStatus: TxStatus.SUCCESS });

  // add a new dbFroggyHop
  await addFroggyHop({
    ...dbFroggyHop,
    txId: txid,
    txStatus: TxStatus.PENDING,
    hopStatus: newHopStatus,
    sender: FROGGY_AGENT_ADDRESS,
    recipient: dbFroggyHop.sender,
  });

  return txid;
}
