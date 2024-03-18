"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Connect } from "@stacks/connect-react";
import { userSession } from "@/components/connect-wallet";

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "Froggy Auctions",
          icon: window.location.origin + "/logo.png",
        },
        redirectTo: "/",
        onFinish: () => {
          router.refresh();
        },
        userSession,
      }}
    >
      {children}
    </Connect>
  );
};
