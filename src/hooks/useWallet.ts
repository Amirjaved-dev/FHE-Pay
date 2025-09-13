import { useAccount, useConnect, useDisconnect, type Connector } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function useWallet(): {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  connectors: readonly Connector[];
} {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const connectWallet = (): void => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const disconnectWallet = (): void => {
    disconnect();
  };

  return {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    connectors,
  };
}