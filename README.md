# Froggy Auctions

Froggy Auctions showcases a way to interpoerate between the sOrdinals metaprotocol and Stacks native SIP-009 NFTs. 

## How it Works

Froggy Auctions operates through a simple process:

1. **HOP**: Vault your Froggy inscription to a trusted principal.
2. SIP-009 Froggy is minted or unvaulted and sent to you.
3. **HOP BACK**: Vault your SIP-009 Froggy and recover your inscription.

## Code Overview

### Frontend / Backend

The frontend/backend built with Next.js / React.  Backend API routes are used to manage chainhook events, execute hopping and hopping back, and vaulting / unvaulting.

### Clarity Contracts

Froggy Clarity smart contract. There are two main functions:

- **hop**: This function is responsible for vaulting Froggy inscriptions and minting SIP-009 Froggies to the recipient.
- **hop-back**: Used to vault SIP-009 Froggies and recover the inscription.

### Chainhook

A chainhook is employed to track STX transfers with memos. These are stored in a database which is then subscribed to by the frontend to display real-time froggy transactions.

## Usage

Currently the project is available for local development running a devnt with Clarinet.
