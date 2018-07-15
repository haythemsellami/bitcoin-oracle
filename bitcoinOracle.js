var fetch = require('fetch')
var BitcoinOracleContract = require('./build/contracts/BitcoinOracle.json')
var TruffleContract = require('truffle-contract')
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));

// Truffle abstraction to interact with our deployed contract
var bitcoinOracle = TruffleContract(BitcoinOracleContract);
bitcoinOracle.setProvider(web3.currentProvider);

if (typeof bitcoinOracle.currentProvider.sendAsync !== "function") {
    bitcoinOracle.currentProvider.sendAsync = function() {
        return bitcoinOracle.currentProvider.send.apply(
            bitcoinOracle.currentProvider, arguments
        );
    };
}
  
web3.eth.getAccounts().then((accounts) => {
    bitcoinOracle.deployed().then((oracleInstance) => {
        let oracle = oracleInstance;

        // Watch event and respond to event
        // With a callback function  
        oracle.EventGetBTCCap().watch((event) => {
            console.log("Update bitcoin marketcap triggered");
            // Fetch data
            // and update it into the contract
            fetch.fetchUrl('https://api.coinmarketcap.com/v2/global/', (err, m, b) => {
                let bitcoinJson = JSON.parse(b.toString());
                let btcMarketCap = parseInt(bitcoinJson.data.quotes.USD.total_market_cap);
  
                // Send data back contract on-chain
                oracle.setBTCCap(btcMarketCap, {from: accounts[0]});
            })
        }, (err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);
    });    
});
