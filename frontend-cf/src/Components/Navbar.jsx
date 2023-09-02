
import "../Style/Components/Navbar.scss";
import logo from '../assets/images/zkflogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect  } from 'wagmi'



function Navbar() {
  const { address, isConnected } = useAccount()

  const { disconnect } = useDisconnect()


  const truncateAddress = (address) => {
    if (!address) return "";
    const start = address.substring(0, 6); // first 6 characters
    const end = address.substring(address.length - 4); // last 4 characters
    return `${start}...${end}`;
  }



  return (
  <div className='navbar'>
    <img src={logo}  id="logo-navbar" width="40px" alt="Company Logo" />
    {isConnected ?(
      <div className="nav-right">
        <p>{truncateAddress(address)}</p>
        <button onClick={disconnect} className="game-button">
          Disconnect
        </button>
      </div>

    ) :

      (<div className='connect'>
        <ConnectButton />
      </div>)
    }
  </div>
);
}

export default Navbar;
