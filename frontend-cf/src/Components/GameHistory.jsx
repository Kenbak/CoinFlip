
// GameHistory.jsx
import React from 'react';
import LatestFlips from './LatestFlips';
import Leaderboard from './LeaderboardSmall';

function GameHistory({ activeTab, gameHistory, leaderboard, setActiveTab }) {
  return (
    <div className="game-history">
      <div className='tabs-title'>
        <p
          className={`history-title ${activeTab === 'latestFlips' ? 'active' : 'inactive'}`}
          onClick={() => setActiveTab('latestFlips')}
        >
          LATEST FLIPS
        </p>
        <p className="history-title">|</p>
        <p
          className={`history-title ${activeTab === 'leaderboard' ? 'active' : 'inactive'}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          LEADERBOARD
        </p>
      </div>

      {activeTab === 'latestFlips' ? (
        <LatestFlips gameHistory={gameHistory} />
      ) : (
        <Leaderboard leaderboard={leaderboard} />
      )}
    </div>
  );
}

export default GameHistory;
