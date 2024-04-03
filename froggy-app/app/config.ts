import { StacksMainnet, StacksDevnet, createApiKeyMiddleware, createFetchFn } from "@stacks/network";
import { Configuration, SmartContractsApi, TransactionsApi } from "@stacks/blockchain-api-client";

export type AppNetwork = "mainnet" | "devnet";

export const APP_NETWORK = `${process.env.NEXT_PUBLIC_APP_NETWORK}` as AppNetwork;
export const APP_URL = `${process.env.NEXT_PUBLIC_APP_URL}`;
const HIRO_API_KEY = `${process.env.NEXT_PUBLIC_HIRO_API_KEY}`;

export const FROGGY_AGENT_KEY = `${process.env.FROGGY_AGENT_KEY}`;
export const CRON_SECRET = `${process.env.CRON_SECRET}`;
export const CHAINHOOK_AUTH_KEY = `${process.env.CHAINHOOK_AUTH_KEY}`;

if (!FROGGY_AGENT_KEY || !CRON_SECRET || !HIRO_API_KEY || !APP_URL || !APP_NETWORK || !CHAINHOOK_AUTH_KEY) {
  throw new Error("Missing ENV variable");
}

export const FROGGY_AGENT_ADDRESS =
  APP_NETWORK === "mainnet" ? "SP246BNY0D1H2J2WMXMXEZVHH5J8CBG10XA17YEMD" : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const FROGGY_CONTRACT_ADDRESS =
  APP_NETWORK === "mainnet" ? "SP2TSQ43NAY93HQQT0EQK9PFTWFQMPS2V4D141R15" : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const FROGGY_CONTRACT_ID = `${FROGGY_CONTRACT_ADDRESS}.froggys`;
export const FROGGY_AUCTIONS_CONTRACT_ADDRESS =
  APP_NETWORK === "mainnet" ? "SP25661F2PHYBS56DF2KKEWDQSA53ABNFW8GKQTTC" : "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const SORDINALS_CONTRACT_ADDRESS = "SP1ZKR93HX7QC5VNE4H64QHX92XCCDPHMB803FKWC";

export const FROGGYS_PARENT_HASH = "3388f08d493392bcd5b63aa6f1152c29fa11ab28dd1e730cba6b3c16415c00e2";
export const TRANSFER_PREFIX = "0x74";

const apiMiddleware = createApiKeyMiddleware({ apiKey: HIRO_API_KEY });
const apiFetchFn = createFetchFn(apiMiddleware);
export const apiConfig: Configuration = new Configuration({
  apiKey: HIRO_API_KEY,
});

export const network =
  APP_NETWORK === "mainnet" ? new StacksMainnet({ fetchFn: apiFetchFn }) : new StacksDevnet({ fetchFn: apiFetchFn });

// initiate a transactionInterface
export const transactionsApi = new TransactionsApi(apiConfig);
export const smartContractsApi = new SmartContractsApi(apiConfig);
