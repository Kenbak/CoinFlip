// FullLeaderboard.jsx

import { useState, useEffect } from 'react';
import { truncateAddress } from '../Components/utility';
import "../Style/Pages/FullLeaderboard.scss";
import { Link } from 'react-router-dom';
import goldBadge from '../assets/images/Tiers/gold.svg'
import silverBadge from '../assets/images/Tiers/silver.svg'
import bronzeBadge from '../assets/images/Tiers/bronze.svg'
import platinumBadge from '../assets/images/Tiers/platinum.svg'
import emeraldBadge from '../assets/images/Tiers/emerald.svg'
import saphirBadge from '../assets/images/Tiers/saphir.svg'


const BASE_API_URL = import.meta.env.DEV
? import.meta.env.VITE_REACT_APP_DEVELOPMENT_URL
: import.meta.env.VITE_REACT_APP_PRODUCTION_URL;

// Outside of your component function
function getScoreRank(leaderboard, address) {
  const sortedByScore = [...leaderboard].sort((a, b) => parseFloat(b[1].score) - parseFloat(a[1].score));
  for (let i = 0; i < sortedByScore.length; i++) {
    if (sortedByScore[i][0] === address) {
      return i;
    }
  }
  return -1;  // in case address is not found
}



function FullLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [sortColumn, setSortColumn] = useState('score'); // default sort by score
  const [sortDirection, setSortDirection] = useState('desc'); // default direction is descending
  const [activeColumn, setActiveColumn] = useState('score');


    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
      let valueA = a[1][sortColumn];
      let valueB = b[1][sortColumn];

      // Convert to numbers if the column contains numerical data
      if (['games_played', 'total_won', 'win_rate', 'total_bet', 'total_payout', 'average_payout', 'score', 'win_streak'].includes(sortColumn)) {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
    }


      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    function renderBadge(rank) {
      switch(rank) {
        case 0:
          return <img src={goldBadge} alt="Gold Badge" className="badge-icon" />;
        case 1:
          return <img src={silverBadge} alt="Silver Badge" className="badge-icon" />;
        case 2:
          return <img src={bronzeBadge} alt="Bronze Badge" className="badge-icon" />;
        case 3:
        case 4:
          return <img src={platinumBadge} alt="Platinum Badge" className="badge-icon" />;
        case 5:
        case 6:
          return <img src={emeraldBadge} alt="Emerald Badge" className="badge-icon" />;
        case 7:
        case 8:
        case 9:
          return <img src={saphirBadge} alt="Sapphire Badge" className="badge-icon" />;
        default:
          return null;
      }
    }




    function handleHeaderClick(column) {
      setActiveColumn(column); // set the active column

      if (column === 'rank') {
        if (sortColumn === 'score') {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setSortColumn('score');
          setSortDirection('desc');
        }
      } else {
        if (column === sortColumn) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setSortColumn(column);
          setSortDirection('desc');
        }
      }
    }


    function renderSortIndicator(column) {
      if (column === activeColumn) {
          return (
              <span className={`sort-indicator ${sortDirection}`}>
                  {sortDirection === 'asc' ? '▲' : '▼'}
              </span>
          );
      }
      return null;
    }







  function weiToEth(weiValue) {
    return (weiValue / 10**18).toFixed(2);  // You can adjust the number of decimal places as needed
  }


  useEffect(() => {
    // Fetch leaderboard data from API
    fetch(`${BASE_API_URL}/detailed_leaderboard`)
      .then(response => response.json())
      .then(data => setLeaderboard(data))
      .catch(error => console.error('Error fetching leaderboard:', error));
  }, []);

  return (
    <div className='container-leaderboard'>


    <div className="full-leaderboard">
      <h2>Leaderboard</h2>
      <table className="leaderboard-table">
        <thead>
        <tr>
          <th onClick={() => handleHeaderClick('rank')} className={sortColumn === 'rank' ? 'active-sort' : ''}>
              Rank {renderSortIndicator('rank')}
          </th>
          <th onClick={() => handleHeaderClick('address')} className={sortColumn === 'address' ? 'active-sort' : ''}>
              Address {renderSortIndicator('address')}
          </th>
          <th onClick={() => handleHeaderClick('games_played')} className={sortColumn === 'games_played' ? 'active-sort' : ''}>
              Games Played {renderSortIndicator('games_played')}
          </th>
          <th onClick={() => handleHeaderClick('total_won')} className={sortColumn === 'total_won' ? 'active-sort' : ''}>
              Wins {renderSortIndicator('total_won')}
          </th>
          <th onClick={() => handleHeaderClick('win_rate')} className={sortColumn === 'win_rate' ? 'active-sort' : ''}>
              Win Rate (%) {renderSortIndicator('win_rate')}
          </th>
          <th onClick={() => handleHeaderClick('win_streak')} className={sortColumn === 'win_streak' ? 'active-sort' : ''}>
              Win Streak {renderSortIndicator('win_streak')}
          </th>
          <th onClick={() => handleHeaderClick('total_bet')} className={sortColumn === 'total_bet' ? 'active-sort' : ''}>
              Total Bet (ETH) {renderSortIndicator('total_bet')}
          </th>
          <th onClick={() => handleHeaderClick('total_payout')} className={sortColumn === 'total_payout' ? 'active-sort' : ''}>
              Total Payout {renderSortIndicator('total_payout')}
          </th>
          <th onClick={() => handleHeaderClick('average_payout')} className={sortColumn === 'average_payout' ? 'active-sort' : ''}>
              Avg. Payout {renderSortIndicator('average_payout')}
          </th>
          <th onClick={() => handleHeaderClick('score')} className={sortColumn === 'score' ? 'active-sort' : ''}>
              Score {renderSortIndicator('score')}
          </th>
      </tr>

        </thead>
        <tbody>
          {sortedLeaderboard.map((entry, index) => {
            const rank = getScoreRank(leaderboard, entry[0]);

            return (
            <tr key={index}>
               <td>
              <div className="rank-container">
              {rank + 1}
             {renderBadge(rank)}
              </div>
            </td>
              <td>{truncateAddress(entry[0])}</td>
              <td>{entry[1].games_played}</td>
              <td>{entry[1].total_won}</td>
              <td style={{ color: entry[1].win_rate > 50 ? 'green' : 'red' }}>
                {entry[1].win_rate}%
              </td>
              <td>
                <div className='fire-wrapper'>
                  {entry[1].win_streak}
                  {entry[1].win_streak >= 4 ? <div className="fire-emoji">🔥</div> : ''}
                </div>
            </td>




              <td>{weiToEth(entry[1].total_bet)} ETH</td>
              <td>{entry[1].total_payout} ETH</td>
              <td>{entry[1].average_payout} ETH</td>
              <td className="score">{entry[1].score}</td>

            </tr>
            )
})}
        </tbody>
      </table>

    </div>
    <Link to="/" className='modal-link'>Back to Flipping</Link>
    </div>
  );

}

export default FullLeaderboard;
