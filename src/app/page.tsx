"use client";

import React, { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { StargateClient } from "@cosmjs/stargate";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StdFee } from "@cosmjs/amino";
import ReactModal from "react-modal";

const queryClient = new QueryClient();
const RPC_URL = "https://api.andromedaprotocol.io/rpc/testnet";
const CHAIN_ID = "galileo-4";
const DENOM = "uandr";
const DISPLAY_DENOM = "ANDR";
const PROPMINT_MAIN_CONTRACT = "andr1t6zcfvnr7vwp2dyecgentu649jcaqh6rscp0088275vjr6hygcqsjaz4mq";
const CW721_PROPERTY_CONTRACT = "andr1mglayf6ncyvawz5x8n0nnv3z7nwv5gw9gs5anzww4tgcckjsg78s35dfj9";
const CW20_FRACTIONAL_TOKEN = "andr1rmca39jx8dnqh2j26fachgkhzvh2c6r6lmppsj9a2a35p89e2jussakzfw";
const CW20_EXCHANGE_CONTRACT = "andr1qh9jq0jk835gguu0x4cqxk20pe7z8jcwqerfljjuf5ly99gkeazsph5rnq";
const CW20_STAKING_CONTRACT = "andr1gk2zfc5xunhs9980ul8vs3xtlcf787yf3ra6ntv4ac8w2rrj06vsaqm43e";
const TOKEN_ID = "VILLA123";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [nativeBalance, setNativeBalance] = useState<number>(0);
  const [fractionalBalance, setFractionalBalance] = useState<number>(0);
  const [stakedBalance, setStakedBalance] = useState<number>(0);
  const [stakingRewards, setStakingRewards] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<(() => Promise<void>) | undefined>(undefined);

  const [loading, setLoading] = useState({
    purchase: false,
    stake: false,
    unstake: false,
    sell: false,
    cancel: false,
  });

  const [purchaseAmount, setPurchaseAmount] = useState<string>("1");
  const [stakeAmount, setStakeAmount] = useState<string>("1");
  const [unstakeAmount, setUnstakeAmount] = useState<string>("1");
  const [sellAmount, setSellAmount] = useState<string>("1");
  const [txHistory, setTxHistory] = useState<any[]>([]);
  const [nftInfo, setNftInfo] = useState<any>(null);
  const [propertyImage, setPropertyImage] = useState<string>("/default-property.png");
  const [maxPurchasable, setMaxPurchasable] = useState<number>(0);

  const cwClient = useRef<CosmWasmClient | null>(null);

  const showStatus = (msg: string, type: "success" | "error" | "info" = "info") => {
    setStatus(msg);
    setStatusType(type);
    setTimeout(() => setStatus(""), 6000);
  };

  const openModal = (message: string, action: () => Promise<void>) => {
    setModalMessage(message);
    setModalAction(() => action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMessage("");
    setModalAction(undefined);
  };

  useEffect(() => {
    (async () => {
      try {
        cwClient.current = await CosmWasmClient.connect(RPC_URL);
        const nft = await cwClient.current.queryContractSmart(
          CW721_PROPERTY_CONTRACT,
          { nft_info: { token_id: TOKEN_ID } }
        );
        let imageUrl = "/default-property.png";
        if (nft.token_uri) {
          try {
            const res = await fetch(nft.token_uri);
            const meta = await res.json();
            if (meta.image) imageUrl = meta.image;
          } catch {}
        }
        setNftInfo(nft);
        setPropertyImage(imageUrl);
      } catch (err) {
        console.error("NFT fetch error:", err);
        setPropertyImage("/default-property.png");
      }
    })();
  }, []);

  const fetchBalances = async () => {
    if (!walletAddress) return;
    try {
      const stg = await StargateClient.connect(RPC_URL);
      const bals = await stg.getAllBalances(walletAddress);
      const native = bals.find((b) => b.denom === DENOM);
      setNativeBalance(native ? Number(native.amount) / 1_000_000 : 0);

      const client = cwClient.current!;
      const [fQ, staker] = await Promise.all([
        client.queryContractSmart(CW20_FRACTIONAL_TOKEN, {
          balance: { address: walletAddress }
        }),
        client.queryContractSmart(CW20_STAKING_CONTRACT, {
          staker: { address: walletAddress }
        })
      ]);

      const fractional = Number(fQ.balance) / 1_000_000;
      setFractionalBalance(fractional);
      setStakedBalance(Number(staker.share) / 1_000_000);

      const rewardEntry = staker.pending_rewards.find(
        ([asset]: [string, string]) => asset === `cw20:${CW20_FRACTIONAL_TOKEN}`
      ) || [null, "0"];
      setStakingRewards(Number(rewardEntry[1]) / 1_000_000);

      const exchangeRate = 1_000_000;
      const maxBuy = Math.floor((native ? Number(native.amount) : 0) / exchangeRate);
      setMaxPurchasable(maxBuy);
    } catch (error) {
      console.error("Failed to fetch balances", error);
      showStatus("⚠️ Failed to fetch balances from network", "error");
    }
  };

  useEffect(() => {
    if (walletAddress) fetchBalances();
  }, [walletAddress]);

  const connectWallet = async () => {
    try {
      if (typeof window === "undefined" || !window.keplr) {
        showStatus("🔒 Please install Keplr wallet extension first!", "error");
        return;
      }
      await window.keplr.experimentalSuggestChain({
        chainId: CHAIN_ID,
        chainName: "Andromeda Testnet",
        rpc: RPC_URL,
        rest: "https://api.andromedaprotocol.io/api/testnet",
        bip44: { coinType: 118 },
        bech32Config: {
          bech32PrefixAccAddr: "andr",
          bech32PrefixAccPub: "andrpub",
          bech32PrefixValAddr: "andrvaloper",
          bech32PrefixValPub: "andrvaloperpub",
          bech32PrefixConsAddr: "andrvalcons",
          bech32PrefixConsPub: "andrvalconspub"
        },
        currencies: [
          { coinDenom: DISPLAY_DENOM, coinMinimalDenom: DENOM, coinDecimals: 6 }
        ],
        feeCurrencies: [
          {
            coinDenom: DISPLAY_DENOM,
            coinMinimalDenom: DENOM,
            coinDecimals: 6,
            gasPriceStep: { low: 0.025, average: 0.03, high: 0.04 }
          }
        ],
        stakeCurrency: { coinDenom: DISPLAY_DENOM, coinMinimalDenom: DENOM, coinDecimals: 6 }
      });
      await window.keplr.enable(CHAIN_ID);
      if (!window.getOfflineSigner) {
        showStatus("❌ Keplr is missing getOfflineSigner", "error");
        return;
      }
      const offlineSigner: OfflineSigner = window.getOfflineSigner(CHAIN_ID);
      const accounts = await offlineSigner.getAccounts();
      setWalletAddress(accounts[0].address);
      showStatus("🎉 Wallet connected successfully!", "success");
    } catch (error) {
      console.error(error);
      showStatus("❌ Failed to connect wallet. Please try again.", "error");
    }
  };

  const executeCw20 = async (
    contract: string,
    amount: string,
    innerMsg: object,
    fee: StdFee,
    label: string
  ) => {
    if (typeof window === "undefined" || !window.getOfflineSigner) {
      showStatus("Keplr wallet required.", "error");
      throw new Error("Keplr wallet required.");
    }
    const offlineSigner = window.getOfflineSigner(CHAIN_ID);
    const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner);
    const amountMicro = Math.floor(Number(amount) * 1_000_000);
    const encoded = btoa(JSON.stringify(innerMsg));
    const executeMsg = {
      send: {
        contract,
        amount: amountMicro.toString(),
        msg: encoded
      }
    };
    return client.execute(walletAddress, CW20_FRACTIONAL_TOKEN, executeMsg, fee, label);
  };

  const confirmAndProceed = (message: string, action: () => Promise<void>) => {
    openModal(message, async () => {
      closeModal();
      await action();
    });
  };

  const purchaseFractionalTokens = async () => {
    const amount = Number(purchaseAmount);
    if (!walletAddress) {
      showStatus("Connect your wallet first", "error");
      return;
    }
    if (!amount || amount <= 0) {
      showStatus("Enter valid purchase amount", "error");
      return;
    }
    if (nativeBalance <= 0) {
      showStatus("Get testnet tokens from the faucet first", "error");
      return;
    }
    if (amount > maxPurchasable) {
      showStatus(`You can only purchase up to ${maxPurchasable} PMT with your ANDR balance`, "error");
      return;
    }
    confirmAndProceed(`Confirm purchase of ${amount} PMT tokens?`, async () => {
      try {
        setLoading(l => ({ ...l, purchase: true }));
        const fee: StdFee = { amount: [{ denom: DENOM, amount: "15000" }], gas: "800000" };
        const exchangeRate = 1_000_000; 
        const totalUANDR = (amount * exchangeRate).toString();
        const executeMsg = { purchase: { recipient: walletAddress } };
        if (typeof window === "undefined" || !window.getOfflineSigner) throw new Error("Keplr required");
        const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, window.getOfflineSigner(CHAIN_ID));
        const result = await client.execute(
          walletAddress,
          CW20_EXCHANGE_CONTRACT,
          executeMsg,
          fee,
          `Buy ${amount} PMT tokens`,
          [{ denom: DENOM, amount: totalUANDR }]
        );
        setTxHistory(prev => [{ action: "Buy", amount: purchaseAmount, tx: result.transactionHash }, ...prev]);
        showStatus(`Purchase successful! TX hash: ${result.transactionHash.substring(0, 16)}...`, "success");
        await fetchBalances();
      } catch (error: any) {
        showStatus(`Purchase failed: ${error.message || "Try again later"}`, "error");
      } finally {
        setLoading(l => ({ ...l, purchase: false }));
      }
    });
  };

  const stakeTokens = async () => {
    if (!walletAddress) {
      showStatus("Connect your wallet first", "error");
      return;
    }
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      showStatus("Enter valid stake amount", "error");
      return;
    }
    if (fractionalBalance < Number(stakeAmount)) {
      showStatus("Insufficient PMT tokens to stake", "error");
      return;
    }
    confirmAndProceed(`Confirm staking of ${stakeAmount} PMT tokens?`, async () => {
      try {
        setLoading(l => ({ ...l, stake: true }));
        showStatus("Staking your tokens...", "info");
        const fee: StdFee = { amount: [{ denom: DENOM, amount: "10000" }], gas: "600000" };
        const result = await executeCw20(
          CW20_STAKING_CONTRACT,
          stakeAmount,
          { stake_tokens: {} },
          fee,
          `Stake ${stakeAmount} PMT tokens`
        );
        setTxHistory(prev => [{ action: "Stake", amount: stakeAmount, tx: result.transactionHash }, ...prev]);
        showStatus(`Staked successfully! TX: ${result.transactionHash.substring(0, 16)}...`, "success");
        await fetchBalances();
      } catch (error: any) {
        showStatus(`Staking failed: ${error.message || "Try again later"}`, "error");
      } finally {
        setLoading(l => ({ ...l, stake: false }));
      }
    });
  };

  const unstakeTokens = async () => {
    const amount = Number(unstakeAmount);
    if (!walletAddress) {
      showStatus("Connect your wallet first", "error");
      return;
    }
    if (!amount || amount <= 0) {
      showStatus("Enter valid unstake amount", "error");
      return;
    }
    if (stakedBalance < amount) {
      showStatus("Insufficient staked PMT tokens to unstake", "error");
      return;
    }
    confirmAndProceed(`Confirm unstaking of ${unstakeAmount} PMT tokens?`, async () => {
      try {
        setLoading(l => ({ ...l, unstake: true }));
        if (typeof window === "undefined" || !window.getOfflineSigner) throw new Error("Keplr required");
        const offlineSigner = window.getOfflineSigner(CHAIN_ID);
        const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner);
        const amountMicro = Math.floor(amount * 1_000_000).toString();
        const fee: StdFee = { amount: [{ denom: DENOM, amount: "10000" }], gas: "600000" };
        const executeMsg = { unstake_tokens: { amount: amountMicro } };
        const result = await client.execute(walletAddress, CW20_STAKING_CONTRACT, executeMsg, fee, `Unstake ${amount} PMT tokens`);
        setTxHistory(prev => [{ action: "Unstake", amount: unstakeAmount, tx: result.transactionHash }, ...prev]);
        showStatus(`Unstaked successfully! TX: ${result.transactionHash.substring(0, 16)}...`, "success");
        await fetchBalances();
      } catch (error: any) {
        showStatus(`Unstaking failed: ${error.message || "Try again later"}`, "error");
      } finally {
        setLoading(l => ({ ...l, unstake: false }));
      }
    });
  };

  const sellTokens = async () => {
    const amount = Number(sellAmount);
    if (!walletAddress) {
      showStatus("Connect wallet first", "error");
      return;
    }
    if (!amount || amount <= 0) {
      showStatus("Enter valid amount", "error");
      return;
    }
    if (fractionalBalance < amount) {
      showStatus("Insufficient PMT tokens", "error");
      return;
    }
    confirmAndProceed(`Confirm listing ${amount} PMT tokens for sale?`, async () => {
      try {
        setLoading(l => ({ ...l, sell: true }));
        const amountMicro = Math.floor(amount * 1e6).toString();
        const hookMsg = {
          start_sale: {
            asset: { native: DENOM },
            exchange_rate: "1000000",
            recipient: walletAddress
          }
        };
        const sendMsg = {
          send: {
            contract: CW20_EXCHANGE_CONTRACT,
            amount: amountMicro,
            msg: btoa(JSON.stringify(hookMsg))
          }
        };
        if (typeof window === "undefined" || !window.getOfflineSigner) throw new Error("Keplr required");
        const offlineSigner = window.getOfflineSigner(CHAIN_ID);
        const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner);
        const fee: StdFee = { amount: [{ denom: DENOM, amount: "10000" }], gas: "600000" };
        const res = await client.execute(walletAddress, CW20_FRACTIONAL_TOKEN, sendMsg, fee, `Start sale of ${amount} PMT`);
        setTxHistory(prev => [{ action: "Start Sale", amount, tx: res.transactionHash }, ...prev]);
        showStatus(`Sale started! TX: ${res.transactionHash.substring(0, 16)}...`, "success");
        await fetchBalances();
      } catch (error: any) {
        showStatus(`Sale failed: ${error.message || "check sale arguments"}`, "error");
      } finally {
        setLoading(l => ({ ...l, sell: false }));
      }
    });
  };

  const cancelSale = async () => {
    if (!walletAddress) {
      showStatus("Connect wallet first", "error");
      return;
    }
    confirmAndProceed(`Confirm canceling active sale?`, async () => {
      try {
        setLoading(l => ({ ...l, cancel: true }));
        const cancelMsg = { cancel_sale: { asset: { native: DENOM } } };
        if (typeof window === "undefined" || !window.getOfflineSigner) throw new Error("Keplr required");
        const offlineSigner = window.getOfflineSigner(CHAIN_ID);
        const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner);
        const fee: StdFee = { amount: [{ denom: DENOM, amount: "10000" }], gas: "600000" };
        const res = await client.execute(walletAddress, CW20_EXCHANGE_CONTRACT, cancelMsg, fee, "Cancel sale");
        setTxHistory(prev => [{ action: "Cancel Sale", amount: "-", tx: res.transactionHash }, ...prev]);
        showStatus(`Sale cancelled! TX: ${res.transactionHash.substring(0, 16)}…`, "success");
        await fetchBalances();
      } catch (error: any) {
        showStatus(`Cancel failed: ${error.message || "check contract"}`, "error");
      } finally {
        setLoading(l => ({ ...l, cancel: false }));
      }
    });
  };

  const disconnectWallet = () => {
    setWalletAddress("");
    setNativeBalance(0);
    setFractionalBalance(0);
    setStakedBalance(0);
    setStakingRewards(0);
    setTxHistory([]);
    showStatus("Wallet disconnected", "info");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="home-container" role="main">
        <h1 className="animated-title">PropMint AI</h1>
        <p className="subtitle">Fractional Real Estate on Andromeda Protocol</p>

        {!walletAddress ? (
          <button className="connect-btn" onClick={connectWallet}>🔗 Connect Keplr Wallet</button>
        ) : (
          <div className="dashboard">
            <div className="wallet-info" aria-live="polite">
              <p><strong>Wallet Address:</strong></p>
              <code className="wallet-address" aria-label="Wallet address">{walletAddress}</code>
            </div>
            <div className="balance-card">
              <div className="balance-title">Your Portfolio</div>
              <div className="balance-details">
                <p><strong>Native Balance:</strong> {nativeBalance.toFixed(4)} {DISPLAY_DENOM}</p>
                <p><strong>Property Tokens (PMT):</strong> {fractionalBalance.toFixed(4)}</p>
                <p><strong>Staked Tokens:</strong> {stakedBalance.toFixed(4)}</p>
                <p><strong>Staking Rewards:</strong> {stakingRewards.toFixed(4)} PMT</p>
                <p style={{ marginTop: "8px", fontSize: "0.9em", color: "#666" }}>Max purchasable with your ANDR: {maxPurchasable} PMT</p>
              </div>
            </div>
            {nftInfo && (
              <div className="property-card">
                <div className="property-title">{nftInfo.extension?.name || "Property NFT"}</div>
                <img src={propertyImage} alt="Property Image" style={{ width: "100%", borderRadius: 16, marginTop: 12 }} onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default-property.png"; }} />
                <div className="property-details">
                  <p>{nftInfo.extension?.description}</p>
                  {nftInfo.extension?.attributes?.map((attr: any) => (
                    <p key={attr.trait_type}><strong>{attr.trait_type}:</strong> {attr.value}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="tx-section">
              <input type="number" min="0.001" step="0.001" placeholder="Amount to purchase" value={purchaseAmount} onChange={e => setPurchaseAmount(e.currentTarget.value)} aria-label="Amount to purchase" />
              <button className="action-btn" onClick={purchaseFractionalTokens} disabled={loading.purchase}>{loading.purchase ? <>Processing...</> : `Buy ${purchaseAmount} PMT`}</button>
            </div>
            <div className="tx-section">
              <input type="number" min="0.001" step="0.001" placeholder="Amount to stake" value={stakeAmount} onChange={e => setStakeAmount(e.currentTarget.value)} aria-label="Amount to stake" />
              <button className="action-btn" onClick={stakeTokens} disabled={loading.stake}>{loading.stake ? <>Processing...</> : `Stake ${stakeAmount} PMT`}</button>
            </div>
            <div className="tx-section">
              <input type="number" min="0.001" step="0.001" placeholder="Amount to unstake" value={unstakeAmount} onChange={e => setUnstakeAmount(e.currentTarget.value)} aria-label="Amount to unstake" />
              <button className="action-btn" onClick={unstakeTokens} disabled={loading.unstake}>{loading.unstake ? <>Processing...</> : `Unstake ${unstakeAmount} PMT`}</button>
            </div>
            <div className="tx-section">
              <input type="number" min="0.001" step="0.001" placeholder="Amount to sell" value={sellAmount} onChange={e => setSellAmount(e.currentTarget.value)} aria-label="Amount to sell" />
              <button className="action-btn" onClick={sellTokens} disabled={loading.sell}>{loading.sell ? <>Processing...</> : `Sell ${sellAmount} PMT`}</button>
              <button className="action-btn" style={{ marginLeft: 8, background: "#ff5555" }} onClick={cancelSale} disabled={loading.cancel}>{loading.cancel ? "Cancelling..." : "Cancel Sale"}</button>
            </div>
            <div className="history-card">
              <div className="balance-title">Transaction History</div>
              <div className="balance-details">
                {txHistory.length > 0 ? (
                  txHistory.map((tx, idx) => (
                    <p key={idx}>
                      <strong>{tx.action}:</strong> {tx.amount} PMT
                      <br />
                      <a
                        href={`https://explorer.testnet.andromedaprotocol.io/galileo-4/tx/${tx.tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.8em", color: "#007aff", textDecoration: "underline" }}
                      >
                        [View TX]
                      </a>
                    </p>
                  ))
                ) : (
                  <p>No transactions yet.</p>
                )}
              </div>
            </div>
            <button className="disconnect-btn" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          </div>
        )}
        {status && (
          <div className={`status ${statusType}`} role="alert" aria-live="assertive" aria-atomic="true">
            {status}
          </div>
        )}
        <ReactModal
          isOpen={modalOpen}
          onRequestClose={closeModal}
          contentLabel="Confirmation Modal"
          className="modal"
          overlayClassName="modal-overlay"
          shouldCloseOnOverlayClick={true}
          ariaHideApp={false}
        >
          <div className="modal-content">
            <p>{modalMessage}</p>
            <div className="modal-actions">
              <button onClick={async () => { if (modalAction) await modalAction(); }} className="confirm-btn">Confirm</button>
              <button onClick={closeModal} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </ReactModal>
      </div>
    </QueryClientProvider>
  );
}
