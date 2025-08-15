'use client';

import { GrazProvider, useAccount, useConnect, useDisconnect, useBalance } from 'graz';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ChainInfo } from "@keplr-wallet/types";

const queryClient = new QueryClient();

const junoTestnet: ChainInfo = {
    chainId: "uni-6",
    chainName: "Juno Testnet",
    rpc: "https://rpc.uni.junonetwork.io",
    rest: "https://rest.uni.junonetwork.io",
    bip44: { coinType: 118 },
    bech32Config: {
        bech32PrefixAccAddr: "juno",
        bech32PrefixAccPub: "junopub",
        bech32PrefixValAddr: "junovaloper",
        bech32PrefixValPub: "junovaloperpub",
        bech32PrefixConsAddr: "junovalcons",
        bech32PrefixConsPub: "junovalconspub",
    },
    currencies: [{ coinDenom: "JUNOX", coinMinimalDenom: "ujunox", coinDecimals: 6 }],
    feeCurrencies: [{ coinDenom: "JUNOX", coinMinimalDenom: "ujunox", coinDecimals: 6 }],
    stakeCurrency: { coinDenom: "JUNOX", coinMinimalDenom: "ujunox", coinDecimals: 6 },
};

function WalletConnect() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: account, isConnected } = useAccount({ chainId: "uni-6" });

  // A simpler hook from graz to get the native token balance
  const { data: balance, isLoading } = useBalance({
  denom: "ujunox",
  bech32Address: account?.bech32Address,
  chainId: "uni-6", // <-- Add this line
});

  const handleConnect = async () => {
    try {
      if (!(window as any).keplr) {
        return alert("Please install the Keplr wallet extension.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (window as any).keplr.experimentalSuggestChain(junoTestnet);
      connect({ chainId: "uni-6" });
    } catch (error) {
      alert(`Error connecting wallet: ${(error as Error).message}`);
    }
  };

  if (isConnected) {
    return (
      <div>
        <p>Connected Juno Address: {account?.bech32Address}</p>
        {isLoading && <p>Fetching balance...</p>}
        {balance && <p><strong>Your JUNOX Balance: {(Number(balance.amount) / 1_000_000).toLocaleString()}</strong></p>}
        <button onClick={() => disconnect()}>Disconnect Wallet</button>
      </div>
    );
  }

  return <button onClick={handleConnect}>Connect Keplr Wallet</button>;
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{ chains: [junoTestnet] }}>
        <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
          <h1>Welcome to PropMint AI</h1>
          <p>Please connect your wallet to the Juno Testnet.</p>
          <WalletConnect />
        </main>
      </GrazProvider>
    </QueryClientProvider>
  );
}