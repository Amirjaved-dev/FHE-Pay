import { Connector } from 'wagmi';

// Define wallet provider interface
interface WalletProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isRainbow?: boolean;
  isTrust?: boolean;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon?: string;
  installed: boolean;
  downloadUrl?: string;
  priority: number;
}

export interface DetectedWallet extends WalletInfo {
  connector?: Connector;
}

// Wallet detection functions
export const detectMetaMask = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ethereum = (window as unknown as { ethereum?: WalletProvider }).ethereum;
  return !!ethereum?.isMetaMask;
};

export const detectCoinbaseWallet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ethereum = (window as unknown as { ethereum?: WalletProvider }).ethereum;
  return !!ethereum?.isCoinbaseWallet;
};

export const detectWalletConnect = (): boolean => {
  // WalletConnect is always available as it's a protocol
  return true;
};

export const detectRainbowWallet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ethereum = (window as unknown as { ethereum?: WalletProvider }).ethereum;
  return !!ethereum?.isRainbow;
};

export const detectTrustWallet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ethereum = (window as unknown as { ethereum?: WalletProvider }).ethereum;
  return !!ethereum?.isTrust;
};

// Wallet information database
export const WALLET_INFO: Record<string, Omit<WalletInfo, 'installed'>> = {
  metaMask: {
    id: 'metaMask',
    name: 'MetaMask',
    downloadUrl: 'https://metamask.io/download/',
    priority: 1
  },
  walletConnect: {
    id: 'walletConnect',
    name: 'WalletConnect',
    priority: 2
  },
  coinbaseWallet: {
    id: 'coinbaseWallet',
    name: 'Coinbase Wallet',
    downloadUrl: 'https://www.coinbase.com/wallet',
    priority: 3
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow',
    downloadUrl: 'https://rainbow.me/',
    priority: 4
  },
  trust: {
    id: 'trust',
    name: 'Trust Wallet',
    downloadUrl: 'https://trustwallet.com/',
    priority: 5
  }
};

// Detection function mapping
const DETECTION_FUNCTIONS: Record<string, () => boolean> = {
  metaMask: detectMetaMask,
  walletConnect: detectWalletConnect,
  coinbaseWallet: detectCoinbaseWallet,
  rainbow: detectRainbowWallet,
  trust: detectTrustWallet
};

// Get all available wallets with detection status
export const getAvailableWallets = (connectors: Connector[] = []): DetectedWallet[] => {
  const wallets: DetectedWallet[] = [];
  
  // Create connector map for easy lookup
  const connectorMap = new Map<string, Connector>();
  connectors.forEach(connector => {
    connectorMap.set(connector.id, connector);
  });
  
  // Check each wallet
  Object.entries(WALLET_INFO).forEach(([id, info]) => {
    const detector = DETECTION_FUNCTIONS[id];
    const installed = detector ? detector() : false;
    const connector = connectorMap.get(id);
    
    wallets.push({
      ...info,
      installed,
      connector
    });
  });
  
  // Sort by priority (lower number = higher priority) and installation status
  return wallets.sort((a, b) => {
    // Installed wallets first
    if (a.installed && !b.installed) return -1;
    if (!a.installed && b.installed) return 1;
    
    // Then by priority
    return a.priority - b.priority;
  });
};

// Get the best wallet recommendation
export const getRecommendedWallet = (connectors: Connector[] = []): DetectedWallet | null => {
  const wallets = getAvailableWallets(connectors);
  
  // First, try to find an installed wallet
  const installedWallet = wallets.find(wallet => wallet.installed && wallet.connector);
  if (installedWallet) {
    return installedWallet;
  }
  
  // If no installed wallets, recommend MetaMask as it's most popular
  return wallets.find(wallet => wallet.id === 'metaMask') || wallets[0] || null;
};

// Check if user is on mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Get mobile-optimized wallet recommendations
export const getMobileWalletRecommendations = (connectors: Connector[] = []): DetectedWallet[] => {
  const wallets = getAvailableWallets(connectors);
  
  if (!isMobile()) {
    return wallets;
  }
  
  // On mobile, prioritize WalletConnect and mobile-friendly wallets
  const mobileOptimized = wallets.map(wallet => {
    if (wallet.id === 'walletConnect') {
      return { ...wallet, priority: 0 }; // Highest priority on mobile
    }
    if (wallet.id === 'metaMask' && wallet.installed) {
      return { ...wallet, priority: 1 };
    }
    return wallet;
  });
  
  return mobileOptimized.sort((a, b) => {
    if (a.installed && !b.installed) return -1;
    if (!a.installed && b.installed) return 1;
    return a.priority - b.priority;
  });
};

// Auto-detect and suggest the best connection method
export const getSmartWalletSuggestion = (connectors: Connector[] = []): {
  primary: DetectedWallet | null;
  alternatives: DetectedWallet[];
  isMobileDevice: boolean;
} => {
  const isMobileDevice = isMobile();
  const wallets = isMobileDevice 
    ? getMobileWalletRecommendations(connectors)
    : getAvailableWallets(connectors);
  
  const primary = wallets.find(wallet => wallet.installed && wallet.connector) || 
                 wallets.find(wallet => wallet.connector) || 
                 null;
  
  const alternatives = wallets.filter(wallet => wallet !== primary);
  
  return {
    primary,
    alternatives,
    isMobileDevice
  };
};