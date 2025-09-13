# Smart Contract Deployment Guide

This guide will walk you through deploying the FHE-Pay PayrollStream smart contract to Sepolia testnet using Zama's FHE technology.

## Prerequisites

- Node.js (v18 or higher)
- A wallet with Sepolia testnet ETH
- Etherscan API key (optional, for contract verification)

## 1. Environment Setup

### 1.1 Configure Environment Variables

Update the `.env` file with your deployment credentials:

```bash
# Deployment Configuration
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Important Security Notes:**
- Never commit your private key to version control
- Use a dedicated wallet for testnet deployments
- Keep your private key secure and never share it

### 1.2 Get Your Private Key

**From MetaMask:**
1. Open MetaMask
2. Click on your account name
3. Go to "Account Details"
4. Click "Export Private Key"
5. Enter your password and copy the private key

**From other wallets:**
- Follow your wallet's documentation to export the private key

### 1.3 Get Etherscan API Key (Optional)

1. Go to [Etherscan.io](https://etherscan.io/)
2. Create an account or log in
3. Go to "API Keys" in your profile
4. Create a new API key
5. Copy the API key to your `.env` file

## 2. Get Sepolia Testnet ETH

You need Sepolia ETH to deploy contracts. Get it from these faucets:

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

**Steps:**
1. Copy your wallet address
2. Visit one of the faucet links above
3. Paste your address and request testnet ETH
4. Wait for the transaction to confirm

## 3. Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

## 4. Compile Contracts

Compile the smart contracts:

```bash
npm run compile
```

This will:
- Compile the PayrollStream.sol contract
- Generate ABI and bytecode
- Create artifacts in the `artifacts/` folder

## 5. Deploy to Sepolia

Deploy the contract to Sepolia testnet:

```bash
npm run deploy:sepolia
```

**What happens during deployment:**
1. Connects to Sepolia network using your private key
2. Deploys the PayrollStream contract
3. Waits for confirmation (3 blocks)
4. Saves deployment info to `deployments/sepolia-deployment.json`
5. Updates the frontend contract ABI in `src/contracts/PayrollStream.json`
6. Displays the contract address and transaction hash

**Expected Output:**
```
Starting PayrollStream deployment...
Using wallet address: 0x...
Account balance: 0.1 ETH

Deploying PayrollStream contract...
PayrollStream deployed to: 0x1234567890123456789012345678901234567890
Transaction hash: 0xabcdef...
Waiting for confirmations...
Contract confirmed!

=== Deployment Summary ===
Contract Address: 0x1234567890123456789012345678901234567890
Network: Sepolia Testnet
Deployer: 0x...
Block Explorer: https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890
```

## 6. Verify Contract (Optional)

Verify your contract on Etherscan for transparency:

```bash
npm run verify:sepolia <CONTRACT_ADDRESS>
```

Replace `<CONTRACT_ADDRESS>` with your deployed contract address.

**Example:**
```bash
npm run verify:sepolia 0x1234567890123456789012345678901234567890
```

## 7. Update Frontend Configuration

After successful deployment, update your `.env` file with the new contract address:

```bash
VITE_PAYROLL_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

## 8. Test the Deployment

### 8.1 Start the Application

```bash
npm run dev
```

### 8.2 Connect Your Wallet

1. Open the application in your browser
2. Connect the same wallet you used for deployment
3. Make sure you're on Sepolia testnet

### 8.3 Test Contract Functions

1. **Register as Company:** Call `registerCompany()` function
2. **Create Employee Stream:** Test creating an encrypted salary stream
3. **Deposit Funds:** Test depositing encrypted funds

## Troubleshooting

### Common Issues

**1. "Insufficient funds" error**
- Solution: Get more Sepolia ETH from faucets
- Check your wallet balance

**2. "Invalid private key" error**
- Solution: Double-check your private key in `.env`
- Make sure there are no extra spaces or characters

**3. "Network connection failed"**
- Solution: Check your internet connection
- Try a different RPC URL in `hardhat.config.js`

**4. "Contract verification failed"**
- Solution: Make sure your Etherscan API key is correct
- Wait a few minutes and try again

### Getting Help

- Check the [Zama Documentation](https://docs.zama.ai/)
- Review Hardhat documentation for deployment issues
- Check Etherscan for transaction details

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Test thoroughly** on testnet before mainnet
4. **Verify contracts** on Etherscan for transparency
5. **Use dedicated wallets** for different environments
6. **Keep backups** of your deployment information

## Network Information

- **Network:** Sepolia Testnet
- **Chain ID:** 11155111
- **RPC URL:** https://rpc.sepolia.dev
- **Block Explorer:** https://sepolia.etherscan.io
- **FHE Gateway:** https://gateway.sepolia.zama.ai

## Contract Features

The deployed PayrollStream contract includes:

- **Encrypted Salary Streams:** Private salary information using FHE
- **Company Fund Management:** Encrypted balance tracking
- **Employee Withdrawals:** Secure salary withdrawals
- **Stream Management:** Create, update, and deactivate streams
- **Multi-token Support:** USDT and ETH support

## Next Steps

After successful deployment:

1. Test all contract functions
2. Set up monitoring for your contract
3. Consider deploying to mainnet when ready
4. Implement additional security measures
5. Add more comprehensive testing

---

**Note:** This is a testnet deployment. For production use, ensure thorough testing and security audits.