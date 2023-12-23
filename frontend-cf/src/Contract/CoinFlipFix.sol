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

    uint256 public constant NUM_BLOCKS = 5;
    mapping(address => uint256[NUM_BLOCKS]) private betBlockNumbers;

    event BetPlaced(address indexed user, Choice choice, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);


    mapping(uint256 => bool) public allowedBetAmounts;


    uint256 public constant MAX_WITHDRAWAL = 1 ether;

    mapping(address => BetInfo) public bets;

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

        // Check if the sender has a previous bet that might be ready to be claimed
        if (betBlockNumbers[msg.sender][NUM_BLOCKS - 1] != 0) {
            require(block.number > betBlockNumbers[msg.sender][NUM_BLOCKS - 1], "Previous bet still pending");

            // Check if the previous bet is a winning one and not claimed yet
            if (getResult(msg.sender) && !bets[msg.sender].claimed) {
                require(false, "Claim your previous winnings first");
            }
        }
        // Check if the sender is whitelisted
        if (whitelist[msg.sender]) {
            // Whitelisted users can only bet 0.005 Ether
            require(_betAmount == 0.005 ether, "Whitelisted users can only bet 0.005 Ether");
        }

        uint256 betAmount = _betAmount;
        uint256 houseEdge = (betAmount * houseEdgePercentage) / 10000;
        uint256 totalAmount = betAmount + houseEdge;

        // If the user is whitelisted, they only need to pay the house edge
        if (whitelist[msg.sender]) {
            require(msg.value == houseEdge, "Incorrect amount sent for free bet");
            whitelist[msg.sender] = false; // Optionally, remove them from the whitelist after betting
        } else {
            require(msg.value == totalAmount, "Incorrect amount sent");
        }

        // Store the bet
        BetInfo memory newBet = BetInfo({
            weiValue: betAmount,
            choice: _choice,
            claimed: false
        });
        bets[msg.sender] = newBet;

        // Store the block numbers for future reference
        for (uint256 i = 0; i < NUM_BLOCKS; i++) {
            betBlockNumbers[msg.sender][i] = block.number + i + 1;
        }

        emit BetPlaced(msg.sender, _choice, betAmount);
    }

    function isWhitelisted(address user) public view returns (bool) {
        return whitelist[user];
    }


function getResult(address user) public view returns (bool) {
    // Check if the last block number is set for the user's bet
    require(betBlockNumbers[user][NUM_BLOCKS - 1] != 0, "No bet placed");

    // Check if the result is ready (current block number should be greater than the last stored block number)
    require(block.number > betBlockNumbers[user][NUM_BLOCKS - 1], "Result not ready");

    // Combine the hashes of the specified blocks
    bytes32 combinedHash;
    for (uint256 i = 0; i < NUM_BLOCKS; i++) {
        combinedHash = keccak256(abi.encodePacked(combinedHash, blockhash(betBlockNumbers[user][i])));
    }

    // Determine the outcome based on the combined hash
    bool isHeads = uint256(combinedHash) % 2 == 0;
    return (isHeads && bets[user].choice == Choice.Heads) ||
           (!isHeads && bets[user].choice == Choice.Tails);
}



    function claimReward() external {
    // Ensure that a bet was placed and the last block number is set for the user's bet
    require(betBlockNumbers[msg.sender][NUM_BLOCKS - 1] != 0, "No bet placed");

    // Check if the result is ready (current block number should be greater than the last stored block number)
    require(block.number >= betBlockNumbers[msg.sender][NUM_BLOCKS - 1], "Too early");

    // Check if the bet was already claimed
    require(!bets[msg.sender].claimed, "Already claimed");

    // Ensure the game result is ready and the bet is a winning one
    require(getResult(msg.sender), "Not a winning bet");

    uint256 potentialWinning = bets[msg.sender].weiValue * 2; // Double the bet amount
    uint256 payoutAmount = potentialWinning;

    // Check if the contract has enough balance to pay out the reward
    require(address(this).balance >= payoutAmount, "Insufficient funds in contract");

    // Update state before transferring funds to mitigate reentrancy risks
    bets[msg.sender].claimed = true;

    // Reset the block numbers for the user's bet
    for (uint256 i = 0; i < NUM_BLOCKS; i++) {
        betBlockNumbers[msg.sender][i] = 0;
    }

    // Transfer funds securely
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
