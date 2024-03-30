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

  const nonce = await getNonce(FROGGY_AGENT_ADDRESS, network);
  const executedTxIds: string[] = [];
  const dbTxById = new Map(dbPendingTxs.map((hop) => [hop.txId, hop]));
  // fetch all the transactions using the txId and promise.all
  const liveTransactions = (await Promise.all(
    dbPendingTxs.map(async (hop) => {
      const { txId } = hop;
      return transactionsApi.getTransactionById({ txId });
    })
  )) as FroggyHopContractCall[];

  // filter successful transactions
  const successfulTransactions = liveTransactions.filter((tx) => tx.tx_status === "success");

  if (successfulTransactions.length === 0) {
    return NextResponse.json({ message: "No successful transactions to process" }, { status: 200 });
  }

  successfulTransactions.forEach(async (tx) => {
    const matchingTx = dbTxById.get(tx.tx_id);
    if (!matchingTx) {
      console.error(`No matching tx found for txId: ${tx.tx_id}`);
      return;
    }
    // handle HOPPING transactions
    if (matchingTx.hopStatus === HopStatus.HOPPING) {
      const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
      const contractFunctionName = tx?.contract_call?.function_name;
      if (contractAddress !== SORDINALS_CONTRACT_ADDRESS || contractFunctionName !== "transfer-memo-single") {
        console.error(`h Invalid contract address or function name: ${contractAddress} ${contractFunctionName}`);
        return;
      }
      const sender = tx.sender_address;
      const recipient = tx?.contract_call?.function_args[0]?.repr.split("'")[1];
      if (recipient !== FROGGY_AGENT_ADDRESS || !sender) {
        console.error("Invalid sender or recipient");
        return;
      }
      const memo = tx?.contract_call?.function_args[1]?.repr;
      if (!memo?.startsWith(TRANSFER_PREFIX)) {
        console.error("Invalid memo");
        return;
      }
      const inscriptionHashFromMemo = memo.slice(TRANSFER_PREFIX.length);
      const { inscriptionId, id: tokenId } = findFroggy(inscriptionHashFromMemo) || {};
      if (!inscriptionId || !tokenId) {
        console.error("Invalid inscriptionId or tokenId");
        return;
      }
      const agentFroggys = await getOwnedFroggysByPrinciple(FROGGY_AGENT_ADDRESS);
      const isFroggyHeldByAgent = agentFroggys?.some((sord: { id: string }) => sord.id === inscriptionId.toString());
      if (!isFroggyHeldByAgent) {
        console.error(`Froggy inscription not held by agent: ${inscriptionId}`);
        return;
      }

      const tokenIdHolder = await getFroggyTokenOwner(tokenId);
      const isTokenIdVaulted = tokenIdHolder === `${FROGGY_CONTRACT_ADDRESS}.froggys`;

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
      const hopTxId = await executeFroggyTransaction(txOptions, matchingTx, HopStatus.HOPPED);
      if (hopTxId) {
        executedTxIds.push(hopTxId);
      }
    }

    // handle HOPPING-BACK transactions
    if (matchingTx.hopStatus === HopStatus.HOPPING_BACK) {
      const contractAddress = tx?.contract_call?.contract_id?.split(".")[0];
      const contractFunctionName = tx?.contract_call?.function_name;
      if (contractAddress !== FROGGY_CONTRACT_ADDRESS || contractFunctionName !== "hop-back") {
        console.error(`h-b Invalid contract address or function name: ${contractAddress} ${contractFunctionName}`);
        return false;
      }
      // get the tokenId from the tx function args
      const tokenId = parseInt(tx?.contract_call?.function_args[0]?.repr.split("u")[1]);
      const { inscriptionId, inscriptionHash } = findFroggy(tokenId) || {};
      if (!inscriptionHash || !inscriptionId) {
        console.error(`Invalid inscriptionId or inscriptionHash: ${inscriptionId} ${inscriptionHash}`);
        return false;
      }
      // validate that the sender owns the hopped froggy
      const tokenIdHolder = await getFroggyTokenOwner(tokenId);

      const sender = tx.sender_address;
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
        functionArgs: [principalCV(sender), bufferCV(Buffer.from(memoString, "hex"))],
        senderKey: FROGGY_AGENT_KEY,
        network: network,
        fee: 100000n, // 0.10 STX
        nonce: nonce + BigInt(executedTxIds.length),
        postConditions: [createSTXPostCondition(FROGGY_AGENT_ADDRESS, FungibleConditionCode.Equal, 1n)],
      };
      // execute the hop-back
      const hopBackTxId = await executeFroggyTransaction(txOptions, matchingTx, HopStatus.NONE);
      if (hopBackTxId) {
        executedTxIds.push(hopBackTxId);
      }
    }

    if (matchingTx.hopStatus === HopStatus.HOPPED || matchingTx.hopStatus === HopStatus.NONE) {
      await updateFroggyHop({ ...matchingTx, txStatus: TxStatus.SUCCESS });
    }
  });

  if (executedTxIds.length === 0) {
    return NextResponse.json({ message: `Possibles errors or invalid Froggy transactions` }, { status: 500 });
  }

  return NextResponse.json({ message: "Hops executed", executedTxIds }, { status: 200 });
}

async function executeFroggyTransaction(
  txOptions: SignedContractCallOptions,
  dbFroggyHop: FroggyHop,
  newHopStatus: HopStatus
): Promise<string | undefined> {
  const hopTransaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(hopTransaction, network);
  const { txid: txId, error, reason, reason_data } = broadcastResponse;
  if (error || !txId) {
    console.error("Failed to hop", error, reason, reason_data);
    return;
  }
  // update the previous dbFroggyHop
  await updateFroggyHop({ ...dbFroggyHop, txStatus: TxStatus.SUCCESS });

  // add a new dbFroggyHop
  await addFroggyHop({
    ...dbFroggyHop,
    txId: txId,
    txStatus: TxStatus.PENDING,
    hopStatus: newHopStatus,
    sender: FROGGY_AGENT_ADDRESS,
    recipient: dbFroggyHop.sender,
  });

  return txId;
}
