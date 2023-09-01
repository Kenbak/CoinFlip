// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {

    address public owner;
    uint256 public constant BET_AMOUNT = 10000000000000000; // 0.01 ether in wei

    // Mapping to keep track of bets
    mapping(address => uint256) public bets;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    event BetReceived(address indexed user, uint256 amount);
    event PayoutSent(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    event Funded(address indexed funder, uint256 amount);

    function fundContract() external payable onlyOwner {
        emit Funded(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Amount is more than available balance");
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }

    function placeBet() external payable {
        require(msg.value == BET_AMOUNT, "Bet amount must be 0.01 ETH");
        bets[msg.sender] = msg.value;
        emit BetReceived(msg.sender, msg.value);
    }

    function payoutWinner(address winner) external onlyOwner {
        require(bets[winner] > 0, "No bet placed by this address");

        uint256 houseEdge = BET_AMOUNT * 2 / 100; // 2% of the original bet
        uint256 payoutAmount = (BET_AMOUNT * 2) - houseEdge; // Double minus the house edge

        require(address(this).balance >= payoutAmount, "Insufficient funds in contract");

        (bool success, ) = winner.call{value: payoutAmount}("");
        require(success, "Transfer failed");

        // Reset bet
        bets[winner] = 0;

        emit PayoutSent(winner, payoutAmount);
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
