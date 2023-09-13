// LatestFlips.jsx
import React from 'react';
import { truncateAddress, timeAgo } from './utility';


function LatestFlips({ gameHistory }) {
  return (
    <ul className='history-list'>
      {gameHistory.map((game, index) => (
        <li className='history-list-element' key={index}>

          <div className='history-list-element-info'>
            {truncateAddress(game.user_address)} called {game.choice} and {game.outcome ? <span className='win'>doubled up! 💰</span> : <span className='lose'>slipped away! 😏</span> }
          </div>
          <div>
            <span className='time'>{timeAgo(game.created_at)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default LatestFlips;
