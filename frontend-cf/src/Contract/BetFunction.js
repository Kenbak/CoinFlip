// BetFunctions

import { ethers } from "ethers";
import { getContractToWrite, getContractToRead, getProvider } from "./interact";
import CoinFlipABI from "./CoinFlipFix.abi.json"; // FOR TESTNET
// import CoinFlipABI from "./CoinFlip.abi.json"; //
import { VITE_NETWORK_ID, VITE_COINFLIP_ADDRESS  } from "./constants";

const houseEdgePercentage = 500; // Represents 5% (as basis points)


export async function checkNetwork() {
  try {
    if (window.ethereum.networkVersion != VITE_NETWORK_ID) {
      throw "Wrong network";
    }
  } catch (error) {
    console.error("Network check error:", error);
    throw error
  }
}



export async function placeBet(choice, isUserWhitelisted) {
  try {
  const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);

  const betAmount = ethers.utils.parseEther("0.01"); // Example bet amount
  const houseEdge = betAmount.mul(houseEdgePercentage).div(10000);
  const totalAmount = betAmount.add(houseEdge);

  const valueToSend = isUserWhitelisted ? houseEdge : totalAmount;

  const tx = await contract.placeBet(choice, betAmount, { value: valueToSend });
  await tx.wait();
} catch (error) {
  console.error("Error placing bet in BetFunction:", error);
  throw error;

    // Check if the error message contains the specific contract revert reason

    // console.log(error.error.data.message)
    // alert(error.error.data.message);
  }
}


export async function isUserWhitelisted(address) {
  try {
    const contract = await getContractToRead(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    return await contract.isWhitelisted(address);
  } catch (error) {
    console.error("Error checking whitelist status:", error);
    alert("Error checking if user is whitelisted. Try again.");
    return false; // indicates an error occurred
  }
}



export async function getCurrentBet(userAddress) {
  try {
    const contract = await getContractToRead(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    return await contract.bets(userAddress);
  } catch (error) {
    console.error("Error fetching current bet:", error);
    alert("Error retrieving your current bet. Please try again.");
    return null; // indicates an error occurred
  }
}

export async function getContractBalance() {
    return await getProvider().getBalance(VITE_COINFLIP_ADDRESS);
}

export async function addToWhitelist(address) {
  const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
  const tx = await contract.addToWhitelist(address);
  await tx.wait();
}


export async function removeFromWhitelist(address) {
  const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
  const tx = await contract.removeFromWhitelist(address);
  await tx.wait();
}

export async function claimReward() {
  try {
  const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
  const tx = await contract.claimReward();
  await tx.wait();
  } catch (error) {
    console.error("Error claiming reward:", error);

    throw error;
  }
}


export async function getResult(userAddress) {
  try {
    const contract = await getContractToRead(VITE_COINFLIP_ADDRESS, CoinFlipABI);

    const rawOutcome = await contract.getResult(userAddress);
    console.log("Raw outcome:", rawOutcome);

    return rawOutcome;
  } catch (error) {
    console.error("Error in getResult:", error);
    throw error;  // Re-throw the error if you want the caller to be aware of it
  }
}
