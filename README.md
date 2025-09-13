# FHE-Pay 🔐💰

**Privacy-Preserving On-Chain Payroll System with Fully Homomorphic Encryption**

FHE-Pay is a revolutionary blockchain-based payroll solution that uses Fully Homomorphic Encryption (FHE) to keep salary information confidential while maintaining blockchain transparency. Built with Zama's fhEVM technology, it solves the critical privacy problem in existing on-chain payroll solutions where all salary data is publicly visible.

## 🌟 Key Features

### 🏢 For Companies
- **Private Payroll Streams**: Create encrypted salary streams that hide actual amounts
- **Secure Fund Management**: Deposit and manage payroll funds with cUSDT/cETH
- **Employee Management**: Add/remove employees with encrypted salary configurations
- **Compliance Ready**: Maintain privacy law compliance while using blockchain benefits
- **Real-time Dashboard**: Monitor payroll status without exposing sensitive data

### 👥 For Employees
- **Private Salary View**: Access your salary information securely
- **Secure Withdrawals**: Withdraw earned funds with FHE protection
- **Payment History**: Track your payment history privately
- **Wallet Integration**: Seamless MetaMask wallet connection

### 🔍 For Public/Observers
- **Transparent Operations**: View encrypted transaction data on blockchain
- **Privacy Preserved**: No access to actual salary amounts or personal data

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for modern UI styling
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Zustand** for state management

### Blockchain & Encryption
- **fhevmjs** - Zama's FHE SDK for client-side encryption
- **Solidity** with fhevm-solidity for smart contracts
- **TFHE.sol** for homomorphic operations
- **Sepolia Testnet** for deployment
- **Wagmi & Viem** for Ethereum interactions
- **RainbowKit** for wallet connections

### Backend & Database
- **Node.js** with Express.js
- **Supabase** for user management and data storage
- **PostgreSQL** database with Row Level Security
- **Hardhat** for smart contract development

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Nodemon** for development server
- **Concurrently** for running multiple processes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask wallet extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amirjaved-dev/FHE-Pay.git
   cd FHE-Pay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This runs both frontend (Vite) and backend (Express) concurrently.

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

## 📋 Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality checks
- `npm run compile` - Compile smart contracts
- `npm run deploy:sepolia` - Deploy contracts to Sepolia testnet
- `npm run client:dev` - Start only the frontend development server
- `npm run server:dev` - Start only the backend development server

## 🏗️ Project Structure

```
FHE-Pay/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── contexts/          # React contexts for state management
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and blockchain services
│   └── utils/             # Utility functions
├── api/                   # Backend Express.js application
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── validators/        # Input validation schemas
├── contracts/             # Solidity smart contracts
├── scripts/               # Deployment and utility scripts
├── supabase/             # Database migrations and config
└── public/               # Static assets
```

## 🔐 Smart Contract Architecture

The system uses Zama's fhEVM technology to enable:

- **Encrypted Salary Storage**: Salaries are encrypted using TFHE
- **Private Computations**: Payroll calculations happen on encrypted data
- **Secure Withdrawals**: Employees can withdraw without revealing amounts
- **Confidential Tokens**: Uses cUSDT and cETH for private transactions

## 🌐 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Smart Contract Deployment
```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify contract on Etherscan
npm run verify:sepolia <CONTRACT_ADDRESS>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for providing the fhEVM technology and TFHE libraries
- **Ethereum Foundation** for the robust blockchain infrastructure
- **Supabase** for the excellent backend-as-a-service platform
- **Vercel** for seamless deployment and hosting

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Zama's FHE technology for a privacy-first future of payroll management.**
