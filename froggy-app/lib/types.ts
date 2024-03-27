export type FroggyHopTransaction = {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  post_conditions: [];
  anchor_mode: string;
  is_unanchored: boolean;
  block_hash: string;
  parent_block_hash: string;
  block_height: number;
  burn_block_time: number;
  burn_block_time_iso: string;
  parent_burn_block_time: number;
  parent_burn_block_time_iso: string;
  canonical: boolean;
  tx_index: number;
  tx_status: string;
  tx_result: {
    hex: string;
    repr: string;
  };
  microblock_hash: string;
  microblock_sequence: number;
  microblock_canonical: boolean;
  event_count: number;
  events: {
    event_index: number;
    event_type: string;
    tx_id: string;
    asset: {
      asset_event_type: string;
      sender: string;
      recipient: string;
      amount: string;
      memo: string;
    };
  }[];
  execution_cost_read_count: number;
  execution_cost_read_length: number;
  execution_cost_runtime: number;
  execution_cost_write_count: number;
  execution_cost_write_length: number;
  tx_type: string;
  token_transfer: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
};

export type FroggyHopContractCall = {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  post_conditions: {
    type: string;
    condition_code: string;
    amount: string;
    principal: { type_id: string; address: string };
  }[];
  anchor_mode: string;
  tx_status: string;
  receipt_time: number;
  receipt_time_iso: string;
  tx_type: string;
  contract_call: {
    contract_id: string;
    function_name: string;
    function_signature: string;
    function_args: {
      hex: string;
      repr: string;
      name: string;
      type: string;
    }[];
  };
};

export enum TxStatus {
  PENDING = "pending",
  SUCCESS = "success",
  INVALID = "invalid",
  FAILED = "failed",
}

export enum HopStatus {
  NONE = "none",
  HOPPING = "hopping",
  HOPPING_BACK = "hopping-back",
  HOPPED = "hopped",
}

export type FroggyHop = {
  txId: string;
  sender: string;
  recipient: string;
  memo: string;
  tokenId: number;
  inscriptionId: number;
  txStatus: TxStatus;
  hopStatus: HopStatus;
};

export type SordinalsFroggyData = {
  id: string;
  type: string;
  inscriptionHash: string;
  minter: string;
  owner: string;
  createdTxId: string;
  createdBlockHash: string;
  createdBlockHeight: string;
  txTime: string;
  parentHash: string;
  metadata: null;
  chainContentType: string;
  chainContentEncoding: string;
  contentType: string;
  contentEncoding: string;
  txFee: string;
  creationTime: string;
  updateTime: string;
  fileName: string;
  fileSize: string;
  externalData: { type: string };
  isNsfw: boolean;
  fileUrl: string;
};
