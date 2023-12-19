// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {CoinFlip} from "../contracts/CoinFlip.sol";

contract TestCoinFlip is Test {
    CoinFlip public coinFlip;
    enum Choice { Heads, Tails }

    function setUp() public {
        coinFlip = new CoinFlip();
        coinFlip.addBetAmount(0.01 ether);
    }

  function testPlaceBet() public {
    uint256 initialBalance = coinFlip.getContractBalance();
    uint256 betValue = 0.01 ether;
    uint256 houseEdgeValue = coinFlip.houseEdgePercentage() * betValue / 10000;
    coinFlip.placeBet{value: betValue + houseEdgeValue}(coinFlip.intToChoice(0), betValue);
    uint256 expectedBalance = initialBalance + betValue + houseEdgeValue;
    uint256 actualBalance = coinFlip.getContractBalance();
    assertEq(actualBalance, expectedBalance, "Place bet failed");
}

  function testClaimReward() public {
    coinFlip.placeBet{value: 0.01 ether + coinFlip.houseEdgePercentage() * 0.01 ether / 10000}(coinFlip.intToChoice(0), 0.01 ether);
    vm.warp(block.timestamp + 5);
    coinFlip.claimReward();
    (, , bool claimed) = coinFlip.bets(address(this));
    assertEq(claimed, true, "Claim reward failed");
}

    function testRandomness() public {
        uint256 headsCount = 0;
        uint256 tailsCount = 0;
        for(uint256 i = 0; i < 100; i++) {
            coinFlip.placeBet{value: 0.01 ether + coinFlip.houseEdgePercentage() * 0.01 ether / 10000}(coinFlip.intToChoice(0), 0.01 ether);
            vm.warp(block.timestamp + 5);
            if(coinFlip.getResult(address(this))) {
                headsCount++;
            } else {
                tailsCount++;
            }
        }
        // Since we're testing randomness, we're checking that the results aren't too skewed towards heads or tails.
        assertTrue(headsCount > 40 && headsCount < 60, "Randomness test failed");
        assertTrue(tailsCount > 40 && tailsCount < 60, "Randomness test failed");
    }

    function testWhitelist() public {
        coinFlip.addToWhitelist(address(this));
        assertTrue(coinFlip.isWhitelisted(address(this)), "Whitelist addition failed");
        coinFlip.removeFromWhitelist(address(this));
        assertTrue(!coinFlip.isWhitelisted(address(this)), "Whitelist removal failed");
    }
}
