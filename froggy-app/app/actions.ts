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
    // update tokenId set to always reflect the latest tx for tokenId
    multi.set(`lastTx:${tokenId}`, txId);
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
    if (!prevTxStatus || !prevHopStatus) {
      console.error(`No existing transaction found for txId: ${txId}`);
      return false;
    }
    if (prevTokenId !== tokenId) {
      console.error(`Found different tokenId for txId: ${txId}`);
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
    // update tokenId set to always reflect the latest tx for tokenId
    multi.set(`lastTx:${tokenId}`, txId);

    await multi.exec();
    return true;
  } catch (error) {
    console.error("Failed to update froggy hop transaction", error);
    return false;
  }
}

// get last tx for tokenId
export async function getLastTxByTokenId(tokenId: number): Promise<FroggyHop | null> {
  try {
    const txId = (await kv.get<FroggyHop>(`lastTx:${tokenId}`)) || {};
    if (!txId) {
      return null;
    }
    const data = await kv.hgetall<FroggyHop>(`tx:${txId}`);
    return data;
  } catch (error) {
    console.error("Failed to get last transaction for tokenId", error);
    return null;
  }
}

// get last tx for all tokenIds
export async function getLastTxForAllTokens(): Promise<FroggyHop[]> {
  try {
    const lastTxIds = await kv.keys("lastTx:*");
    if (!lastTxIds.length) {
      return [];
    }
    const multi = kv.multi();
    lastTxIds.forEach((key) => multi.get<FroggyHop>(key));

    const txIds = await multi.exec<FroggyHop[]>();
    if (!txIds.length) {
      return [];
    }
    const multi2 = kv.multi();
    txIds.forEach((txId) => multi2.hgetall<FroggyHop>(`tx:${txId}`));
    const hops = await multi2.exec<FroggyHop[]>();
    return hops;
  } catch (error) {
    console.error("Failed to get last transactions for all tokenIds", error);
    return [];
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
    const hoppedTxIds = await kv.sinter(`hopStatus:${HopStatus.HOPPED}`, `txStatus:${TxStatus.SUCCESS}`);
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
    const hoppingTxIds = await kv.sinter(`hopStatus:${HopStatus.HOPPING}`, `txStatus:${TxStatus.PENDING}`);
    const hoppingBackTxIds = await kv.sinter(`hopStatus:${HopStatus.HOPPING_BACK}`, `txStatus:${TxStatus.PENDING}`);
    const hoppingTxIdsSet = new Set([...hoppingTxIds, ...hoppingBackTxIds]);
    if (!hoppingTxIdsSet.size) {
      return [];
    }
    const multi = kv.multi();
    hoppingTxIdsSet.forEach((txId) => multi.hgetall<FroggyHop>(`tx:${txId}`));
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