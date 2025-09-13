import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Ensure WalletConnect project ID is available
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID is not set. WalletConnect functionality may be limited.');
}

export const config = getDefaultConfig({
  appName: import.meta.env.VITE_APP_NAME || 'FHE-Pay',
  projectId: projectId || 'demo-project-id',
  chains: [sepolia],
  ssr: false
});

export { sepolia };