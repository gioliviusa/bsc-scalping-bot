// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ScalpingBot is Ownable, ReentrancyGuard {
    address public profitDistributor;
    address public executor;
    uint256 public tradeLimit = 1 ether;
    uint256 public dailyLimit = 10 ether;
    uint256 public dailyTraded;
    uint256 public lastTradeDate;
    
    mapping(address => bool) public allowedTokens;
    
    event TradeExecuted(address indexed token, uint256 amount, bool isBuy, uint256 timestamp);
    event LimitsUpdated(uint256 tradeLimit, uint256 dailyLimit);
    
    modifier onlyExecutor() {
        require(msg.sender == executor || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier withinLimits(uint256 amount) {
        require(amount <= tradeLimit, "Exceeds trade limit");
        
        if (block.timestamp > lastTradeDate + 1 days) {
            dailyTraded = 0;
            lastTradeDate = block.timestamp;
        }
        
        require(dailyTraded + amount <= dailyLimit, "Exceeds daily limit");
        _;
    }
    
    constructor(address _profitDistributor) {
        require(_profitDistributor != address(0), "Invalid profit distributor");
        profitDistributor = _profitDistributor;
        executor = msg.sender;
    }
    
    function executeTrade(
        address token,
        uint256 amount,
        bool isBuy
    ) external onlyExecutor withinLimits(amount) nonReentrant {
        require(allowedTokens[token] || token == address(0), "Token not allowed");
        
        dailyTraded += amount;
        emit TradeExecuted(token, amount, isBuy, block.timestamp);
    }
    
    function setLimits(uint256 newTradeLimit, uint256 newDailyLimit) external onlyOwner {
        tradeLimit = newTradeLimit;
        dailyLimit = newDailyLimit;
        emit LimitsUpdated(newTradeLimit, newDailyLimit);
    }
    
    function addAllowedToken(address token) external onlyOwner {
        allowedTokens[token] = true;
    }
    
    function removeAllowedToken(address token) external onlyOwner {
        allowedTokens[token] = false;
    }
    
    function setExecutor(address _executor) external onlyOwner {
        executor = _executor;
    }
    
    function setProfitDistributor(address _profitDistributor) external onlyOwner {
        require(_profitDistributor != address(0), "Invalid profit distributor");
        profitDistributor = _profitDistributor;
    }
    
    function withdrawToDistributor() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = profitDistributor.call{value: balance}("");
        require(success, "Transfer failed");
    }
    
    receive() external payable {}
}