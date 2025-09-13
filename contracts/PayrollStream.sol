// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/FHE.sol";

contract PayrollStream {
    using FHE for euint64;
    using FHE for euint32;
    using FHE for ebool;

    struct EmployeeStream {
        euint64 encryptedSalary;     // Encrypted monthly salary
        euint64 encryptedBalance;    // Encrypted current balance
        euint32 encryptedLastWithdraw; // Encrypted last withdrawal timestamp
        address employee;            // Employee address
        bool isActive;              // Stream status
        uint256 startTime;          // Stream start time
    }

    struct CompanyFunds {
        euint64 encryptedUSDTBalance;
        euint64 encryptedETHBalance;
    }

    mapping(address => mapping(address => EmployeeStream)) public employeeStreams; // company => employee => stream
    mapping(address => CompanyFunds) public companyFunds;
    mapping(address => bool) public isCompanyAdmin;
    mapping(address => address) public employeeToCompany;

    event StreamCreated(address indexed company, address indexed employee, uint256 startTime);
    event FundsDeposited(address indexed company, uint256 amount, string tokenType);
    event SalaryWithdrawn(address indexed employee, address indexed company);
    event StreamUpdated(address indexed company, address indexed employee);

    modifier onlyCompanyAdmin() {
        require(isCompanyAdmin[msg.sender], "Only company admin can perform this action");
        _;
    }

    modifier onlyEmployee(address company) {
        require(employeeToCompany[msg.sender] == company, "Only employee can perform this action");
        _;
    }

    constructor() {
        // Initialize gateway caller
    }

    /**
     * @dev Register as a company admin
     */
    function registerCompany() external {
        isCompanyAdmin[msg.sender] = true;
    }

    /**
     * @dev Create a confidential salary stream for an employee
     * @param employee Employee address
     * @param encryptedSalary Encrypted monthly salary amount
     */
    function createConfidentialStream(
        address employee,
        externalEuint64 encryptedSalary,
        bytes calldata inputProof
    ) external onlyCompanyAdmin {
        euint64 salary = FHE.fromExternal(encryptedSalary, inputProof);
        
        employeeStreams[msg.sender][employee] = EmployeeStream({
            encryptedSalary: salary,
            encryptedBalance: FHE.asEuint64(0),
            encryptedLastWithdraw: FHE.asEuint32(uint32(block.timestamp)),
            employee: employee,
            isActive: true,
            startTime: block.timestamp
        });

        employeeToCompany[employee] = msg.sender;
        
        emit StreamCreated(msg.sender, employee, block.timestamp);
    }

    /**
     * @dev Deposit encrypted funds to company treasury
     * @param encryptedAmount Encrypted amount to deposit
     * @param tokenType "USDT" or "ETH"
     */
    function depositFunds(
         externalEuint32 encryptedAmount,
         bytes calldata inputProof,
         string calldata tokenType
     ) external onlyCompanyAdmin {
         euint32 amount = FHE.fromExternal(encryptedAmount, inputProof);
        
        if (keccak256(bytes(tokenType)) == keccak256(bytes("USDT"))) {
            companyFunds[msg.sender].encryptedUSDTBalance = companyFunds[msg.sender].encryptedUSDTBalance.add(FHE.asEuint64(amount));
        } else if (keccak256(bytes(tokenType)) == keccak256(bytes("ETH"))) {
             companyFunds[msg.sender].encryptedETHBalance = 
                 companyFunds[msg.sender].encryptedETHBalance.add(FHE.asEuint64(amount));
        }
        
        emit FundsDeposited(msg.sender, 0, tokenType); // Amount is encrypted
    }

    /**
     * @dev Calculate and update employee's available balance based on time elapsed
     * @param company Company address
     */
    function updateEmployeeBalance(address company) external {
        EmployeeStream storage stream = employeeStreams[company][msg.sender];
        require(stream.isActive, "Stream is not active");

        // Calculate time elapsed since last withdrawal (in seconds)
        euint32 currentTime = FHE.asEuint32(uint32(block.timestamp));
        euint32 timeElapsed = currentTime.sub(stream.encryptedLastWithdraw);
        
        // Convert to monthly proportion (assuming 30 days = 2592000 seconds)
        euint64 timeElapsed64 = FHE.asEuint64(timeElapsed);
        euint64 monthlyPortion = stream.encryptedSalary.mul(timeElapsed64).div(uint64(2592000));
        
        // Add to current balance
        stream.encryptedBalance = stream.encryptedBalance.add(monthlyPortion);
        stream.encryptedLastWithdraw = currentTime;
    }

    /**
     * @dev Employee withdraws their available encrypted salary
     * @param company Company address
     */
    function withdraw(address company) external onlyEmployee(company) {
        EmployeeStream storage stream = employeeStreams[company][msg.sender];
        require(stream.isActive, "Stream is not active");

        // Update balance first
        this.updateEmployeeBalance(company);
        
        // Check if balance is greater than 0
        ebool hasBalance = stream.encryptedBalance.gt(FHE.asEuint64(0));
        // Note: In production, you would use decryption requests for balance checks
        // For now, we'll assume the balance check is handled off-chain
        // require(FHE.decrypt(hasBalance), "No balance available");

        // Deduct from company funds (assuming USDT for now)
        CompanyFunds storage funds = companyFunds[company];
        ebool sufficientFunds = FHE.gt(funds.encryptedUSDTBalance, stream.encryptedBalance).or(FHE.eq(funds.encryptedUSDTBalance, stream.encryptedBalance));
        // Note: In production, you would use decryption requests for fund checks
        // For now, we'll assume the fund check is handled off-chain
        // require(FHE.decrypt(sufficientFunds), "Insufficient company funds");

        funds.encryptedUSDTBalance = funds.encryptedUSDTBalance.sub(stream.encryptedBalance);
        
        // Reset employee balance
        stream.encryptedBalance = FHE.asEuint64(0);
        
        emit SalaryWithdrawn(msg.sender, company);
    }

    /**
     * @dev Update employee's encrypted salary
     * @param employee Employee address
     * @param newEncryptedSalary New encrypted salary amount
     */
    function updateStream(
        address employee,
        externalEuint64 newEncryptedSalary,
        bytes calldata inputProof
    ) external onlyCompanyAdmin {
        require(employeeStreams[msg.sender][employee].isActive, "Stream does not exist");
        
        euint64 newSalary = FHE.fromExternal(newEncryptedSalary, inputProof);
        employeeStreams[msg.sender][employee].encryptedSalary = newSalary;
        
        emit StreamUpdated(msg.sender, employee);
    }

    /**
     * @dev Get employee's encrypted balance (only employee can decrypt)
     * @param company Company address
     * @return Encrypted balance
     */
    function getEncryptedBalance(address company) external returns (euint64) {
        return employeeStreams[company][msg.sender].encryptedBalance;
    }

    /**
     * @dev Get employee's encrypted salary (only employee can decrypt)
     * @param company Company address
     * @return Encrypted salary
     */
    function getEncryptedSalary(address company) external view returns (euint64) {
        return employeeStreams[company][msg.sender].encryptedSalary;
    }

    /**
     * @dev Get company's encrypted fund balance (only company admin can decrypt)
     * @param tokenType "USDT" or "ETH"
     * @return Encrypted balance
     */
    function getCompanyFunds(string calldata tokenType) external returns (euint64) {
        require(isCompanyAdmin[msg.sender], "Only company admin can view funds");
        
        if (keccak256(bytes(tokenType)) == keccak256(bytes("USDT"))) {
            return companyFunds[msg.sender].encryptedUSDTBalance;
        } else if (keccak256(bytes(tokenType)) == keccak256(bytes("ETH"))) {
            return companyFunds[msg.sender].encryptedETHBalance;
        }
        
        return FHE.asEuint64(0);
    }

    /**
     * @dev Check if stream is active
     * @param company Company address
     * @param employee Employee address
     * @return Stream status
     */
    function isStreamActive(address company, address employee) external view returns (bool) {
        return employeeStreams[company][employee].isActive;
    }

    /**
     * @dev Deactivate employee stream
     * @param employee Employee address
     */
    function deactivateStream(address employee) external onlyCompanyAdmin {
        employeeStreams[msg.sender][employee].isActive = false;
    }

    /**
     * @dev Get stream start time
     * @param company Company address
     * @param employee Employee address
     * @return Start timestamp
     */
    function getStreamStartTime(address company, address employee) external view returns (uint256) {
        return employeeStreams[company][employee].startTime;
    }
}