import { createInstance } from 'fhevmjs';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Define ethereum interface for this service
interface EthereumProvider {
  request: (args: { method: string; params: unknown[] }) => Promise<string>;
}

export interface FHEInstance {
  encrypt64: (value: number) => Promise<{ handles: string; inputProof: string }>;
  decrypt64: (handle: string, signature?: string) => Promise<string>;
  createEIP712: (handle: string, contractAddress: string) => unknown;
  generatePublicKey: (contractAddress: string) => Promise<string>;
  setPublicKey: (contractAddress: string, publicKey: string) => void;
}

class FHEService {
  private fhevmInstance: FHEInstance | null = null;
  private isInitialized = false;

  async initialize(provider: BrowserProvider, signer: JsonRpcSigner, contractAddress: string): Promise<void> {
    try {
      if (this.isInitialized && this.fhevmInstance) {
        return;
      }

      // Create fhevm instance
      this.fhevmInstance = (await createInstance({
        chainId: 11155111, // Sepolia testnet
        networkUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        gatewayUrl: 'https://gateway.sepolia.zama.ai',
      })) as unknown as FHEInstance;

      // Generate and set public key for the contract
      const publicKey = await this.fhevmInstance.generatePublicKey(contractAddress);

      this.fhevmInstance.setPublicKey(contractAddress, publicKey);
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize FHE service:', error);
      throw new Error('FHE service initialization failed');
    }
  }

  async encryptValue(value: number): Promise<{ handles: string; inputProof: string }> {
    if (!this.fhevmInstance) {
      throw new Error('FHE service not initialized');
    }

    try {
      const encrypted = await this.fhevmInstance.encrypt64(value);
      return {
        handles: encrypted.handles,
        inputProof: encrypted.inputProof,
      };
    } catch (error) {
      console.error('Failed to encrypt value:', error);
      throw new Error('Encryption failed');
    }
  }

  async decryptValue(handle: string, contractAddress: string, userAddress: string): Promise<number> {
    if (!this.fhevmInstance) {
      throw new Error('FHE service not initialized');
    }

    try {
      // Create EIP712 signature for decryption
      const eip712 = this.fhevmInstance.createEIP712(handle.toString(), contractAddress);
      
      // Get signature from user
      const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum) {
        throw new Error('Ethereum provider not found');
      }
      
      const signature = await ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [userAddress, JSON.stringify(eip712)],
      });

      // Decrypt the value
      const decrypted = await this.fhevmInstance.decrypt64(handle.toString(), signature);
      return parseInt(decrypted, 10);
    } catch (error) {
      console.error('Failed to decrypt value:', error);
      throw new Error('Decryption failed');
    }
  }

  async encryptSalary(salaryAmount: number): Promise<{ handles: string; inputProof: string }> {
    return this.encryptValue(salaryAmount);
  }

  async decryptSalary(encryptedHandle: string, contractAddress: string, userAddress: string): Promise<number> {
    return this.decryptValue(encryptedHandle, contractAddress, userAddress);
  }

  async encryptBalance(balanceAmount: number): Promise<{ handles: string; inputProof: string }> {
    return this.encryptValue(balanceAmount);
  }

  async decryptBalance(encryptedHandle: string, contractAddress: string, userAddress: string): Promise<number> {
    return this.decryptValue(encryptedHandle, contractAddress, userAddress);
  }

  async encryptFundAmount(amount: number): Promise<{ handles: string; inputProof: string }> {
    return this.encryptValue(amount);
  }

  async decryptFundAmount(encryptedHandle: string, contractAddress: string, userAddress: string): Promise<number> {
    return this.decryptValue(encryptedHandle, contractAddress, userAddress);
  }

  isReady(): boolean {
    return this.isInitialized && this.fhevmInstance !== null;
  }

  getInstance(): FHEInstance | null {
    return this.fhevmInstance;
  }

  reset(): void {
    this.fhevmInstance = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const fheService = new FHEService();
export default fheService;