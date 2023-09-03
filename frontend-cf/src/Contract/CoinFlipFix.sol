// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {
    enum Choice { Heads, Tails }
    address public owner;

    struct BetInfo {
        uint256 weiValue;
        Choice choice;
        bool claimed;
    }

    event BetPlaced(address indexed user, Choice choice, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);


    mapping(uint256 => bool) public allowedBetAmounts;


     uint256 public constant MAX_WITHDRAWAL = 1 ether;

    mapping(address => BetInfo) public bets;
    mapping(address => uint256) public blockNumbersToBeUsed;
    uint256 public houseEdgePercentage = 500; // 5%

  constructor() {
    owner = msg.sender;
    allowedBetAmounts[0.01 ether] = true;
    }

    modifier onlyOwner() {
    require(msg.sender == owner, "Only the contract owner can call this function");
    _;
    }

    function addBetAmount(uint256 _amount) external onlyOwner {
    allowedBetAmounts[_amount] = true;
    }

    function removeBetAmount(uint256 _amount) external onlyOwner {
        allowedBetAmounts[_amount] = false;
    }

 mapping(address => bool) public whitelist;

function placeBet(Choice _choice, uint256 _betAmount) external payable {
    require(allowedBetAmounts[_betAmount], "Bet amount not allowed");

    uint256 betAmount = _betAmount;
    uint256 houseEdge = (betAmount * houseEdgePercentage) / 10000; // Calculate house edge
    uint256 totalAmount = betAmount + houseEdge;

    if (whitelist[msg.sender]) {
        require(msg.value == houseEdge, "Incorrect amount sent for free bet");
        whitelist[msg.sender] = false; // Remove from whitelist after free bet
    } else {
        require(msg.value == totalAmount, "Incorrect amount sent");
    }

    // Check if user has a winning bet that hasn't been claimed
    if(blockNumbersToBeUsed[msg.sender] != 0) {
        require(block.number >= blockNumbersToBeUsed[msg.sender] && !bets[msg.sender].claimed, "Claim your previous winnings first");
    }

    BetInfo memory newBet = BetInfo({
        weiValue: betAmount, // Store the bet amount
        choice: _choice,
        claimed: false
    });
    bets[msg.sender] = newBet;
    blockNumbersToBeUsed[msg.sender] = block.number + 5;

    emit BetPlaced(msg.sender, _choice, betAmount);
}

function isWhitelisted(address user) public view returns (bool) {
    return whitelist[user];
}


   function getResult(address user) public view returns (bool) {

    require(blockNumbersToBeUsed[user] != 0, "No bet placed");
    require(block.number > blockNumbersToBeUsed[user], "Too early");

    // Get the blockhash of the block 5 blocks after the bet
    bytes32 blockHash = blockhash(blockNumbersToBeUsed[user]);

    // Convert the blockhash into a uint256
    uint256 hashNumber = uint256(blockHash);

    // Determine if the resulting number is even or odd
    bool gameResult = (hashNumber % 2 == 0 && bets[user].choice == Choice.Heads) ||
                      (hashNumber % 2 != 0 && bets[user].choice == Choice.Tails);

    return gameResult;
}


 function claimReward() external {
    require(blockNumbersToBeUsed[msg.sender] != 0, "No bet placed");
    require(block.number >= blockNumbersToBeUsed[msg.sender], "Too early");
    require(!bets[msg.sender].claimed, "Already claimed");
    require(getResult(msg.sender), "Not a winning bet");

    uint256 potentialWinning = bets[msg.sender].weiValue * 2; // Double the bet amount
    uint256 payoutAmount = potentialWinning; // No need to subtract the house edge

    require(address(this).balance >= payoutAmount, "Insufficient funds in contract");

    // Update state before calling the external contract
    bets[msg.sender].claimed = true;
    blockNumbersToBeUsed[msg.sender] = 0;

    (bool success, ) = msg.sender.call{value: payoutAmount}("");
    require(success, "Transfer failed");

    emit RewardClaimed(msg.sender, payoutAmount);
}
     function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

        function fundContract() external payable onlyOwner {

    }

  function withdrawFunds(uint256 amount) external onlyOwner {
    require(amount <= MAX_WITHDRAWAL, "Cannot withdraw more than 1 ETH at a time");
    require(amount <= address(this).balance, "Amount is more than available balance");
    (bool success, ) = owner.call{value: amount}("");
    require(success, "Transfer failed");

}

  function setHouseEdgePercentage(uint256 _percentage) external onlyOwner {
      require(_percentage <= 500, "Maximum house edge is 5%"); // 500 in basis points is 5%
      houseEdgePercentage = _percentage;
    }

    function addToWhitelist(address _address) external onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) external onlyOwner {
        whitelist[_address] = false;
    }
}
