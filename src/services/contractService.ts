import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import PayrollStreamABI from '../contracts/PayrollStream.json';
import { fheService } from './fheService';

const CONTRACT_ADDRESS = '0xfba43B77f3143A84e5046288A24C650ffb1A70d1'; // Deployed PayrollStream contract on Sepolia

export interface EmployeeStream {
  employee: string;
  isActive: boolean;
  startTime: number;
}

export interface StreamCreationParams {
  employeeAddress: string;
  monthlySalary: number;
}

export interface FundDepositParams {
  amount: number;
  tokenType: 'USDT' | 'ETH';
}

class ContractService {
  private contract: Contract | null = null;
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private fheInitialized: boolean = false;

  async initialize(provider: BrowserProvider, signer: JsonRpcSigner): Promise<void> {
    this.provider = provider;
    this.signer = signer;
    this.contract = new Contract(CONTRACT_ADDRESS, PayrollStreamABI.abi, signer);
    
    // Try to initialize FHE service, but don't fail if it doesn't work
    try {
      await fheService.initialize(provider, signer, CONTRACT_ADDRESS);
      this.fheInitialized = true;
      // FHE service initialized successfully
    } catch (error) {
      console.warn('FHE service initialization failed, some features will be limited:', error);
      this.fheInitialized = false;
      // Don't throw error - allow basic contract operations
    }
  }

  async registerCompany(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.registerCompany();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to register company:', error);
      throw new Error('Company registration failed');
    }
  }

  async createConfidentialStream(params: StreamCreationParams): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    if (!this.isFHEReady()) throw new Error('FHE service not available. Please try again later.');
    
    try {
      // Encrypt the salary amount
      const encrypted = await fheService.encryptSalary(params.monthlySalary);
      
      const tx = await this.contract.createConfidentialStream(
        params.employeeAddress,
        encrypted.handles,
        encrypted.inputProof
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to create stream:', error);
      throw new Error('Stream creation failed');
    }
  }

  async depositFunds(params: FundDepositParams): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    if (!this.isFHEReady()) throw new Error('FHE service not available. Please try again later.');
    
    try {
      // Encrypt the deposit amount
      const encrypted = await fheService.encryptFundAmount(params.amount);
      
      const tx = await this.contract.depositFunds(
        encrypted.handles,
        encrypted.inputProof,
        params.tokenType
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to deposit funds:', error);
      throw new Error('Fund deposit failed');
    }
  }

  async updateEmployeeBalance(companyAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.updateEmployeeBalance(companyAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to update balance:', error);
      throw new Error('Balance update failed');
    }
  }

  async withdraw(companyAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.withdraw(companyAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to withdraw:', error);
      throw new Error('Withdrawal failed');
    }
  }

  async updateStream(employeeAddress: string, newSalary: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      // Encrypt the new salary amount
      const encrypted = await fheService.encryptSalary(newSalary);
      
      const tx = await this.contract.updateStream(
        employeeAddress,
        encrypted.handles,
        encrypted.inputProof
      );
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to update stream:', error);
      throw new Error('Stream update failed');
    }
  }

  async getEncryptedBalance(companyAddress: string, userAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const encryptedHandle = await this.contract.getEncryptedBalance(companyAddress);
      return await fheService.decryptBalance(encryptedHandle, companyAddress, userAddress);
    } catch (error) {
      console.error('Failed to get encrypted balance:', error);
      throw new Error('Failed to get encrypted balance');
    }
  }

  async getEncryptedSalary(companyAddress: string, userAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const encryptedHandle = await this.contract.getEncryptedSalary(companyAddress);
      return await fheService.decryptSalary(encryptedHandle, companyAddress, userAddress);
    } catch (error) {
      console.error('Failed to get salary:', error);
      throw new Error('Salary retrieval failed');
    }
  }

  async getCompanyFunds(tokenType: 'USDT' | 'ETH', companyAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const encryptedHandle = await this.contract.getCompanyFunds(tokenType);
      return await fheService.decryptFundAmount(encryptedHandle, companyAddress, companyAddress);
    } catch (error) {
      console.error('Failed to get company funds:', error);
      throw new Error('Company funds retrieval failed');
    }
  }

  async isStreamActive(companyAddress: string, employeeAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      return await this.contract.isStreamActive(companyAddress, employeeAddress);
    } catch (error) {
      console.error('Failed to check stream status:', error);
      throw new Error('Stream status check failed');
    }
  }

  async deactivateStream(employeeAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const tx = await this.contract.deactivateStream(employeeAddress);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to deactivate stream:', error);
      throw new Error('Stream deactivation failed');
    }
  }

  async getStreamStartTime(companyAddress: string, employeeAddress: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      const timestamp = await this.contract.getStreamStartTime(companyAddress, employeeAddress);
      return parseInt(timestamp.toString(), 10);
    } catch (error) {
      console.error('Failed to get stream start time:', error);
      throw new Error('Stream start time retrieval failed');
    }
  }

  async isCompanyRegistered(): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    try {
      // This would typically check if the company exists in the contract
      // For now, we'll return true if the contract is initialized
      return true;
    } catch (error) {
      console.error('Failed to check company registration:', error);
      return false;
    }
  }

  getContractAddress(): string {
    return CONTRACT_ADDRESS;
  }

  isInitialized(): boolean {
    return this.contract !== null;
  }

  isFHEReady(): boolean {
    return this.fheInitialized && fheService.isReady();
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;