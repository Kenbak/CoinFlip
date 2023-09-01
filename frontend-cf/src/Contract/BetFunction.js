import { ethers } from "ethers";
import { getContractToWrite, getContractToRead, getProvider } from "./interact";
import CoinFlipABI from "./CoinFlip.abi.json";
import { VITE_NETWORK_ID, VITE_COINFLIP_ADDRESS  } from "./constants";

export async function checkNetwork() {
  if (window.ethereum.networkVersion != VITE_NETWORK_ID) {
    throw "Wrong network";
  }
}

export async function placeBet(choice) { // Added choice parameter
    const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    const tx = await contract.placeBet(choice, { value: ethers.utils.parseEther("0.01") }); // 0.01 ether
    await tx.wait();
}

export async function resolveBet() {
  const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
  const tx = await contract.resolveBet();
  const receipt = await tx.wait();

  // Check for the PayoutSent event in the transaction receipt
  const payoutEventTopic = contract.interface.getEventTopic("PayoutSent");
  const payoutEvent = receipt.logs.find(log => log.topics.includes(payoutEventTopic));

  const outcome = !!payoutEvent; // outcome will be true if the event exists, false otherwise

  return outcome;
}


export async function getCurrentBet(userAddress) {
    const contract = await getContractToRead(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    return await contract.bets(userAddress);
}

export async function getContractBalance() {
    return await getProvider().getBalance(VITE_COINFLIP_ADDRESS);
}
