// ModalComponent.jsx

import React from 'react';
import { Modal, Typography, Box } from '@mui/material'; // or whatever library you're using

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  color:"#4D5297",
  display: "flex",
  flexDirection: "column",
  overflow: "scroll",
  maxHeight: "600px",


};


function ModalComponent({ title, content, isOpen, handleClose }) {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <Box sx={style}>
        <div style={{ padding: "20px" }}>
          <Typography
            sx={{
              fontFamily: "'Bree Serif'",
              fontWeight: "normal",
              fontSize: "1.5rem"
            }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Bree Serif'",
              fontWeight: "normal",
              mt: 2,
              pb: 2
            }}
            id="modal-modal-description"
          >
            {content}
          </Typography>
        </div>
        <div style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.2)" }}></div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", background: "rgb(247 248 255)" }}>
          <button onClick={handleClose} className='game-button'>Got It!</button>
        </div>
      </Box>
    </Modal>
  );
}
export default ModalComponent;
