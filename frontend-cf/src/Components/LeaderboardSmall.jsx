// LeaderboardSmall.jsx
import { truncateAddress } from './utility'
import goldBadge from '../assets/images/Tiers/gold.svg'
import silverBadge from '../assets/images/Tiers/silver.svg'
import bronzeBadge from '../assets/images/Tiers/bronze.svg'
import platinumBadge from '../assets/images/Tiers/platinum.svg'
import emeraldBadge from '../assets/images/Tiers/emerald.svg'
import saphirBadge from '../assets/images/Tiers/saphir.svg'


function Leaderboard({ leaderboard }) {
  return (
    <table className='leaderboard-table'>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Address</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
      {leaderboard.map((entry, index) => (
                    <tr key={index}>
                        <td>
                          <div className='rank-container'>
                            {index + 1}
                            {index === 0 && <img src={goldBadge} alt="Gold Badge" className="badge-icon" />} {/* Gold for 1st */}
                            {index === 1 && <img src={silverBadge} alt="Gold Badge" className="badge-icon" />} {/* Silver for 2nd */}
                            {index === 2 && <img src={bronzeBadge} alt="Gold Badge" className="badge-icon" />} {/* Bronze for 3rd */}
                            {index === 3 && <img src={platinumBadge} alt="Gold Badge" className="badge-icon" />} {/* Star for 4th */}
                            {index === 4 && <img src={platinumBadge} alt="Gold Badge" className="badge-icon" />} {/* Star for 5th */}
                            {index >= 5 && index <= 6 && <img src={emeraldBadge} alt="Gold Badge" className="badge-icon" />} {/* Diamond for 6th to 8th */}
                            {index === 7 && <img src={saphirBadge} alt="Sapphire Badge" className="badge-icon" />} {/* Sapphire for 9th */}
                            {index === 8 && <img src={saphirBadge} alt="Sapphire Badge" className="badge-icon" />} {/* Sapphire for 9th */}
                            {index === 9 && <img src={saphirBadge} alt="Sapphire Badge" className="badge-icon" />} {/* Sapphire for 10th */}

                          </div>
                        </td>
                        <td>{truncateAddress(entry[0])}</td>
                        <td>{entry[1]}</td>
                    </tr>
                ))}
      </tbody>
    </table>
  );
}

export default Leaderboard;
