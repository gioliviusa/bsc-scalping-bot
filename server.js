const express = require('express');
const Web3 = require('web3');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const verifyDeployment = require('./scripts/verify-deployment');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.set('trust proxy', 'loopback');

const web3 = new Web3(process.env.BSC_TESTNET_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/');

let profitDistributorAddress;
let scalpingBotAddress;

app.get('/api/contracts', async (req, res) => {
  try {
    res.json({
      success: true,
      contracts: {
        profitDistributor: profitDistributorAddress,
        scalpingBot: scalpingBotAddress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    if (!profitDistributorAddress || !scalpingBotAddress) {
      return res.json({
        success: false,
        message: "Contracts not deployed yet"
      });
    }
    const profitDistributorABI = require('./build/contracts/ProfitDistributor.json').abi;
    const scalpingBotABI = require('./build/contracts/ScalpingBot.json').abi;
    const profitDistributor = new web3.eth.Contract(profitDistributorABI, profitDistributorAddress);
    const scalpingBot = new web3.eth.Contract(scalpingBotABI, scalpingBotAddress);
    const [
      totalDistributed,
      dailyLimit,
      dailyTraded,
      tradeLimit
    ] = await Promise.all([
      profitDistributor.methods.totalDistributed().call(),
      scalpingBot.methods.dailyLimit().call(),
      scalpingBot.methods.dailyTraded().call(),
      scalpingBot.methods.tradeLimit().call()
    ]);
    res.json({
      success: true,
      stats: {
        totalDistributed: web3.utils.fromWei(totalDistributed, 'ether'),
        dailyLimit: web3.utils.fromWei(dailyLimit, 'ether'),
        dailyTraded: web3.utils.fromWei(dailyTraded, 'ether'),
        tradeLimit: web3.utils.fromWei(tradeLimit, 'ether')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/verify-deployment', async (req, res) => {
  try {
    if (!profitDistributorAddress || !scalpingBotAddress) {
      return res.json({
        success: false,
        message: "Contract addresses not set. Please deploy contracts first."
      });
    }
    const profitDistributorCode = await web3.eth.getCode(profitDistributorAddress);
    const scalpingBotCode = await web3.eth.getCode(scalpingBotAddress);
    res.json({
      success: true,
      contracts: {
        profitDistributor: {
          address: profitDistributorAddress,
          deployed: profitDistributorCode !== '0x'
        },
        scalpingBot: {
          address: scalpingBotAddress,
          deployed: scalpingBotCode !== '0x'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/network-info', async (req, res) => {
  try {
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    const isListening = await web3.eth.net.isListening();
    res.json({
      success: true,
      network: {
        id: networkId,
        name: networkId === 97 ? "BSC Testnet" : networkId === 56 ? "BSC Mainnet" : "Unknown",
        blockNumber: blockNumber,
        isListening: isListening
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const currentBlock = await web3.eth.getBlockNumber();
    const transactions = [];
    for (let i = 0; i < 5; i++) {
      try {
        const block = await web3.eth.getBlock(currentBlock - i, true);
        if (block && block.transactions) {
          block.transactions.forEach(tx => {
            if (tx.from.toLowerCase() === address.toLowerCase() ||
                tx.to.toLowerCase() === address.toLowerCase()) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: web3.utils.fromWei(tx.value, 'ether'),
                blockNumber: block.number,
                timestamp: new Date(block.timestamp * 1000).toISOString()
              });
            }
          });
        }
      } catch (error) {
        console.log(`Error checking block ${currentBlock - i}:`, error.message);
      }
    }
    res.json({
      success: true,
      transactions: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-test-transaction', async (req, res) => {
  try {
    const { toAddress, amount } = req.body;
    if (!toAddress || !amount) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      return res.status(400).json({ success: false, error: "No accounts available" });
    }
    const transaction = {
      from: accounts[0],
      to: toAddress,
      value: web3.utils.toWei(amount.toString(), 'ether'),
      gas: 21000
    };
    try {
      const receipt = await web3.eth.sendTransaction(transaction);
      res.json({
        success: true,
        transactionHash: receipt.transactionHash,
        message: "Test transaction sent successfully"
      });
    } catch (error) {
      res.json({
        success: false,
        error: error.message,
        message: "Transaction failed (may not have enough funds)"
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Funding wallet: ${process.env.FUNDING_WALLET}`);
  console.log(`BSC Testnet URL: ${process.env.BSC_TESTNET_URL}`);
});

function setContractAddresses(profitDistributorAddr, scalpingBotAddr) {
  profitDistributorAddress = profitDistributorAddr;
  scalpingBotAddress = scalpingBotAddr;
  console.log(`ProfitDistributor address set to: ${profitDistributorAddress}`);
  console.log(`ScalpingBot address set to: ${scalpingBotAddress}`);
}

module.exports = { setContractAddresses };