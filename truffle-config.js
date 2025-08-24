const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();
const { PRIVATE_KEY, BSC_TESTNET_URL, BSC_MAINNET_URL } = process.env;

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    bscTestnet: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, BSC_TESTNET_URL),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 20000000000
    },
    bscMainnet: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, BSC_MAINNET_URL),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: false,
      gas: 6000000,
      gasPrice: 5000000000
    }
  },
  compilers: {
    solc: {
      version: "0.8.20", // Match OpenZeppelin contracts
    }
  }
};