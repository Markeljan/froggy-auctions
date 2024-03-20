"use client";

import { useState } from "react";
import { useUserSession } from "@/app/context";
import { fetchHop } from "@/lib/api/fetch-hop";
import { fetchHopBack } from "@/lib/api/fetch-hop-back";

export const Hop = () => {
  const { userData } = useUserSession();
  const [tokenId, setTokenId] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [sordTxId, setSordTxId] = useState<string>("");
  const [hopTxId, setHopTxId] = useState<string>("");

  const handleHop = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await fetchHop({ tokenId: parseInt(tokenId), recipientAddress: recipientAddress });
    console.log("Hop result:", result);
    setHopTxId(result.txid);
  };

  const handleHopBack = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await fetchHopBack({ tokenId: parseInt(tokenId), recipientAddress: recipientAddress });
    console.log("hopBack result:", result);
    setSordTxId(result.sordTxId);
    setHopTxId(result.txid);
  };

  return (
    <div>
      <form className="flex flex-col gap-y-4">
        <div className="flex gap-x-2">
          <label htmlFor="tokenId" className="w-1/3">
            Token ID
          </label>
          <input
            type="text"
            id="tokenId"
            name="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="border-2 flex-grow"
          />
        </div>

        <div className="flex gap-x-2">
          <label htmlFor="recipientAddress" className="w-1/3">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipientAddress"
            name="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="border-2 flex-grow"
          />
        </div>

        <div className="flex gap-x-2 justify-center">
          <button onClick={handleHop} className="border-2 px-4 py-1">
            Hop
          </button>
          <button onClick={handleHopBack} className="border-2 px-4 py-1">
            Hop Back
          </button>
        </div>
      </form>
      <div className="flex gap-x-2">
        {sordTxId && <p>sordTxId: {sordTxId}</p>}
        {hopTxId && <p>hopTxId: {hopTxId}</p>}
      </div>
    </div>
  );
};
