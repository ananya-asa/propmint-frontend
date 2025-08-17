# PropMint AI 🚀

A full-stack decentralized application for fractional real estate investment, built on the Andromeda Protocol. This project demonstrates the tokenization, trading, and staking of real-world assets on the Cosmos blockchain using a modern web interface.

---

## ▶️ Live Demo & Video Walkthrough

* **Live Deployed Application:** **[propmint-ai.netlify.app](https://propmint-ai.netlify.app/)**
* **Full Video Demonstration:** **[Watch the Video Demo on YouTube](https://youtu.be/NS4Pj5jwsU8?si=GqhtM7tl6t724FKy)**

---

## ✨ Features

* **Secure Wallet Integration:** Seamlessly connect and authenticate using a Keplr browser wallet with automatic chain-suggestion support.
* **Complete Portfolio Dashboard:** View real-time balances of native (`ANDR`) and fractional property (`PMT`) tokens, along with staked amounts and rewards.
* **Full Asset Lifecycle:** Buy, Sell, Stake, and Unstake property tokens through direct interaction with the deployed smart contracts.
* **Live NFT Metadata:** Fetches and displays details and images for the underlying real estate asset from its CW721 NFT.
* **Robust User Experience:** Features loading states for all actions, clear status notifications, and a modal-based confirmation system for transactions.
* **Transaction History:** Provides a clear history of recent operations with direct links to the block explorer for verification.

---

## 🛠️ Tech Stack

| Category         | Technology                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend** | **React**, **Next.js**, **TypeScript**, Custom CSS                                                          |
| **Blockchain** | **Andromeda Protocol**, **CosmJS**, CosmWasm                                                                |
| **Wallet** | Keplr Extension Integration                                                                                 |
| **Deployment** | Netlify / Vercel                                                                                            |
| **Backend** | [Andromeda App Builder](https://app.andromedaprotocol.io/) (No-Code Smart Contract Deployment)                  |

---

## 🚀 Getting Started Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ananya-asa/propmint-frontend.git](https://github.com/ananya-asa/propmint-frontend.git)
    cd propmint-frontend
    ```
2.  **Install dependencies** (`pnpm` is recommended):
    ```bash
    pnpm install
    ```
3.  **Run the development server:**
    ```bash
    pnpm run dev
    ```
4.  Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📜 Deployed Smart Contracts (Andromeda Testnet `galileo-4`)

| Contract               | Address                                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **CW20 (PMT Token)** | [`andr1rmc...akzfw`](https://app.testnet.andromedaprotocol.io/assets/view/andr1rmca39jx8dnqh2j26fachgkhzvh2c6r6lmppsj9a2a35p89e2jussakzfw) |
| **CW20 Exchange** | [`andr1qh9...ph5rnq`](https://app.testnet.andromedaprotocol.io/assets/view/andr1qh9jq0jk835gguu0x4cqxk20pe7z8jcwqerfljjuf5ly99gkeazsph5rnq) |
| **CW20 Staking** | [`andr1gk2...aqm43e`](https://app.testnet.andromedaprotocol.io/assets/view/andr1gk2zfc5xunhs9980ul8vs3xtlcf787yf3ra6ntv4ac8w2rrj06vsaqm43e) |
| **CW721 (Property NFT)** | [`andr1mgl...35dfj9`](https://app.testnet.andromedaprotocol.io/assets/view/andr1mglayf6ncyvawz5x8n0nnv3z7nwv5gw9gs5anzww4tgcckjsg78s35dfj9) |
| **Main App Contract** | [`andr1t6z...jaz4mq`](https://app.testnet.andromedaprotocol.io/assets/view/andr1t6zcfvnr7vwp2dyecgentu649jcaqh6rscp0088275vjr6hygcqsjaz4mq) |
---

## 📝 License

This project is licensed under the MIT License.

---
© 2025 Ananya ASA | PropMint AI