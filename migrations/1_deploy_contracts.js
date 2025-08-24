const ProfitDistributor = artifacts.require("ProfitDistributor");
const ScalpingBot = artifacts.require("ScalpingBot");

const FUNDING_WALLET = "0x03725858F0d8eCC50735463A224530B4B9b335F7";

module.exports = async function (deployer, network, accounts) {
  console.log(`Deploying to network: ${network}`);
  console.log(`Funding wallet: ${FUNDING_WALLET}`);
  
  await deployer.deploy(ProfitDistributor, FUNDING_WALLET);
  const profitDistributor = await ProfitDistributor.deployed();
  console.log(`ProfitDistributor deployed at: ${profitDistributor.address}`);
  
  await deployer.deploy(ScalpingBot, profitDistributor.address);
  const scalpingBot = await ScalpingBot.deployed();
  console.log(`ScalpingBot deployed at: ${scalpingBot.address}`);
  
  await profitDistributor.transferOwnership(scalpingBot.address);
  console.log("Transferred ProfitDistributor ownership to ScalpingBot");
  
  if (network === "bscTestnet") {
    const BUSD_TESTNET = "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7";
    await scalpingBot.addAllowedToken(BUSD_TESTNET);
    console.log(`Added BUSD (${BUSD_TESTNET}) as allowed token`);
  }
};