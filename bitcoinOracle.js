var fetch = require('fetch')
var BitcoinOracleContract = require('./build/contracts/BitcoinOracle.json')
var contract = require('truffle-contract')
var ganache = require("ganache-cli");
var Web3 = require('web3');
var web3 = new Web3(ganache.provider());

// Truffle abstraction to interact with our
// deployed contract
var bitcoinOracle = contract(BitcoinOracleContract);
bitcoinOracle.setProvider(web3.currentProvider);

if (typeof bitcoinOracle.currentProvider.sendAsync !== "function") {
    bitcoinOracle.currentProvider.sendAsync = function() {
        return bitcoinOracle.currentProvider.send.apply(
            bitcoinOracle.currentProvider, arguments
        );
    };
}
  
web3.eth.getAccounts(async (accounts) => {
    bitcoinOracle.deployed().then((oracleInstance) => {
        let oracle = oracleInstance;

        // Watch event and respond to event
        // With a callback function  
        oracle.CallbackGetBTCCap().watch((event) => {
            // Fetch data
            // and update it into the contract
            fetch.fetchUrl('https://api.coinmarketcap.com/v2/global/', (err, m, b) => {
                let bitcoinJson = JSON.parse(b.toString());
                let btcMarketCap = parseInt(bitcoinJson.total_market_cap_usd);
  
                // Send data back contract on-chain
                oracle.setBTCCap(btcMarketCap, {from: accounts[0]})
            })
        }, (err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });    
});
