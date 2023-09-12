// HowToPlayModal.jsx
import React from 'react';
import ModalComponent from './ModalComponent';

function HowToPlayModal({ isOpen, handleClose }) {
  const content = (
    <>
        1. Connect your Wallet. <br />
        2. Check zkSync network and fund balance. <br />
        3. Pick either heads or tails. <br />
        4. Select your desired flip amount.<br />
        5. Click “Double or Nothing”.<br />
        6. Click approve and wait for coin to spin<br />
        7. Wait for the result without refreshing!<br />
        8. If you win, claim your rewards!<br />
    </>
  );
  return <ModalComponent title="How to Play ?" content={content} isOpen={isOpen} handleClose={handleClose} />;
}

export default HowToPlayModal;
