"use client";

import { useConnect } from "@stacks/connect-react";
import { useUserSession } from "@/app/context";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { cn } from "@/lib/utils/cn";
import { copyToClipboard } from "@/lib/utils/misc";

export const ConnectWallet = ({ className, ...rest }: { className?: string }) => {
  const isClient = useIsClient();
  const { userSession, setUserSession, userData } = useUserSession();
  const { userAddress, shortUserAddress } = userData;
  const { doOpenAuth } = useConnect();

  return (
    <Container className={cn("flex p-4 space-x-2", className)} {...rest}>
      {isClient && userAddress ? (
        <div className="flex px-2 space-x-4">
          <Button className="rounded-full max-sm:px-2 px-4" onClick={() => copyToClipboard(userAddress)}>
            {shortUserAddress}
          </Button>
          <Button
            className="max-sm:px-2"
            onClick={() => {
              userSession?.signUserOut();
              setUserSession(undefined);
            }}
          >
            Disconnect
          </Button>
        </div>
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
