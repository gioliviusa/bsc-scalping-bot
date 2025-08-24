const { setContractAddresses } = require('../server');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
require('dotenv').config();

async function deployContracts() {
  console.log('Starting contract deployment...');
  
  const provider = new HDWalletProvider(
    process.env.PRIVATE_KEY,
    process.env.BSC_TESTNET_URL
  );
  
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  console.log(`Deploying from account: ${accounts[0]}`);
  
  const profitDistributorABI = require('../build/contracts/ProfitDistributor.json').abi;
  const scalpingBotABI = require('../build/contracts/ScalpingBot.json').abi;
  
  console.log('Deploying ProfitDistributor...');
  const ProfitDistributor = new web3.eth.Contract(profitDistributorABI);
  const profitDistributor = await ProfitDistributor.deploy({
    arguments: [process.env.FUNDING_WALLET],
    data: require('../build/contracts/ProfitDistributor.json').bytecode
  }).send({
    from: accounts[0],
    gas: 3000000,
    gasPrice: '20000000000'
  });
  
  console.log(`ProfitDistributor deployed at: ${profitDistributor.options.address}`);
  
  console.log('Deploying ScalpingBot...');
  const ScalpingBot = new web3.eth.Contract(scalpingBotABI);
  const scalpingBot = await ScalpingBot.deploy({
    arguments: [profitDistributor.options.address],
    data: require('../build/contracts/ScalpingBot.json').bytecode
  }).send({
    from: accounts[0],
    gas: 3000000,
    gasPrice: '20000000000'
  });
  
  console.log(`ScalpingBot deployed at: ${scalpingBot.options.address}`);
  
  console.log('Transferring ProfitDistributor ownership to ScalpingBot...');
  const profitDistributorInstance = new web3.eth.Contract(
    profitDistributorABI,
    profitDistributor.options.address
  );
  
  await profitDistributorInstance.methods
    .transferOwnership(scalpingBot.options.address)
    .send({
      from: accounts[0],
      gas: 200000,
      gasPrice: '20000000000'
    });
  
  console.log('Ownership transferred successfully');
  
  setContractAddresses(profitDistributor.options.address, scalpingBot.options.address);
  
  console.log('Deployment completed successfully!');
  console.log(`ProfitDistributor: ${profitDistributor.options.address}`);
  console.log(`ScalpingBot: ${scalpingBot.options.address}`);
}

deployContracts().catch(console.error);