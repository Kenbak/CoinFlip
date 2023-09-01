import { ethers } from "ethers";
import { getContractToWrite, getContractToRead, getProvider } from "./interact";
import CoinFlipABI from "./CoinFlip.abi.json";
import { VITE_NETWORK_ID, VITE_COINFLIP_ADDRESS  } from "./constants";

export async function checkNetwork() {
  if (window.ethereum.networkVersion != VITE_NETWORK_ID) {
    throw "Wrong network";
  }
}

export async function placeBet() {
    const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    const tx = await contract.placeBet({ value: ethers.utils.parseEther("0.01") }); // 0.01 ether
    await tx.wait();
}

export async function payoutWinner(winnerAddress) {
    const contract = await getContractToWrite(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    const tx = await contract.payoutWinner(winnerAddress);
    await tx.wait();
}

export async function getCurrentBet(userAddress) {
    const contract = await getContractToRead(VITE_COINFLIP_ADDRESS, CoinFlipABI);
    return await contract.bets(userAddress);
}

export async function getContractBalance() {
    return await getProvider().getBalance(VITE_COINFLIP_ADDRESS);
}
