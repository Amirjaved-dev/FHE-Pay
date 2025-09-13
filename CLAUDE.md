# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack FHE-Pay (Fully Homomorphic Encryption Payroll) application that provides privacy-preserving payroll management using Zama's FHE technology. The application consists of a React frontend with Vite, a Node.js/Express backend, and Ethereum smart contracts with FHE capabilities.

## Architecture

### Frontend (React + TypeScript + Vite)
- **Location**: `src/` directory
- **Framework**: React 18 with TypeScript, Vite for build tooling
- **Routing**: React Router DOM v7
- **State Management**: Zustand for client state, TanStack Query for server state
- **UI Framework**: Tailwind CSS with Headless UI, Heroicons, and Lucide React
- **Authentication**: Supabase SSR auth with custom providers
- **Web3 Integration**: RainbowKit, Wagmi, and Ethers for wallet connectivity
- **FHE Integration**: fhevmjs for client-side FHE operations

### Backend (Node.js + Express)
- **Location**: `api/` directory  
- **Framework**: Express.js with TypeScript
- **Features**: Rate limiting, CORS, helmet for security, morgan for logging
- **Database**: Supabase for application data
- **Proxy**: Frontend proxies `/api` requests to backend on port 3001

### Smart Contracts
- **Location**: `contracts/` directory
- **Framework**: Solidity 0.8.24 with Hardhat for development
- **FHE Technology**: Zama's FHEVM (`@fhevm/solidity`)
- **Main Contract**: `PayrollStream.sol` - Encrypted payroll streaming contract
- **Testing**: Mocha with Chai and Hardhat testing utilities

## Development Commands

### Core Development
```bash
npm run dev          # Start both frontend (localhost:5173) and backend (localhost:3001)
npm run client:dev   # Start frontend only (Vite dev server)
npm run server:dev   # Start backend only (nodemon)
npm run build        # Build both frontend and backend for production
npm run check        # Type check without emitting files
npm run lint         # Run ESLint
```

### Smart Contract Development
```bash
npm run compile       # Compile smart contracts
npm run deploy:sepolia # Deploy to Sepolia testnet
npm run verify:sepolia # Verify contract on Etherscan
npm run node:local   # Start local Hardhat node
```

### Testing
```bash
npm test             # Run smart contract tests (Hardhat/Mocha)
```

## Project Structure

### Key Directories
- `src/components/` - Reusable React components (WalletProvider, ProtectedRoute, Layout)
- `src/contexts/` - React contexts (SupabaseContext, etc.)
- `src/pages/` - Page components (Dashboard, Employees, Funding, Portal, Reports)
- `src/hooks/` - Custom React hooks
- `src/services/` - API services and utilities
- `src/utils/` - Utility functions
- `src/lib/` - External library integrations
- `src/contracts/` - Contract ABIs and utilities
- `api/` - Backend Express server code
- `contracts/` - Solidity smart contracts
- `scripts/` - Deployment and utility scripts

### Configuration Files
- `hardhat.config.js` - Hardhat network and compiler configuration
- `vite.config.ts` - Vite build configuration with proxy setup
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration with React rules

## Environment Variables

### Required for Development
Copy `.env.example` to `.env` and configure:
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `VITE_PAYROLL_CONTRACT_ADDRESS` - Deployed contract address
- `VITE_CHAIN_ID` - Network chain ID (11155111 for Sepolia)
- `VITE_FHE_LIB_URL` - FHE gateway URL
- `PRIVATE_KEY` - Deployment wallet private key (backend)
- `ETHERSCAN_API_KEY` - Etherscan API key for verification

### Supabase Configuration
- Configured in `src/contexts/SupabaseContext.tsx`
- Uses `@supabase/supabase-js` and SSR helpers

## Smart Contract Architecture

### PayrollStream Contract
- **Purpose**: Privacy-preserving payroll streaming using FHE
- **Key Features**:
  - Encrypted salary storage and streaming
  - Company fund management (USDT/ETH)
  - Employee salary withdrawals
  - Company registration and employee management
- **FHE Integration**: Uses Zama's FHEVM for encrypted operations
- **Security**: Role-based access control (company admin, employees)

### Contract Deployment
- **Network**: Sepolia testnet (Chain ID: 11155111)
- **Script**: `scripts/deploy.js`
- **Artifacts**: Generated in `artifacts/` directory
- **Deployment Info**: Stored in `deployments/sepolia-deployment.json`

## Development Workflow

### Frontend Development
1. Use `npm run client:dev` to start Vite dev server (localhost:5173)
2. Hot reload enabled for React components
3. API requests proxied to backend at `/api`

### Backend Development  
1. Use `npm run server:dev` to start nodemon (localhost:3001)
2. TypeScript compilation and auto-restart on changes
3. API routes in `api/` directory

### Smart Contract Development
1. Write contracts in `contracts/` directory
2. Compile with `npm run compile`
3. Test with Hardhat/Mocha
4. Deploy to Sepolia with `npm run deploy:sepolia`

## FHE Integration

### Client-Side
- Uses `fhevmjs` library for encrypted operations
- FHE gateway configured via environment variable
- Integration with web3 wallet for encrypted transactions

### Smart Contract
- Uses `@fhevm/solidity` for FHE operations
- Encrypted data types: `euint64`, `euint32`, `ebool`
- Gateway contract for FHE operations

## Deployment

### Frontend
- Built with Vite and serves static files
- Configured for Vercel deployment via `vercel.json`

### Backend
- Deployed as serverless functions
- Uses `@vercel/node` for deployment

### Smart Contracts
- Deployed to Ethereum networks via Hardhat
- Automated deployment scripts in `scripts/` directory
- Contract verification on Etherscan

## Testing

### Frontend Testing
- React Testing Library (not currently configured)
- Component testing can be added with Vitest

### Backend Testing
- Express route testing (not currently configured)
- Can be added with Jest or Mocha

### Smart Contract Testing
- Hardhat + Mocha + Chai
- Test files should be placed in `test/` directory
- Use `npm test` to run contract tests

## Security Considerations

### Private Key Management
- Never commit private keys to version control
- Use environment variables for sensitive data
- Different keys for development and production

### Smart Contract Security
- FHE operations require special security considerations
- Role-based access control implemented
- Comprehensive testing recommended before mainnet deployment

### Web3 Security
- WalletConnect integration for secure wallet connections
- RainbowKit for secure transaction signing
- Encrypted data storage using FHE

## Common Issues

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors with `npm run check`
- Run linting with `npm run lint`

### Contract Issues
- Ensure FHEVM library is properly installed
- Check contract compilation with `npm run compile`
- Verify network configuration in `hardhat.config.js`

### Development Issues
- Make sure both frontend and backend are running with `npm run dev`
- Check environment variables in `.env` file
- Verify Supabase configuration in `src/contexts/SupabaseContext.tsx`