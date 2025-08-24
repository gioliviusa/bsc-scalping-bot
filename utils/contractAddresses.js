let profitDistributorAddress = null;
let scalpingBotAddress = null;

function setContractAddresses(profitDistributorAddr, scalpingBotAddr) {
  profitDistributorAddress = profitDistributorAddr;
  scalpingBotAddress = scalpingBotAddr;
  console.log(`ProfitDistributor address set to: ${profitDistributorAddress}`);
  console.log(`ScalpingBot address set to: ${scalpingBotAddress}`);
}

function getContractAddresses() {
  return {
    profitDistributorAddress,
    scalpingBotAddress
  };
}

module.exports = { setContractAddresses, getContractAddresses };