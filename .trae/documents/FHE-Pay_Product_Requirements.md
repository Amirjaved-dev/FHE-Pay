# FHE-Pay Product Requirements Document

## 1. Product Overview

FHE-Pay is a privacy-preserving on-chain payroll system that uses Fully Homomorphic Encryption (FHE) to keep salary information confidential while maintaining blockchain transparency.

The system solves the critical privacy problem in existing on-chain payroll solutions like Sablier and Superfluid, where all salary data is publicly visible, creating security risks, competitive disadvantages, and privacy law violations. FHE-Pay enables companies to leverage blockchain benefits while protecting sensitive payroll information through end-to-end encryption.

Target market: Companies seeking blockchain-based payroll solutions without compromising employee privacy or exposing financial data to competitors.

## 2. Core Features

### 2.1 User Roles

| Role            | Registration Method                               | Core Permissions                                                                     |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Company Admin   | MetaMask wallet connection + company verification | Create/manage encrypted payroll streams, fund payroll wallet, view encrypted reports |
| Employee        | MetaMask wallet connection                        | View own salary privately, withdraw funds securely, track payment history            |
| Public/Observer | Blockchain explorer access                        | View encrypted transaction data only (no salary details)                             |

### 2.2 Feature Module

Our FHE-Pay system consists of the following main pages:

1. **Dashboard Page**: Company overview, payroll summary, employee management interface
2. **Employee Management Page**: Add/remove employees, salary stream configuration, encrypted salary settings
3. **Payroll Funding Page**: Deposit cUSDT/cETH, wallet balance management, funding history
4. **Employee Portal Page**: Personal salary view, withdrawal interface, payment history
5. **Reports Page**: Encrypte

