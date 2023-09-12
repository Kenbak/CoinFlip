// FAQModal.jsx
import React from 'react';
import ModalComponent from './ModalComponent';
import goldBadge from '../assets/images/Tiers/gold.svg'
import silverBadge from '../assets/images/Tiers/silver.svg'
import bronzeBadge from '../assets/images/Tiers/bronze.svg'
import platinumBadge from '../assets/images/Tiers/platinum.svg'
import emeraldBadge from '../assets/images/Tiers/emerald.svg'
import saphirBadge from '../assets/images/Tiers/saphir.svg'


function FAQModal({ isOpen, handleClose }) {
  const content = (
    <>
      <h4  className='mb-0'>What is zkFlip (ZKF)?</h4>
      zkFlip is a smart contract game on zkSync where players can bet their ETH on a simple coin flip. Players have a 50/50 chance to double their bet or lose it, with a house edge of 5%.



      <h4 className='mb-0'>How do I know I can trust ZKF?</h4>
      zkFlip operates transparently on the zkSync platform. Every transaction is on-chain and can be audited by anyone, ensuring utmost transparency and trustworthiness.


      <h4 className='mb-0'>How and when can I claim my winnings?</h4>
      If you win, you'll be able claim your reward. Always ensure to claim your previous winnings before placing a new bet. If you forgot, you can always do it via the contract directly.

      <h4 className='mb-0'>Are there any special rewards for top players?</h4>
      Yes! At zkFlip, we recognize and reward our top players with special badges:<br />
      - <img src={goldBadge} alt="Gold Badge" className="badge-icon" /> Gold Tier <br />
      - <img src={silverBadge} alt="Gold Badge" className="badge-icon" /> Silver Tier <br />
      - <img src={bronzeBadge} alt="Gold Badge" className="badge-icon" /> Bronze Tier <br />
      - <img src={platinumBadge} alt="Gold Badge" className="badge-icon" /> Platinum Tier <br />
      - <img src={emeraldBadge} alt="Gold Badge" className="badge-icon" /> Emerald Tier <br />
      -  <img src={saphirBadge} alt="Gold Badge" className="badge-icon" /> Saphire Tier <br /> <br />

      These badges are a testament to the skill and dedication of our top players and are displayed proudly next to their names on the leaderboard. Our top flippers stand a chance to receive exclusive rewards.



      <h4 className='mb-0'>Is there a referral program?</h4>
      We're in the process of developing a referral program to reward our loyal players. By introducing friends to zkFlip, you'll have the opportunity to earn bonuses and special rewards.

      <h4 className='mb-0'>The website is down. Can I still play zkFlip?</h4>
      Absolutely! zkFlip operates entirely on-chain. Even if the website faces downtime, you can still place your bets directly via the contract. This ensures uninterrupted gameplay and complete transparency.

      <h4 className='mb-0'>Where can I learn more or get support?</h4>
      Follow us on Twitter! We will assist and answer any further questions you might have.
  </>
  );
  return <ModalComponent title="Frequently Asked Questions" content={content} isOpen={isOpen} handleClose={handleClose} />;
}

export default FAQModal;
