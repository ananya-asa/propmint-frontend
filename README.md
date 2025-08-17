PropMint AI
Fractional Real Estate dApp on Andromeda Protocol | Cosmos Blockchain | Next.js | TypeScript

🚀 Demo
Watch the Demo Video
https://youtu.be/NS4Pj5jwsU8?si=GqhtM7tl6t724FKy

🏠 Overview
PropMint AI is a decentralized application for fractionalizing, trading, and staking tokenized real estate, built on the Andromeda Protocol’s Galileo-4 testnet.
Users connect their Cosmos-based Keplr wallet and securely buy, sell, or stake property tokens.

🌟 Features
Connect Keplr Wallet: Secure login via browser extension.

View Portfolio: Native and fractional token balances, staked amounts, live NFT property details.

Buy/Sell/Stake/Unstake Tokens: Transact PMT (property tokens) using ANDR testnet coins.

Transaction History: View recent blockchain operations with explorer links.

Modal-based Confirmations: Accessible, attractive interactions for all wallet actions.

Responsive Design: Beautiful UI on desktop and mobile.


💻 Tech Stack
Frontend: Next.js (App Router), React, TypeScript, CSS

Blockchain: Andromeda Protocol, CosmJS, CosmWasm smart contracts

Wallet: Keplr Extension

Explorer: Andromeda Testnet Explorer

Deployment: Vercel (or Netlify/Render)


✨ Live Site
Visit Deployed App
https://propmint-ai.netlify.app/

⚡️ Quick Start
Install Dependencies

bash
pnpm install
# or
yarn install
# or
npm install
Run Locally

bash
pnpm run dev
# or
yarn dev
# or
npm run dev
Build for Production

bash
pnpm run build
# (ESLint is ignored during build for demo purposes; see package.json)
Deploy

Push to your GitHub repo connected to Vercel, Netlify, or Render.

🔑 Environment Setup
No secrets required for testnet.
Add any contract address changes in the following constants in /src/app/page.tsx:

ts
const RPC_URL = "https://api.andromedaprotocol.io/rpc/testnet";
const CHAIN_ID = "galileo-4";
const DENOM = "uandr";
const DISPLAY_DENOM = "ANDR";
// ...other contract addresses

🎨 Styling
Custom CSS theme inspired by gradients and glassmorphism.
See /src/app/app.css for style details.

🦾 How It Works
Fetches property NFT data via CosmWasm client.

Handles all PMT token and staking operations via smart contracts.

All user actions routed as blockchain transactions (see explorer links).

🛠️ Project Structure
text
src/
  app/page.tsx   # Main app component
  app/app.css    # Global/container styles
public/          # Default images, favicon
package.json     # Scripts and dependencies

📝 Known Issues
Lint warnings for <img> elements due to Next.js recommendation.

Some strict TypeScript rules disabled for deployment (see package.json).

Testnet only; real asset tokens not supported.



💡 Contributing / Questions
If you have questions or want to contribute, feel free to open an issue or contact your email/Discord.

© 2025 Ananya / PropMint AI
