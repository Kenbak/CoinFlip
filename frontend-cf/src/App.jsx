// src/App.js

import { useState, useEffect }  from 'react';
import './Style/App.scss';
import CoinFlip from './Components/CoinFlip';
import Navbar from './Components/Navbar';
import 'typeface-bree-serif';
import { VITE_NETWORK_ID, ALCHEMY_ID} from "./Contract/constants";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import { connectorsForWallets} from "@rainbow-me/rainbowkit";
import { argentWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig} from "wagmi";
import { zkSync, zkSyncTestnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { getAccount } from '@wagmi/core';


let chain = zkSync;
if(VITE_NETWORK_ID == "280") {
  chain = zkSyncTestnet;
}
const { chains, publicClient } = configureChains(
  [chain],
  [
    alchemyProvider({ apiKey: ALCHEMY_ID }),
    publicProvider()
  ]
);
const appName = "zkmarkets";
const projectId = "02d5a339901030c2011e352c479def50";
const { wallets: walletGroups } = getDefaultWallets({
  appName: appName,
  projectId: projectId,
  chains,
});
// Find the group you want to add the Argent wallet to
const targetGroup = walletGroups.find(group => group.groupName === "Popular");
if (targetGroup) {
  // Add the Argent wallet to the wallets array of the target group
  targetGroup.wallets.push(argentWallet({ projectId, chains }));
}
const connectors = connectorsForWallets(walletGroups);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})



function App() {
  const [userAddress, setUserAddress] = useState('');
  const account = getAccount();
  const connectedAddress = account.address;


  console.log(connectedAddress)



    useEffect(() => {
      if (connectedAddress) {
          setUserAddress(connectedAddress);
      }
  }, [connectedAddress]);


  return (
    <div className="App">
     <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>

          <header className="App-header">
          <Navbar  userAddress={userAddress} setUserAddress={setUserAddress}/>
          <CoinFlip userAddress={userAddress} setUserAddress={setUserAddress} />
          </header>

      </RainbowKitProvider>
    </WagmiConfig>
    </div>
  );
}

export default App;
