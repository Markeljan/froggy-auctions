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

export type FroggyHop = {
  txid: string;
  sender: string;
  recipient: string;
  memo: string;
  inscriptionId: number;
  txStatus: string;
  hopStatus: "pending" | "completed" | "failed";
};
