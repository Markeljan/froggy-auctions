import { StacksDevnet } from "@stacks/network";
import { Configuration } from "@stacks/blockchain-api-client";
export const network = new StacksDevnet();
export const FROGGY_AGENT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const FROGGY_CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const FROGGY_AUCTIONS_CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

const HIRO_API_KEY = `${process.env.NEXT_PUBLIC_HIRO_API_KEY}`;

export const apiConfig: Configuration = new Configuration({
  fetchApi: (req: Request, config) =>
    fetch(req, { ...config, headers: { ...config?.headers, "x-hiro-api-key": HIRO_API_KEY } }),
  // for mainnet, replace `testnet` with `mainnet`
  basePath: "http://localhost:3999",
});
