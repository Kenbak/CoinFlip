
import "../Style/Components/Navbar.scss";
import logo from '../assets/images/zkflogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect  } from 'wagmi'



function Navbar({ userAddress, setUserAddress }) {
  const { address, isConnected } = useAccount()

  const { disconnect } = useDisconnect()


  return (
  <div className='navbar'>
    <img src={logo}  id="logo-navbar" width="40px" alt="Company Logo" />
    {isConnected ?(
      <div>
        <p>{address}</p>
        <button onClick={disconnect} className="game-button">
          Disconnect
        </button>
      </div>

    ) :

      (<div className='game-button'>
        <ConnectButton />
      </div>)
    }
  </div>
);
}

export default Navbar;
