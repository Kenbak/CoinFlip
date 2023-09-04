
import "../Style/Components/Navbar.scss";
import logo from '../assets/images/zkflogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useBalance } from 'wagmi'



function Navbar() {
  const { address, isConnected } = useAccount()
  const { data } = useBalance({
    address: address,
    watch: true,
  })

  const { disconnect } = useDisconnect()


  const truncateAddress = (address) => {
    if (!address) return "";
    const start = address.substring(0, 6); // first 6 characters
    const end = address.substring(address.length - 4); // last 4 characters
    return `${start}...${end}`;
  }



  return (
  <div className='navbar'>
    <img src={logo}  id="logo-navbar" width="50px" alt="Company Logo" />
    {isConnected ?(
      <div className="nav-right">
        <p>{parseFloat(data.formatted).toFixed(2)} {data.symbol}</p><p>|</p>
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
