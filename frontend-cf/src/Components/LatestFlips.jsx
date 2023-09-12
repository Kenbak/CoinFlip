// LatestFlips.jsx
import React from 'react';
import { truncateAddress } from './utility'


function LatestFlips({ gameHistory }) {
  return (
    <ul className='history-list'>
      {gameHistory.map((game, index) => (
        <li className='history-list-element' key={index}>
          {truncateAddress(game.user_address)} called {game.choice} with {(game.bet_amount / 1e18).toFixed(2)} ETH and {game.outcome ? <span className='win'>doubled up! 💰</span> : <span className='lose'>slipped away! 😏</span>}
        </li>
      ))}
    </ul>
  );
}

export default LatestFlips;
