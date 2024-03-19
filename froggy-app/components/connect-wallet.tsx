"use client";

import toast from "react-hot-toast";
import { useConnect } from "@stacks/connect-react";
import { useUserSession } from "@/app/providers";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { cn } from "@/lib/utils/cn";

export const ConnectWallet = ({ className, ...rest }: { className?: string }) => {
  const isClient = useIsClient();
  const { userSession, setUserSession, userData } = useUserSession();
  const { isSignedIn, userAddress, shortUserAddress } = userData;
  const { doOpenAuth } = useConnect();

  function handleClickCopyToClipboard() {
    if (!userAddress) return;
    navigator.clipboard.writeText(userAddress);
    toast("Copied to clipboard", { icon: "📋" });
  }

  return (
    <Container className={cn("flex p-4 space-x-2", className)} {...rest}>
      {isClient && isSignedIn ? (
        <>
          <Button classname="rounded-full px-4" onClick={handleClickCopyToClipboard}>
            {shortUserAddress}
          </Button>
          <Button
            onClick={() => {
              userSession?.signUserOut();
              setUserSession(undefined);
            }}
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          onClick={() => {
            doOpenAuth(false);
          }}
        >
          Connect Wallet
        </Button>
      )}
    </Container>
  );
};
