// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProfitDistributor is Ownable, ReentrancyGuard {
    address public fundingWallet;
    uint256 public distributionFee = 0.001 ether;
    uint256 public totalDistributed;
    
    event ProfitsDistributed(address indexed token, uint256 amount, uint256 timestamp);
    event DistributionFeeUpdated(uint256 newFee);
    event FundingWalletUpdated(address newWallet);
    
    constructor(address _fundingWallet) {
        require(_fundingWallet != address(0), "Invalid funding wallet");
        fundingWallet = _fundingWallet;
    }
    
    function distributeETH() external payable nonReentrant {
        require(msg.value > distributionFee, "Insufficient amount");
        
        uint256 distributionAmount = msg.value - distributionFee;
        payable(fundingWallet).transfer(distributionAmount);
        totalDistributed += distributionAmount;
        
        emit ProfitsDistributed(address(0), distributionAmount, block.timestamp);
    }
    
    function distributeToken(address tokenAddress) external nonReentrant {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        
        require(balance > 0, "No balance to distribute");
        require(token.transfer(fundingWallet, balance), "Transfer failed");
        totalDistributed += balance;
        
        emit ProfitsDistributed(tokenAddress, balance, block.timestamp);
    }
    
    function setDistributionFee(uint256 fee) external onlyOwner {
        distributionFee = fee;
        emit DistributionFeeUpdated(fee);
    }
    
    function setFundingWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "Invalid wallet");
        fundingWallet = wallet;
        emit FundingWalletUpdated(wallet);
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    receive() external payable {}
}