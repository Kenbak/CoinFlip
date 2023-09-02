import { useState, useEffect } from 'react';
import axios from 'axios';
import "../Style/Components/Coinflip.scss";
import logo from '../assets/images/zkflogo.png'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect  } from 'wagmi'
import { ethers } from "ethers";
import { checkNetwork, placeBet, resolveBet, getCurrentBet, getContractBalance, isUserWhitelisted } from "../Contract/BetFunction";
import Confetti from 'react-confetti';



const BASE_API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_REACT_APP_DEVELOPMENT_URL
  : import.meta.env.VITE_REACT_APP_PRODUCTION_URL;



function CoinFlip() {

  const [betAmount, setBetAmount] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loadingStage, setLoadingStage] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const { address, isConnected } = useAccount()
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(true);
  const [showFunFact, setShowFunFact] = useState(false);
  const [lastFactIndex, setLastFactIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);








  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (address) {
        const status = await isUserWhitelisted(address);
        setIsWhitelisted(status);
      }
    };

    checkWhitelistStatus();
  }, [address]);



  useEffect(() => {
    const fetchGameHistory = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}`); // Assuming the index action is at this endpoint
            setGameHistory(response.data);
        } catch (error) {
            console.error("Error fetching game history:", error);
        }
    };

    fetchGameHistory();
}, []);



const MAX_RETRIES = 5; // Maximum number of retries
const RETRY_INTERVAL = 15000; // Retry every 5 seconds


  const [selectedBet, setSelectedBet] = useState(null);

  const handleOptionChange = (value) => {
    if (selectedOption === value) {
      setSelectedOption(null); // Deselect the option if it's clicked again
    } else {
      setSelectedOption(value);
    }
};

useEffect(() => {
  if (!isConnected) {
      resetGame();
  }
}, [isConnected]);




  const resetGame = () => {
    setBetAmount(null);
    setSelectedOption(null);
    setSelectedBet(null);
    setResult(null);
    setLoading(false);
    setLoadingStage(null);
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
    setIsWhitelisted(false);
    setShowGameHistory(true);
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowGameHistory(false);

    if (selectedOption === null || betAmount === null) {
        alert("Please select the bet amount and choose Heads or Tails!");
        return;
    }

    try {
        setLoading(true);
        setLoadingStage('confirmation');
        await checkNetwork();
        const userIsWhitelisted = await isUserWhitelisted(address);
        await placeBet(selectedOption, userIsWhitelisted);

        setLoadingStage('flipping');
        await new Promise(resolve => setTimeout(resolve, 7000));

        let retries = 0;
        let resolved = false;
        let outcome;

        while (retries < MAX_RETRIES && !resolved) {
          try {
              outcome = await resolveBet();
              resolved = true;
          } catch (error) {
              retries++;
              if (retries === 1) {
                  setLoadingStage('flipping');
                  // Add the fun fact here
                  setShowFunFact(true);
              } else if (retries === 2) {
                  setLoadingStage('retrying');
              } else if (retries === 3) {
                  setLoadingStage('almostThere');
              } else if (retries === 4) {
                  setLoadingStage('finalizing');
              }
              if (retries < MAX_RETRIES) {
                  await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
              }
          }
      }

        if (!resolved) {
            throw new Error("Failed to resolve bet after multiple attempts.");
        }

        const choiceString = selectedOption === 0 ? "heads" : "tails";
        await axios.post(`${BASE_API_URL}`, {
            user_address: address,
            bet_amount: betAmount,
            choice: choiceString,
            outcome: outcome
        });

        setResult({ outcome: outcome });
        setLoading(false);
        setLoadingStage(null);

        const updatedHistory = await axios.get(`${BASE_API_URL}`);
        setGameHistory(updatedHistory.data);

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

    const getChoiceString = (option) => {
      return option === 0 ? "Heads" : "Tails";
    };

    const coinFacts = [
      "The study of coins is called 'numismatics.'",
      "The first coins were made in 600 B.C. in Lydia, modern-day Turkey.",
      "The ridges on the edges of coins are called 'reeding.'",
      "The U.S. Mint produces over 13 billion coins annually.",
      "The 'heads' side of a coin is technically called the 'obverse.'",
      "The world's largest coin weighs over 2,200 pounds and is made of pure gold!",
      "Coins have been used as a form of currency for over 2,600 years.",
      "The 'tails' side of a coin is known as the 'reverse.'",
      "Ancient Romans made coins with ridges to prevent counterfeiting.",
      "The U.S. penny has been in circulation since 1793, making it one of the oldest coins still in use."
  ];

  const getRandomFact = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * coinFacts.length);
    } while (newIndex === lastFactIndex);
    return coinFacts[newIndex];
  };


  useEffect(() => {
    if (loadingStage === 'flipping' && showFunFact) {
      const newFact = getRandomFact();
      setLastFactIndex(coinFacts.indexOf(newFact));
    }
  }, [loadingStage, showFunFact]);



  useEffect(() => {
    if (result && result.outcome) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Stop showing confetti after 5 seconds
    }
}, [result]);




  return (
    <div>
      {showConfetti && <Confetti />}
    <div className='header'>
      <img src={logo}  id="logo" width="60px" alt="Company Logo" />
      <h2 className='title'>zkFlip</h2>
    </div>
    <p className='tagline'>Flip it 'til you make it!</p>

    {!isConnected ? (
      <div className='container'>
        <div className='game-infos'>
          <p className='mb-0'>Connect your wallet to flip!</p>
          <div className='connect'>
            <ConnectButton />
          </div>

        </div>
        <div className="game-history">
          <p>LATEST FLIPS</p>
          <ul className='history-list'>
              {gameHistory.map((game, index) => (
                  <li key={index}>
                        {game.user_address} called {game.choice} with {(game.bet_amount/ 1e18).toFixed(2)} ETH and {game.outcome ? <span className='win'>doubled up! 💰</span>: <span className='lose'>slipped away! 😏</span>}
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
                  className={`option ${selectedOption === 0 ? "selected" : ""}`}
                  onClick={() => handleOptionChange(0)} // 0 for Heads
                >
                  Heads
                </div>
                <div
                  className={`option ${selectedOption === 1 ? "selected" : ""}`}
                  onClick={() => handleOptionChange(1)} // 1 for Tails
                >
                  Tails
                </div>
                </div>
              </div>

              <div className='options'>
                <label>FOR</label>
                {isWhitelisted ? (
                  <div  className={`option ${selectedBet === 0.01e18 ? "selected" : ""}`} onClick={selectBetAmount}>Offered</div>
                ) : (
                  <button type="button" className={`option ${selectedBet === 0.01e18 ? "selected" : ""}`} onClick={selectBetAmount}>0.01 ETH</button>
                )}
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
                <p className='mb-0 uppercase confirmation'>Waiting for Confirmation...</p>
                <p className='m-0 uppercase confirmation'>{getChoiceString(selectedOption)} FOR {(betAmount / 1e18).toFixed(2)} ETH</p>
              </div>
            )}

          {loadingStage === 'flipping' && (
              <div className='loading-stage'>
                  <p className='m-0 uppercase'>FLIPPING...</p>
                  {showFunFact ? (
                      <p className='fact'>Fun Fact: {getRandomFact()}</p>
                  ) : (
                      <p className='fact'>Please wait. This may take a moment. Do not leave or refresh.</p>
                  )}
              </div>
          )}

            {loadingStage === 'retrying' && (
              <div className='loading-stage'>
                <p className='m-0 '>Still trying... Hang tight!</p>
                <p className='fact'> Fun Fact: {getRandomFact()}</p>

              </div>
            )}

            {loadingStage === 'almostThere' && (
              <div className='loading-stage'>
                <p className='m-0 '>Almost there... Just a bit longer!</p>
                <p className='fact'> Fun Fact: {getRandomFact()}</p>

              </div>
            )}

            {loadingStage === 'finalizing' && (
              <div className='loading-stage'>
                <p className='m-0 uppercase'>Finalizing results... Get ready!</p>
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
                {isWhitelisted ? (
                <p className='lose'>Better luck next time!</p>
                ) : (
                  <p className='lose'>{(betAmount / 1e18).toFixed(2)} ETH</p>
                )}
                <button onClick={handleTryAgain} className='game-button'>TRY AGAIN</button>
              </div>
            )}
          </div>
        )}
        {showGameHistory && (
        <div className="game-history">
          <p>LATEST FLIPS</p>
          <ul className='history-list'>
            {gameHistory.map((game, index) => (
                <li key={index}>
                      {game.user_address} called {game.choice} with {(game.bet_amount/ 1e18).toFixed(2)} ETH and {game.outcome ? <span className='win'>doubled up! 💰</span>: <span className='lose'>slipped away! 😏</span>}
                </li>
              ))}
          </ul>
        </div>
        )}
      </>
    )}
  </div>
);
}

export default CoinFlip;
