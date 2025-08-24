const { setContractAddresses } = require('../utils/contractAddresses');
const Web3 = require('web3');
require('dotenv').config();

async function verifyDeployment() {
  console.log('Verifying deployment...');
  
  try {
    const web3 = new Web3(process.env.BSC_TESTNET_URL);
    
    // Replace with your actual contract addresses after deployment
    const profitDistributorAddress = process.env.PROFIT_DISTRIBUTOR_ADDRESS;
    const scalpingBotAddress = process.env.SCALPING_BOT_ADDRESS;
    
    if (!profitDistributorAddress || !scalpingBotAddress) {
      console.log('Contract addresses not set in environment variables.');
      console.log('Please set PROFIT_DISTRIBUTOR_ADDRESS and SCALPING_BOT_ADDRESS in your .env file.');
      return;
    }
    
    // Check if contracts exist on blockchain
    const profitDistributorCode = await web3.eth.getCode(profitDistributorAddress);
    const scalpingBotCode = await web3.eth.getCode(scalpingBotAddress);
    
    console.log('ProfitDistributor:');
    console.log(`  Address: ${profitDistributorAddress}`);
    console.log(`  Deployed: ${profitDistributorCode !== '0x' ? 'YES' : 'NO'}`);
    
    console.log('ScalpingBot:');
    console.log(`  Address: ${scalpingBotAddress}`);
    console.log(`  Deployed: ${scalpingBotCode !== '0x' ? 'YES' : 'NO'}`);
    
    // Set addresses in server
    setContractAddresses(profitDistributorAddress, scalpingBotAddress);
    
    console.log('Deployment verification completed!');
  } catch (error) {
    console.error('Error verifying deployment:', error);
  }
}

// Run if this script is called directly
if (require.main === module) {
  verifyDeployment();
}

module.exports = verifyDeployment;


