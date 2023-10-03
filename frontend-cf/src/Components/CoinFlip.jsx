import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import axios from 'axios';
import "../Style/Components/Coinflip.scss";
import logo from "../assets/images/zkflogo.png"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect  } from 'wagmi';
import 'react-toastify/dist/ReactToastify.css';
import {
  checkNetwork,
  placeBet,
  isUserWhitelisted,
  claimReward,
  getResult
} from "../Contract/BetFunction";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import FAQModal from './FaqModal';
import HowToPlayModal from './HowToPlayModal';
import GameHistory from './GameHistory';
import { ToastContainer, toast } from 'react-toastify';
import Confetti from 'react-confetti';



  const BASE_API_URL = import.meta.env.DEV
  ? import.meta.env.VITE_REACT_APP_DEVELOPMENT_URL
  : import.meta.env.VITE_REACT_APP_PRODUCTION_URL;



  const MAX_RETRIES = 10; // Maximum number of retries
  const RETRY_INTERVAL = 8000; // Retry every 10 seconds




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
  const [open, setOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('latestFlips');
  const [selectedBet, setSelectedBet] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenFaq = () => setOpenFaq(true);
  const handleCloseFaq = () => setOpenFaq(false);

  const toastConfig = {
    position: toast.POSITION.BOTTOM_RIGHT,
    autoClose: true
};

    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    const handleFetchError = (error, customMessage) => {
        console.error("Error:", error.message || error);
        toast.error(customMessage || error.message, toastConfig);
    };

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            fetchData(`${BASE_API_URL}/leaderboard`, setLeaderboard);
        } else if (activeTab === 'latestFlips') {
            fetchData(`${BASE_API_URL}`, setGameHistory);
        }
    }, [activeTab]);

    useEffect(() => {
      if (address) {
          isUserWhitelisted(address).then(status => {
              setIsWhitelisted(status);
              if (status) {
                  const whitelistedBetAmount = ethers.utils.parseEther('0.005');
                  setSelectedBet(whitelistedBetAmount);
                  setBetAmount(whitelistedBetAmount);
              }
          });
      }
  }, [address]);





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
    setIsWhitelisted(false);
    setShowGameHistory(true);
};


const selectBetAmount = (amount) => {
  const amountInWei = ethers.utils.parseEther(amount.toString());
  if (selectedBet?.toString() === amountInWei.toString()) {
      setSelectedBet(null); // Deselect the bet amount if it's clicked again
      setBetAmount(null);
  } else {
      setSelectedBet(amountInWei); // Set selected bet amount in Wei
      setBetAmount(amountInWei); // Set bet amount in Wei
  }
};




  const handleTryAgain = () => {
    resetGame();
    fetchData(`${BASE_API_URL}/leaderboard`, setLeaderboard);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowGameHistory(false);

    if (selectedOption === null || betAmount === null) {
        resetGame();

        toast.warn("Please select the bet amount and choose Heads or Tails!", {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: true
        })
        return;
    }

    try {
        setLoading(true);
        setLoadingStage('confirmation');
        try {await checkNetwork();
        }
        catch (error){
          toast.warn("You're on the wrong network. Please switch to the correct network.", {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: true
          })

        }
        const userIsWhitelisted = await isUserWhitelisted(address);

      try{
        await placeBet(selectedOption, userIsWhitelisted, ethers.utils.formatEther(selectedBet));
        toast.info('Bet Placed!', {
          position: toast.POSITION.BOTTOM_RIGHT})

        } catch (error) {

        resetGame()
        console.error("Error placing bet in CoinFlip Front:", error);
        // alert(error.error.data.message);
        if (error && error.error && error.error.data && error.error.data.message) {
          let errorMessage = error.error.data.message;
          if (errorMessage === "execution reverted: Claim your previous winnings first") {
              errorMessage = "ERROR: Claim your previous winnings first!";
          }
          toast.error(errorMessage, {
              position: toast.POSITION.BOTTOM_RIGHT
          });
      } else {
        let errorMessage = error.data.message;
        if (errorMessage === "insufficient balance for transfer") {
          errorMessage = "Insufficient balance to place bet!";
      }
        toast.error(errorMessage, {
          position: toast.POSITION.BOTTOM_RIGHT
      });
      }
        return; // Stops execution here
       }

        setLoadingStage('flipping');
        await new Promise(resolve => setTimeout(resolve, 6000));

        let retries = 0;
        let resolved = false;
        let outcome;

         console.log("Bet Placed, Checking Results")

        while (retries < MAX_RETRIES && !resolved) {
          try {
            outcome = await getResult(address);
            console.log(outcome)

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
        console.log("Outcome after the while loop",outcome)

        const choiceString = selectedOption === 0 ? "heads" : "tails";
        await axios.post(`${BASE_API_URL}`, {
          user_address: address,
          bet_amount: parseFloat(ethers.utils.formatEther(betAmount)), // Convert betAmount to decimal string and then to float
          choice: choiceString,
          outcome: outcome,
          // If outcome is true, payout is double the betAmount, else it's null
          payout: outcome ? parseFloat(ethers.utils.formatEther(betAmount.mul(2))) : null
      });


        setResult({ outcome: outcome });
        setLoading(false);
        setLoadingStage(null);

        fetchData(`${BASE_API_URL}`, setGameHistory);
      } catch (error) {
          handleFetchError(error);
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
      "The U.S. penny has been in circulation since 1793, making it one of the oldest coins still in use.",
      "zkSync is a layer 2 scaling solution for Ethereum, making transactions faster and cheaper.",
      "Cryptocurrencies use cryptographic functions to secure transactions and control new coin creations.",
      "Blockchain transactions are added in blocks, creating a continuous 'chain' of data.",
      "The word 'cryptocurrency' comes from the term 'cryptography,' meaning secret writing.",
      "The total value of all cryptocurrencies surpassed $2 trillion in 2021!",
      "In ancient times, people used tools, jewelry, or even salt as a form of money before coins.",
      "The technology behind zkSync is called 'zkRollups,' providing scalable, low-cost transactions on Ethereum.",
      "Vitalik Buterin was only 19 when he proposed the idea of Ethereum in late 2013.",
      "One of the earliest forms of money in China was shaped like a knife!",
      "NFT stands for Non-Fungible Token, a unique digital asset verified on a blockchain.",
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

  console.log('Selected Bet:', selectedBet?.toString());

  useEffect(() => {
    // Define a function to fetch the whitelisting status
    const fetchWhitelistStatus = async () => {
        if (address) {
            const status = await isUserWhitelisted(address);
            setIsWhitelisted(status);
        }
    };

    // Call the function immediately to get the initial status
    fetchWhitelistStatus();

    // Set up an interval to periodically check the status
    const intervalId = setInterval(fetchWhitelistStatus, 10000); // checks every 10 seconds

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [address]);

  const handleClaimAndReset = async () => {
    try {
        await claimReward(); // Call the claimReward function from BetFunctions

        toast.success('Reward Claimed!', {
          position: toast.POSITION.BOTTOM_RIGHT
      });
      fetchData(`${BASE_API_URL}/leaderboard`, setLeaderboard);
    } catch (error) {

        toast.error(error.error.data.message, {
          position: toast.POSITION.BOTTOM_RIGHT
      });
    }
  };





  const generateTweetURL = (payout, betAmount, choice) => {
    const base = "https://twitter.com/intent/tweet?";
    const tweetText = `text=${encodeURIComponent(`I just turned a ${betAmount} ETH bet on ${choice} into a ${payout} ETH win on @zk_flip! 💥 \n\n Dare to flip? You could be next: \n 👉 https://www.zkflip.bet 🎲💰 \n\n #zkFlip #DareToFlip`)}`;

    return base + tweetText
  }



  return (
    <>

      {showConfetti && <Confetti
       width={window.innerWidth}
        height={window.innerHeight} />}
    <div>
      <ToastContainer theme="colored" />
    <div className='header'>
      {/* <img src={logo}  id="logo" width="60px" alt="Company Logo" /> */}
      <h2 className='title'>zkFlip</h2>
    </div>
    <p className='tagline'>Flip it 'til you make it!</p>



    {!isConnected ? (
      <div className='container'>
        <div className='game-infos'>
          <p className='mb-0 confirmation'>Connect your wallet to flip!</p>
          <div className='connect'>
            <ConnectButton />
          </div>

        </div>


        <a href="https://twitter.com/zk_flip" rel="noreferrer" target='_blank' className='modal-link social'>
            <FontAwesomeIcon icon={faTwitter} />
        </a>


        <GameHistory
              activeTab={activeTab}
              gameHistory={gameHistory}
              leaderboard={leaderboard}
              setActiveTab={setActiveTab}
            />

        <div className='footer'>
          <p className='modal-link' onClick={handleOpen}>How to Play</p>
          <HowToPlayModal
            isOpen={open}
            handleClose={handleClose}
          />
          <p>|</p>
          <p className='modal-link' onClick={handleOpenFaq}>FAQ</p>
          <FAQModal
            isOpen={openFaq}
            handleClose={handleCloseFaq}
          />
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
            <div className='game-infos' style={{ width: isWhitelisted ? '300px' : '375px' }}>

              {isWhitelisted && (<h1 className='wl-title'>Whitelist Flip</h1>)}
              <div className='options'>
                <label>I PICK...</label>
                <div className='inputs'>
                <div
                  className={`option choice ${selectedOption === 0 ? "selected" : ""}`}
                  onClick={() => handleOptionChange(0)} // 0 for Heads

                >
                  Heads
                </div>
                <div
                  className={`option choice ${selectedOption === 1 ? "selected" : ""}`}
                  onClick={() => handleOptionChange(1)} // 1 for Tails

                >
                  Tails
                </div>
                </div>
              </div>

              <div className='options'>
                <label>FOR</label>
                {isWhitelisted ? (
                   <div className='option-wl bet selected'>
                   Offered (0.005 ETH)
                  </div>
                ) : (
                <div className='inputs' id="bets">
                  <button type="button"
                    className={`option bet ${selectedBet?.toString() === ethers.utils.parseEther('0.005').toString() ? "selected" : ""}`}
                    onClick={() => selectBetAmount(0.005)}>
                    0.005 ETH
                  </button>
                  <button type="button"
                    className={`option bet ${selectedBet?.toString() === ethers.utils.parseEther('0.01').toString() ? "selected" : ""}`}
                    onClick={() => selectBetAmount(0.01)}>
                    0.01 ETH
                  </button>
                  <button type="button"
                    className={`option bet ${selectedBet?.toString() === ethers.utils.parseEther('0.025').toString() ? "selected" : ""}`}
                    onClick={() => selectBetAmount(0.025)}>
                    0.025 ETH
                  </button>



                </div>
                )}
              </div>
              <button className='game-button' id="start-game" type="submit">Double or Nothing</button>
            </div>
          </form>
        )}

        {loading && (
          <div className='game-infos'>
            <img src={logo} id="flip-logo" width="60px" alt="Company Logo" />

            {loadingStage === 'confirmation' && (
              <div className='loading-stage'>
                <p className='mb-0 uppercase confirmation'>Waiting for Confirmation...</p>
                <p className='m-0 uppercase confirmation'>{getChoiceString(selectedOption)} FOR {Number(ethers.utils.formatEther(betAmount || '0')).toFixed(3)} ETH</p>


              </div>
            )}

          {loadingStage === 'flipping' && (
              <div className='loading-stage'>
                  <p className='m-0 uppercase confirmation'>FLIPPING...</p>
                  {showFunFact ? (
                      <p className='fact'>Fun Fact: {getRandomFact()}</p>
                  ) : (
                      <p className='fact'>Please wait. This may take a moment. Do not leave or refresh.</p>
                  )}
              </div>
          )}

            {loadingStage === 'retrying' && (
              <div className='loading-stage'>
                <p className='m-0 confirmation '>Coin is flipping... Hang tight!</p>
                <p className='fact'> Fun Fact: {getRandomFact()}</p>

              </div>
            )}

            {loadingStage === 'almostThere' && (
              <div className='loading-stage'>
                <p className='m-0 confirmation'>Almost there... Just a bit longer!</p>
                <p className='fact'> Fun Fact: {getRandomFact()}</p>

              </div>
            )}

            {loadingStage === 'finalizing' && (
              <div className='loading-stage'>
                <p className='m-0 uppercase confirmation'>Finalizing results... Get ready!</p>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className='game-infos'>

            {result.outcome ? (
              <div className='result-info'>
                <p className='confirmation'>Congratulations! 🎊</p>
                <p className='mb-0 confirmation'>YOU WON</p>
                <p className='win confirmation'>{(betAmount / 1e18).toFixed(3)} ETH</p>

                <div className='button-wrapper'>
                  <button className='game-button' onClick={handleClaimAndReset}>Claim Rewards</button>
                  <a
                    href={generateTweetURL(((betAmount / 1e18).toFixed(3)) * 2, (betAmount / 1e18).toFixed(2), getChoiceString(selectedOption))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='twitter-share-button tweet-button'>
                      Tweet Your Win!
                  </a>
                  <button className="try-again-button" onClick={handleTryAgain}>Play Again</button>
                </div>
              </div>
            ) : (
              <div className='result-info'>
                <p className='confirmation'>So close! 😢 <br />Better luck next time!</p>
                <p className='mb-0 confirmation'>YOU LOST</p>
                {isWhitelisted ? (
                <p className='lose'>Nothing</p>
                ) : (
                  <p className='lose confirmation'>{(betAmount / 1e18).toFixed(3)} ETH</p>
                )}
                <button onClick={handleTryAgain} className='game-button '>TRY AGAIN</button>
              </div>
            )}
          </div>
        )}
        {showGameHistory && (
        <div className='container'>
          <GameHistory
            activeTab={activeTab}
            gameHistory={gameHistory}
            leaderboard={leaderboard}
            setActiveTab={setActiveTab}
          />
          <div className='social'>
            <a href="https://twitter.com/zk_flip" rel="noreferrer" target='_blank' className='modal-link '>
            <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://discord.gg/wPZZRpE5Uj" rel="noreferrer" target='_blank' className='modal-link'>
            <FontAwesomeIcon icon={faDiscord} />
            </a>
          </div>

          <div className='footer'>
            <p className='modal-link' onClick={handleOpen}>How to Play</p>
            <HowToPlayModal
              isOpen={open}
              handleClose={handleClose}
            />
            <p>|</p>
            <p className='modal-link' onClick={handleOpenFaq}>FAQ</p>
            <FAQModal
              isOpen={openFaq}
              handleClose={handleCloseFaq}
            />
          </div>
        </div>

        )}
      </>
    )}
  </div>
    </>
);
}

export default CoinFlip;
