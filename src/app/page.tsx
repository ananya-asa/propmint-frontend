'use client';

import { GrazProvider, useAccount, useConnect, useDisconnect, useCosmWasmClient } from 'graz';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ChainInfo } from "@keplr-wallet/types";
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

// Your PropMint Token Contract Address on Andromeda Testnet
const CW20_CONTRACT_ADDRESS = "andr1rmca39jx8dnqh2j26fachgkhzvh2c6r6lmppsj9a2a35p89e2jussakzfw";

// The stable Andromeda Testnet configuration
const andromedaTestnet: ChainInfo = {
    chainId: "galileo-3",
    chainName: "Andromeda Testnet",
    rpc: "https://andromeda-testnet-rpc.polkachu.com/",
    rest: "https://andromeda-testnet-rest.polkachu.com/",
    bip44: { coinType: 118 },
    bech32Config: {
        bech32PrefixAccAddr: "andr",
        bech32PrefixAccPub: "andrpub",
        bech32PrefixValAddr: "andrvaloper",
        bech32PrefixValPub: "andrvaloperpub",
        bech32PrefixConsAddr: "andrvalcons",
        bech32PrefixConsPub: "andrvalconspub",
    },
    currencies: [{ coinDenom: "ANDR", coinMinimalDenom: "uandr", coinDecimals: 6 }],
    feeCurrencies: [{ coinDenom: "ANDR", coinMinimalDenom: "uandr", coinDecimals: 6 }],
    stakeCurrency: { coinDenom: "ANDR", coinMinimalDenom: "uandr", coinDecimals: 6 },
};

function WalletConnect() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: account, isConnected } = useAccount({ chainId: "galileo-3" });
  const [balance, setBalance] = useState<string | null>(null);
  const { data: client } = useCosmWasmClient();

  useEffect(() => {
    const fetchBalance = async () => {
      // Reset balance on disconnect
      if (!isConnected) {
        setBalance(null);
        return;
      }

      if (client && account?.bech32Address) {
        try {
          const result = await client.queryContractSmart(CW20_CONTRACT_ADDRESS, {
            balance: { address: account.bech32Address },
          });
          const formattedBalance = (Number(result.balance) / 1_000_000).toLocaleString();
          setBalance(formattedBalance);
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance("Error fetching balance");
        }
      }
    };
    fetchBalance();
  }, [client, account, isConnected]);

  const handleConnect = async () => {
    try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(window as any).keplr) {
  return alert("Please install the Keplr wallet extension.");
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
await (window as any).keplr.experimentalSuggestChain(andromedaTestnet);
      connect({ chainId: "galileo-3" });
    } catch (error) {
      alert(`Error connecting wallet: ${(error as Error).message}`);
    }
  };

  if (isConnected) {
    return (
      <div>
        <p>Connected Address: {account?.bech32Address}</p>
        {balance !== null && <p><strong>Your PMT Balance: {balance}</strong></p>}
        <button onClick={() => disconnect()}>Disconnect Wallet</button>
      </div>
    );
  }

  return <button onClick={handleConnect}>Connect Keplr Wallet</button>;
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{ chains: [andromedaTestnet] }}>
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <h1>Welcome to PropMint AI</h1>
          <p>Please connect your wallet to continue.</p>
          <WalletConnect />
        </main>
      </GrazProvider>
    </QueryClientProvider>
  );
}