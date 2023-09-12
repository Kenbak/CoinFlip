
import "../Style/Components/Navbar.scss";
import logo from '../assets/images/zkflogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { truncateAddress } from './utility'




function Navbar() {
  const { address, isConnected } = useAccount()
  const { data, isError, isLoading } = useBalance({
    address: address,
    watch: true,
  })

  const { disconnect } = useDisconnect()



  return (
    <div className='navbar'>
      <img src={logo}  id="logo-navbar" width="50px" alt="Company Logo" />
      {isConnected ? (
        <div className="nav-right">
          {isLoading && <p>Fetching balance...</p>}
          {isError && <p>Error fetching balance</p>}
          {data && (
            <>
              <p>{parseFloat(data.formatted).toFixed(2)} {data.symbol}</p>
              <p id="none">|</p>
              <p>{truncateAddress(address)}</p>
            </>
          )}
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
