import { StacksDevnet } from "@stacks/network";
import { Configuration } from "@stacks/blockchain-api-client";

export const network = new StacksDevnet();
export const FROGGY_AGENT_ADDRESS_MAINNET = "SP246BNY0D1H2J2WMXMXEZVHH5J8CBG10XA17YEMD";
export const FROGGY_AGENT_ADDRESS_TESTNET = "ST246BNY0D1H2J2WMXMXEZVHH5J8CBG10X9P2C6N3";
export const FROGGY_AGENT_ADDRESS_DEVNET = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const FROGGY_CONTRACT_ADDRESS_DEVNET = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const FROGGY_AUCTIONS_CONTRACT_ADDRESS_DEVNET = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

export const APP_URL = `${process.env.NEXT_PUBLIC_APP_URL}`;
const HIRO_API_KEY = `${process.env.NEXT_PUBLIC_HIRO_API_KEY}`;

export const apiConfig: Configuration = new Configuration({
  fetchApi: (req: Request, config) =>
    fetch(req, { ...config, headers: { ...config?.headers, "x-hiro-api-key": HIRO_API_KEY } }),
  // for mainnet, replace `testnet` with `mainnet`
  basePath: "http://localhost:3999",
});
