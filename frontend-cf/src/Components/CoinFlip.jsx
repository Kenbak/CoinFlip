import { useState, useEffect } from 'react';
import axios from 'axios';
import "../Style/Components/Coinflip.scss";
import logo from '../assets/images/zkflogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect  } from 'wagmi'
import { ethers } from "ethers";
import { checkNetwork, placeBet, payoutWinner, getCurrentBet, getContractBalance } from "../Contract/BetFunction";



function CoinFlip() {

  const [betAmount, setBetAmount] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loadingStage, setLoadingStage] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const { address, isConnected } = useAccount()

  useEffect(() => {
    const fetchGameHistory = async () => {
        try {
            const response = await axios.get('http://localhost:3000/games'); // Assuming the index action is at this endpoint
            setGameHistory(response.data);
        } catch (error) {
            console.error("Error fetching game history:", error);
        }
    };

    fetchGameHistory();
}, []);





  const [selectedBet, setSelectedBet] = useState(null);

  const handleOptionChange = (value) => {
    if (selectedOption === value) {
      setSelectedOption(null); // Deselect the option if it's clicked again
    } else {
      setSelectedOption(value);
    }

  };

  const resetGame = () => {
    setBetAmount(null);
  setSelectedOption(null);
  setSelectedBet(null); // Reset the selected bet amount
  setResult(null);
  };

  const selectBetAmount = () => {
    if (selectedBet === 0.01e18) {
      setSelectedBet(null); // Deselect the bet amount if it's clicked again
      setBetAmount(null);
    } else {
      setSelectedBet(0.01e18);
      setBetAmount(0.01e18); // Set bet amount to 0.01 ETH in wei
    }// Set bet amount to 0.01 ETH in wei
  };

  const handleTryAgain = () => {
    resetGame();
  };




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOption || !betAmount) {
      alert("Please select the bet amount and choose Heads or Tails!");
      return;
    }

    try {
      setLoading(true);
      setLoadingStage('confirmation');
       // First, check if user is connected to the correct network
       await checkNetwork();
       // Place the bet on the Ethereum blockchain
       await placeBet();

      setLoadingStage('flipping');
      // Introduce another delay for the flipping animation
      await new Promise(resolve => setTimeout(resolve, 3000));

       // Get the result from the server (This assumes your backend server is still validating the game result)
      const response = await axios.post('http://localhost:3000/games', {
        user_address: address,
        bet_amount: betAmount,
        choice: selectedOption
      });

      setResult(response.data);
      setLoading(false);

      setLoadingStage(null);
      const updatedHistory = await axios.get('http://localhost:3000/games');
      setGameHistory(updatedHistory.data);

      if (response.data.outcome) {
        // If the user won, trigger the payout
        await payoutWinner(address);
      }
    } catch (error) {
      setLoading(false);
      setLoadingStage(null);
      if (error.response && error.response.data) {
        console.error("Error:", error.response.data);
      } else {
        console.error("Error:", error.message);
      }
    }
  };


  return (
    <div>

    <div className='header'>
      <img src={logo}  id="logo" width="60px" alt="Company Logo" />
      <h2 className='title'>zkFlip</h2>
    </div>
    <p className='tagline'>Flip it 'til you make it!</p>

    {!isConnected ? (
      <div className='container'>
        <div className='game-infos'>
          <p className='mb-0'>Connect your wallet to flip!</p>
          <div className='game-button'>
            <ConnectButton />
          </div>

        </div>
        <div className="game-history">
          <p>LATEST FLIPS</p>
          <ul className='history-list'>
              {gameHistory.map((game, index) => (
                  <li key={index}>
                        {game.user_address} called {game.choice} with {(game.bet_amount/ 1e18).toFixed(2)} ETH on and {game.outcome ? <span className='win'>doubled up! 💰</span>: <span className='lose'>slipped away! 😏</span>}
                  </li>
              ))}
          </ul>
        </div>
      </div>
    ) : (
      <>
        {!result && !loading && (

          <form onSubmit={handleSubmit}>
            {/* <label>
              Ethereum Address:
              {address}
            </label> */}
            <div className='game-infos'>

              <div className='options'>
                <label>I PICK...</label>
                <div className='inputs'>
                  <div
                  className={`option ${selectedOption === "heads" ? "selected" : ""}`}
                  onClick={() => handleOptionChange("heads")}
                  >
                  Heads
                  </div>
                  <div
                  className={`option ${selectedOption === "tails" ? "selected" : ""}`}
                  onClick={() => handleOptionChange("tails")}
                  >
                  Tails
                  </div>
                </div>
              </div>

              <div className='options'>
                <label>FOR</label>
                <button type="button"  className={`option ${selectedBet === 0.01e18 ? "selected" : ""}`}  onClick={selectBetAmount}>0,01 ETH</button>
              </div>
              <button className='game-button' type="submit">Double or Nothing</button>
            </div>
          </form>
        )}

        {loading && (
          <div className='game-infos'>
            <img src={logo} id="flip-logo" width="60px" alt="Company Logo" />

            {loadingStage === 'confirmation' && (
              <div className='loading-stage'>
                <p className='mb-0 uppercase'>Waiting for Confirmation...</p>
                <p className='m-0 uppercase'>{selectedOption} FOR {(betAmount / 1e18).toFixed(2)} ETH</p>
              </div>
            )}

            {loadingStage === 'flipping' && (
              <div className='loading-stage'>
                <p className='m-0 uppercase'>FLIPPING...</p>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className='game-infos'>

            {result.outcome ? (
              <div>
                <p className='mb-0'>YOU WON</p>
                <p className='win'>{(betAmount / 1e18).toFixed(2)} ETH</p>
                <button className='game-button' onClick={handleTryAgain}>TRY AGAIN</button>
              </div>
            ) : (
              <div>
                <p className='mb-0'>YOU LOST</p>
                <p className='lose'>{(betAmount / 1e18).toFixed(2)} ETH</p>
                <button onClick={handleTryAgain} className='game-button'>TRY AGAIN</button>
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>
);
}

export default CoinFlip;
