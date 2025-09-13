import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const WalletConnectTest: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  console.log('WalletConnect Test - Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
  console.log('WalletConnect Test - Connection status:', { address, isConnected });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">WalletConnect Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Connection Status:</p>
        <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </p>
        {address && (
          <p className="text-xs text-gray-500 mt-1 font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Available Connectors:</p>
        <div className="space-y-2">
          {connectors.map((connector) => (
            <div key={connector.id} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{connector.name}</span>
              <button
                onClick={() => connect({ connector })}
                disabled={isConnected}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">RainbowKit Connect Button:</p>
        <ConnectButton />
      </div>

      {isConnected && (
        <button
          onClick={() => disconnect()}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      )}
    </div>
  );
};