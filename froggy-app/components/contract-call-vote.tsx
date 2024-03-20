"use client";

import { useConnect } from "@stacks/connect-react";
import { StacksTestnet, StacksDevnet } from "@stacks/network";
import { AnchorMode, PostConditionMode, stringUtf8CV } from "@stacks/transactions";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { useUserSession } from "@/app/context";

export const ContractCallVote = () => {
  const { userSession } = useUserSession();
  const { doContractCall } = useConnect();
  const isClient = useIsClient();

  function vote(pick: string) {
    doContractCall({
      network: new StacksDevnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "ST39MJ145BR6S8C315AG2BD61SJ16E208P1FDK3AK",
      contractName: "example-fruit-vote-contract",
      functionName: "vote",
      functionArgs: [stringUtf8CV(pick)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: (data) => {
        window.open(`https://explorer.hiro.so/txid/${data.txId}?chain=testnet`, "_blank")?.focus();
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled");
      },
    });
  }

  if (!isClient || !userSession?.isUserSignedIn()) {
    return null;
  }

  return (
    <div className="Container">
      <h3>Vote via Smart Contract</h3>
      <button className="Vote" onClick={() => vote("🍊")}>
        Vote for 🍊
      </button>
      <button className="Vote" onClick={() => vote("🍎")}>
        Vote for 🍎
      </button>
    </div>
  );
};
