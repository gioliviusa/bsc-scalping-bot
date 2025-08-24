const express = require('express');
const Web3 = require('web3');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

const web3 = new Web3(process.env.BSC_TESTNET_URL);

let profitDistributorAddress, scalpingBotAddress;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Funding wallet: ${process.env.FUNDING_WALLET}`);
});

function setContractAddresses(profitDistributorAddr, scalpingBotAddr) {
  profitDistributorAddress = profitDistributorAddr;
  scalpingBotAddress = scalpingBotAddr;
  console.log(`ProfitDistributor address set to: ${profitDistributorAddress}`);
  console.log(`ScalpingBot address set to: ${scalpingBotAddress}`);
}

module.exports = { setContractAddresses };