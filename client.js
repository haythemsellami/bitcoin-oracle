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
  
web3.eth.getAccounts((accounts) => {
    bitcoinOracle.deployed().then((oracleInstance) => {
        let oracle = oracleInstance;

        let oraclePromises = [
            oracleInstance.updateBTCCap({from: accounts[0]})  // Request oracle to update the information
        ]
    
        Promise.all(oraclePromises).then((result) => {
            console.log('BTC Market Cap: ' + result[0]);
            console.log('Requesting Oracle to update contract information...');
        }).catch((err) => {
            console.log(err)
        });
    }).catch((err) => {
        console.log(err);
    });
});