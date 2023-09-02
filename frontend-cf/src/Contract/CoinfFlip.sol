// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {

    address public owner;
    uint256 public constant BET_AMOUNT = 10000000000000000; // 0.01 ether in wei
    uint256 public constant MAX_WITHDRAWAL = 1 ether;
    uint256 public constant WITHDRAWAL_COOLDOWN = 1 days;

    uint256 public lastWithdrawal;

    enum Choice { Heads, Tails }

    struct Bet {
        uint256 amount;
        uint256 blockNumber;
        Choice choice;
    }

    mapping(address => Bet) public bets;
    mapping(address => bool) public whitelist;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    event BetReceived(address indexed user, uint256 amount);
    event PayoutSent(address indexed user, uint256 amount);
    event Funded(address indexed funder, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function fundContract() external payable onlyOwner {
        emit Funded(msg.sender, msg.value);
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= MAX_WITHDRAWAL, "Cannot withdraw more than 1 ETH at a time");
        require(block.timestamp >= lastWithdrawal + WITHDRAWAL_COOLDOWN, "Must wait for withdrawal cooldown");
        require(amount <= address(this).balance, "Amount is more than available balance");

        lastWithdrawal = block.timestamp;

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }




    function addToWhitelist(address _address) external onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) external onlyOwner {
        whitelist[_address] = false;
    }


  // Add a new mapping to track if a whitelisted address has placed a bet
mapping(address => bool) public whitelistedBetPlaced;

function placeBet(Choice _choice) external payable {
    if (whitelist[msg.sender]) {
        require(msg.value == 0, "Whitelisted addresses must not send any ether");
        require(!whitelistedBetPlaced[msg.sender], "Whitelisted address has already placed a bet");
        whitelistedBetPlaced[msg.sender] = true; // Set the flag
    } else {
        require(msg.value == BET_AMOUNT, "Bet amount must be 0.01 ETH");
    }
    require(_choice == Choice.Heads || _choice == Choice.Tails, "Invalid choice");

    bets[msg.sender] = Bet(msg.value, block.number, _choice);

    emit BetReceived(msg.sender, msg.value);
}

function resolveBet() external {
    require(bets[msg.sender].blockNumber > 0, "No bet placed");
    require(block.number > bets[msg.sender].blockNumber + 5, "Wait for more blocks");

    uint256 blockHash = uint256(blockhash(bets[msg.sender].blockNumber));
    bool result = blockHash % 2 == 0; // Even for Heads, Odd for Tails

    bool win = (result && bets[msg.sender].choice == Choice.Heads) ||
               (!result && bets[msg.sender].choice == Choice.Tails);

    if (win) {
        uint256 houseEdge = BET_AMOUNT * 2 / 100; // 2% of the original bet
        uint256 payoutAmount = (BET_AMOUNT * 2) - houseEdge; // Double minus the house edge

        require(address(this).balance >= payoutAmount, "Insufficient funds in contract");

        (bool success, ) = msg.sender.call{value: payoutAmount}("");
        require(success, "Transfer failed");

        emit PayoutSent(msg.sender, payoutAmount);
    }

    // If the address was whitelisted and had placed a bet, remove it from the whitelist
    if (whitelistedBetPlaced[msg.sender]) {
        whitelist[msg.sender] = false;
        whitelistedBetPlaced[msg.sender] = false; // Reset the flag
    }

    // Reset bet
    delete bets[msg.sender];
}

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function isWhitelisted(address _address) external view returns (bool) {
    return whitelist[_address];
}

}
