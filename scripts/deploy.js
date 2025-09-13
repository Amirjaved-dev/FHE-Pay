import hre from 'hardhat';
import { ethers as ethersLib } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Starting PayrollStream deployment...');
  
  // Create provider and wallet manually
  const provider = new ethersLib.JsonRpcProvider(process.env.VITE_SEPOLIA_RPC_URL);
  const wallet = new ethersLib.Wallet(process.env.PRIVATE_KEY, provider);
  console.log('Using wallet address:', wallet.address);

  // Get account balance
  const balance = await provider.getBalance(wallet.address);
  console.log('Account balance:', ethersLib.formatEther(balance), 'ETH');

  // Deploy PayrollStream contract
  console.log('\nDeploying PayrollStream contract...');
  
  // Get contract factory from hardhat artifacts
  const contractArtifact = await hre.artifacts.readArtifact('PayrollStream');
  const PayrollStreamFactory = new ethersLib.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );
  
  // Deploy with proper gas settings for Sepolia
  const payrollStream = await PayrollStreamFactory.deploy({
    gasLimit: 3000000, // Set a reasonable gas limit
  });

  // Wait for deployment to be mined
  await payrollStream.waitForDeployment();
  const contractAddress = await payrollStream.getAddress();

  console.log('PayrollStream deployed to:', contractAddress);
  console.log('Transaction hash:', payrollStream.deploymentTransaction().hash);

  // Wait for a few confirmations
  console.log('Waiting for confirmations...');
  await payrollStream.deploymentTransaction().wait(3);
  console.log('Contract confirmed!');

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: wallet.address,
    network: 'sepolia',
    deploymentTime: new Date().toISOString(),
    transactionHash: payrollStream.deploymentTransaction().hash,
    blockNumber: payrollStream.deploymentTransaction().blockNumber,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, 'sepolia-deployment.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log('Deployment info saved to:', deploymentFile);

  // Update contract ABI in frontend
  const abi = JSON.stringify(contractArtifact.abi);
  
  const frontendContractDir = path.join(__dirname, '..', 'src', 'contracts');
  if (!fs.existsSync(frontendContractDir)) {
    fs.mkdirSync(frontendContractDir, { recursive: true });
  }
  
  const abiFile = path.join(frontendContractDir, 'PayrollStream.json');
  const contractData = {
    address: contractAddress,
    abi: JSON.parse(abi),
  };
  
  fs.writeFileSync(abiFile, JSON.stringify(contractData, null, 2));
  console.log('Contract ABI updated in frontend:', abiFile);

  console.log('\n=== Deployment Summary ===');
  console.log('Contract Address:', contractAddress);
  console.log('Network: Sepolia Testnet');
  console.log('Deployer:', wallet.address);
  console.log('Gas Used:', payrollStream.deploymentTransaction().gasLimit?.toString());
  console.log('Block Explorer:', `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  return {
    contractAddress,
    deployerAddress: wallet.address,
    transactionHash: payrollStream.deploymentTransaction().hash,
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });

export default main;