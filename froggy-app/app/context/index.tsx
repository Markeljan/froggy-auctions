"use client";

import { shortenAddress } from "@/lib/utils/misc";
import { AppConfig, Connect, UserSession, getUserSession } from "@stacks/connect-react";
import { createContext, useState, useContext, useMemo } from "react";
import { APP_URL } from "../config";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const newUserSession = new UserSession({ appConfig });

type UserSessionContextType = {
  userSession: UserSession | undefined;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | undefined>>;
  userData: {
    userAddress: string | undefined;
    shortUserAddress: string | undefined;
    isSignedIn: boolean;
  };
};

const UserSessionContext = createContext<UserSessionContextType>({
  userSession: newUserSession,
  setUserSession: () => {},
  userData: {
    userAddress: undefined,
    shortUserAddress: undefined,
    isSignedIn: false,
  },
});

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [userSession, setUserSession] = useState<UserSession | undefined>(getUserSession(newUserSession));
  const [isSignedIn, setIsSignedIn] = useState(userSession?.isUserSignedIn() || false);

  const [userAddress, shortUserAddress] = useMemo(() => {
    if (isSignedIn) {
      const address = userSession?.loadUserData()?.profile?.stxAddress?.testnet || "";
      return [address, shortenAddress(address)];
    }
    return [undefined, undefined];
  }, [isSignedIn, userSession]);

  return (
    <Connect
      authOptions={{
        appDetails: {
          name: "Froggy Auctions",
          icon: `${APP_URL}/frogs/4546.png`,
        },
        onFinish: ({ userSession: payloadUserSession }) => {
          setUserSession(payloadUserSession);
          setIsSignedIn(payloadUserSession?.isUserSignedIn());
        },
        userSession,
      }}
    >
      <UserSessionContext.Provider
        value={{
          userSession,
          setUserSession,
          userData: {
            userAddress,
            shortUserAddress,
            isSignedIn: isSignedIn || false,
          },
        }}
      >
        {children}
      </UserSessionContext.Provider>
    </Connect>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
}
