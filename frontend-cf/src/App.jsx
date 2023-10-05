// src/App.js

import { useState, useEffect }  from 'react';
import './Style/App.scss';
import CoinFlip from './Components/CoinFlip';
import Navbar from './Components/Navbar';
import 'typeface-bree-serif';
import { VITE_NETWORK_ID} from "./Contract/constants";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, lightTheme} from "@rainbow-me/rainbowkit";
import { connectorsForWallets} from "@rainbow-me/rainbowkit";
import { argentWallet } from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig} from "wagmi";
import { zkSync, zkSyncTestnet } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FullLeaderboard from './Pages/FullLeaderboard';


import { getAccount } from '@wagmi/core';


const ALCHEMY_ID = import.meta.env.VITE_REACT_APP_ALCHEMY_ID;

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
const appName = "zkFlip";
const projectId = "da9c563007234557ec5ab891d1411da7";
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
  autoConnect: false,
  connectors,
  publicClient
})

const myCustomTheme = lightTheme({
  accentColor: '#FFD541',
  accentColorForeground: '#FF8B02',
  borderRadius:"small", // or 'medium' or any other allowed value
  fontStack: "system",  // or any other allowed value
  overlayBlur: "none"    // or any other allowed value
});




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
      <RainbowKitProvider chains={chains} theme={myCustomTheme}>

      <Router>
            <header className="App-header">
              <Navbar  userAddress={userAddress} setUserAddress={setUserAddress} />

              {/* Define your routes here */}
              <Routes>

              <Route path="/" element={<CoinFlip userAddress={userAddress} setUserAddress={setUserAddress} />} />
                <Route path="/leaderboard" element={<FullLeaderboard />} />
              </Routes>
            </header>
        </Router>

      </RainbowKitProvider>
    </WagmiConfig>
    </div>
  );
}

export default App;
