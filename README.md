# Froggy Auctions

[froggy-auctions.xyz](https://stacks.gamma.io/collections/froggys) showcases a way to interpoerate between the sOrdinals metaprotocol and Stacks native SIP-9 NFTs.

<img width="1726" alt="image" src="https://github.com/Markeljan/froggy-auctions/assets/12901349/6ee2a9be-e49a-4fac-9757-68685dd7245e">

## How it Works

Froggy Auctions operates through a simple process:

1. **HOP**: Vault your Froggy inscription to a trusted principal.
2. SIP-9 Froggy is minted or unvaulted and sent to you.
3. **HOP BACK**: Vault your SIP-9 Froggy and recover your inscription.

## Code Overview

### Frontend / Backend

The frontend/backend built with Next.js / React.  Backend API routes are used to manage chainhook events, execute hopping and hopping back, and vaulting / unvaulting.

### Clarity Contracts

Froggy Clarity smart contract. There are two main functions:

- **hop**: This function is responsible for vaulting Froggy inscriptions and minting SIP-9 Froggies to the recipient.
- **hop-back**: Used to vault SIP-9 Froggies and recover the inscription.

#### Clarinet Testing

![image](https://github.com/Markeljan/froggy-auctions/assets/12901349/efc8aa3f-de42-45b5-91cd-b6f8b28b4589)


### Chainhook

A chainhook is used to track STX transfers with memos. After hitting our serverless API each valid event is saved to our database which is then subscribed to from our frontend to display real-time froggy transactions to any site vistors via toasts.

## Usage

Try it out live on Stacks Mainnet at https://froggy-auctions.xyz

## SIP-9 Wrapped Froggys on Gamma

[Gamma Collection](https://stacks.gamma.io/collections/froggys)

![image](https://github.com/Markeljan/froggy-auctions/assets/12901349/bdfd7932-94a2-4375-8f5d-b1ee32713e65)

