// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {

    address public owner;
    mapping(uint256 => bool) public validBets; // To store valid bet amounts
    uint256 public constant MAX_WITHDRAWAL = 1 ether;
    uint256 public constant WITHDRAWAL_COOLDOWN = 1 days;
    uint256 public houseEdgePercentage = 750; // Default to 2%, can be changed by owner up to 7.5%

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
        validBets[10000000000000000] = true; // 0.01 ether in wei as a valid bet by default
    }

    function setHouseEdgePercentage(uint256 _percentage) external onlyOwner {
      require(_percentage <= 750, "Maximum house edge is 7.5%"); // 750 in basis points is 7.5%
      houseEdgePercentage = _percentage;
    }

    function addValidBetAmount(uint256 _amount) external onlyOwner {
        validBets[_amount] = true;
    }

    function removeValidBetAmount(uint256 _amount) external onlyOwner {
        validBets[_amount] = false;
    }

    function fundContract() external payable onlyOwner {
        emit Funded(msg.sender, msg.value);
    }

  function withdrawFunds(uint256 amount) external onlyOwner {
    require(amount <= MAX_WITHDRAWAL, "Cannot withdraw more than 1 ETH at a time");
    require(block.timestamp >= lastWithdrawal + WITHDRAWAL_COOLDOWN, "Must wait for withdrawal cooldown");
    require(amount <= address(this).balance, "Amount is more than available balance");

    (bool success, ) = owner.call{value: amount}("");
    require(success, "Transfer failed");

    lastWithdrawal = block.timestamp;
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
      require(bets[msg.sender].blockNumber == 0, "A bet has already been placed");
      if (whitelist[msg.sender]) {
          require(msg.value == 0, "Whitelisted addresses must not send any ether");
          require(!whitelistedBetPlaced[msg.sender], "Whitelisted address has already placed a bet");
          whitelistedBetPlaced[msg.sender] = true; // Set the flag
      } else {
          require(validBets[msg.value], "Invalid bet amount");
      }
      require(_choice == Choice.Heads || _choice == Choice.Tails, "Invalid choice");

      bets[msg.sender] = Bet(msg.value, block.number, _choice);

      emit BetReceived(msg.sender, msg.value);
  }

  function resolveBet() external {
    Bet storage userBet = bets[msg.sender]; // Use storage pointer to user's bet

    require(userBet.blockNumber > 0, "No bet placed");
    require(block.number > userBet.blockNumber + 5, "Wait for more blocks");
    require(block.number <= userBet.blockNumber + 256, "Bet is voided due to wait of more than 256 blocks");

    uint256 blockHash = uint256(blockhash(userBet.blockNumber));
    bool result = blockHash % 2 == 0; // Even for Heads, Odd for Tails

    bool win = (result && userBet.choice == Choice.Heads) ||
               (!result && userBet.choice == Choice.Tails);

    uint256 potentialWinning = userBet.amount * 2; // Double the bet amount
    uint256 houseEdge = (potentialWinning * houseEdgePercentage) / 10000; // Calculate house edge on the potential winning
    uint256 payoutAmount = potentialWinning - houseEdge; // Subtract the house edge from the potential winning

    // Reset bet
    delete bets[msg.sender];

    if (win) {
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
  }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function isWhitelisted(address _address) external view returns (bool) {
    return whitelist[_address];
}

}
