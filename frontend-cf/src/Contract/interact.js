import { ethers } from "ethers";

import { Wallet, Provider, Web3Provider, Contract } from "zksync-web3";

import { VITE_NETWORK_ID } from "./constants";

export async function getContractToRead(contractAddress, abi) {
  try {
    const provider = getProvider()
    const contract = new Contract(contractAddress, abi, provider);
    return contract
  } catch (error) {
    console.error("err getContractToRead", error);
    throw error;
  }
}

export async function getContractToWrite(contractAddress, abi) {
  try {
    if (typeof window.ethereum !== "undefined" && window.ethereum) {
      await window.ethereum.enable();
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(contractAddress, abi, signer);
      return contract
    } else {
      throw new Error("Metamask not detected");
    }
  } catch (error) {
    console.error("err getContractToWrite", error);
    throw error;
  }
}
export function getProvider() {
  if (parseInt(VITE_NETWORK_ID || "0") == 324) {
    return new Provider("https://zksync2-mainnet.zksync.io")
  }
  return new Provider("https://zksync2-testnet.zksync.dev")
}
