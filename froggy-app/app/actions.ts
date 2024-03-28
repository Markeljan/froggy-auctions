import { kv } from "@vercel/kv";
import { FroggyHop, HopStatus, TxStatus } from "@/lib/types";
import { FROGGY_AGENT_ADDRESS } from "./config";

export async function addFroggyHop(data: FroggyHop): Promise<Boolean> {
  const { txId, txStatus, hopStatus, tokenId } = data;
  // override check for txId
  data.txId = txId.startsWith("0x") ? txId : `0x${txId}`;
  console.log("addFroggyHop data:", data);
  if (!txId || !txStatus || !hopStatus || !tokenId) {
    console.error("Missing required data for froggy hop transaction");
    return false;
  }
  try {
    const multi = kv.multi();
    multi.hset(`tx:${txId}`, data);
    multi.sadd(`txStatus:${txStatus}`, txId);
    multi.sadd(`hopStatus:${hopStatus}`, txId);
    multi.sadd(`tokenId:${tokenId}`, txId);
    await multi.exec();
    return true;
  } catch (error) {
    console.error("Failed to add froggy hop transaction", error);
    return false;
  }
}

export async function updateFroggyHop(data: FroggyHop): Promise<Boolean> {
  const { txId, txStatus, hopStatus, tokenId } = data;
  // override check for txId
  data.txId = txId.startsWith("0x") ? txId : `0x${txId}`;
  try {
    const {
      txStatus: prevTxStatus,
      hopStatus: prevHopStatus,
      tokenId: prevTokenId,
    } = (await kv.hgetall<FroggyHop>(`tx:${txId}`)) || {};
    if (!prevTxStatus || !prevHopStatus || !prevTokenId) {
      console.error(`No existing transaction found for txId: ${txId}`);
      return false;
    }
    const multi = kv.multi();
    multi.hset(`tx:${txId}`, data);
    if (prevTxStatus !== txStatus) {
      multi.srem(`txStatus:${prevTxStatus}`, txId);
      multi.sadd(`txStatus:${txStatus}`, txId);
    }
    if (prevHopStatus !== hopStatus) {
      multi.srem(`hopStatus:${prevHopStatus}`, txId);
      multi.sadd(`hopStatus:${hopStatus}`, txId);
    }
    if (prevTokenId !== tokenId) {
      multi.srem(`tokenId:${prevTokenId}`, txId);
      multi.sadd(`tokenId:${tokenId}`, txId);
    }
    await multi.exec();
    return true;
  } catch (error) {
    console.error("Failed to update froggy hop transaction", error);
    return false;
  }
}

export async function getFroggyHopByTxId(txId: string): Promise<FroggyHop | null> {
  // override check for txId
  txId = txId.startsWith("0x") ? txId : `0x${txId}`;
  try {
    const data = await kv.hgetall<FroggyHop>(`tx:${txId}`);
    return data;
  } catch (error) {
    console.error("Failed to get froggy hop transaction", error);
    return null;
  }
}

export async function getAllHoppedFrogs(): Promise<FroggyHop[]> {
  try {
    const hoppedTxIds = (await kv.smembers(`hopStatus:${HopStatus.HOPPED}`)) || [];
    if (!hoppedTxIds.length) {
      return [];
    }
    const multi = kv.multi();
    hoppedTxIds.forEach((txId) => multi.hgetall<FroggyHop>(`tx:${txId}`));
    const hops = await multi.exec<FroggyHop[]>();
    return hops;
  } catch (error) {
    console.error("Failed to get all hopped frogs", error);
    return [];
  }
}

export async function getHoppingFrogs(): Promise<FroggyHop[]> {
  try {
    const hoppingTxIds = [
      ...((await kv.smembers(`hopStatus:${HopStatus.HOPPING}`)) || []),
      ...((await kv.smembers(`hopStatus:${HopStatus.HOPPING_BACK}`)) || []),
    ];

    if (!hoppingTxIds.length) {
      return [];
    }
    const multi = kv.multi();
    hoppingTxIds.forEach((txId) => multi.hgetall<FroggyHop>(`tx:${txId}`));
    const hops = await multi.exec<FroggyHop[]>();
    return hops;
  } catch (error) {
    console.error("Failed to get hopping frogs", error);
    return [];
  }
}

export async function getPendingFroggyTxs(): Promise<FroggyHop[]> {
  try {
    const pendingTxIds = (await kv.smembers(`txStatus:${TxStatus.PENDING}`)) || [];
    if (!pendingTxIds.length) {
      return [];
    }
    const multi = kv.multi();
    pendingTxIds.forEach((txId) => multi.hgetall<FroggyHop>(`tx:${txId}`));
    const hops = await multi.exec<FroggyHop[]>();
    return hops;
  } catch (error) {
    console.error("Failed to get pending transactions", error);
    return [];
  }
}

export async function saveSordEvent(data: string) {
  try {
    await kv.lpush("sord-events", data);
  } catch (error) {
    console.error("Failed to save sord event", error);
  }
}

export async function getSordEvents() {
  try {
    const events = await kv.lrange("sord-events", 0, -1);
    return events;
  } catch (error) {
    console.error("Failed to get sord events", error);
  }
}
const hop: FroggyHop = {
  memo: "0x74a87f28ba37c892ee85231bcbcbadc239c2cfb0cfc1c510ac1533ee75280a09cb",
  tokenId: 1420,
  inscriptionId: 11488,
  txStatus: TxStatus.SUCCESS,
  hopStatus: HopStatus.HOPPED,
  txId: "0x4da3331444771e76767a42984987cc5ad6ca9ddea44ab5c97742f94726b68d0a",
  sender: FROGGY_AGENT_ADDRESS,
  recipient: "SP2R1VEVDTESA9RBV9A9WE971FP0QDBEQ73ANM1DJ",
};

// const hop = await getFroggyHopByTxId("0x03a49f5409c2d6a7fc1cd541cedce08dd602c90a5e8dcc75bbbc72686970576e");
// console.log("hop", hop);

//const res = hop && (await updateFroggyHop({ ...hop, hopStatus: HopStatus.HOPPING }));

//console.log("res", res);
