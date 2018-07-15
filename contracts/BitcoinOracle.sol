pragma solidity ^0.4.4;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BitcoinOracle is Ownable {

    using SafeMath for uint;

    //contract owner
    address public owner;
    //BTC Marketcap storage
    uint public btcMarketCap;
    //Callback function
    event EventGetBTCCap();

    function updateBTCCap() public {
        //Call event
        emit EventGetBTCCap();
    }

    //Only from trusted source (the owner)
    function setBTCCap(uint _cap) public onlyOwner() {
        btcMarketCap = _cap;
    }

    function getBTCCap() view public returns (uint) {
        return btcMarketCap;
    }
}
