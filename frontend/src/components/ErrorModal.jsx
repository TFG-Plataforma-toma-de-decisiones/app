import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './ErrorModal.css';

function ErrorModal({ isOpen, onClose, title = "Ocurrió un error", errorMessage }) {
  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box className="modal-box">
        {/* Header */}
        <Box className="modal-header">
          <Typography id="modal-title" variant="h6" component="h2" className="modal-title">
            <WarningAmberIcon />
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="close" className="modal-close-icon-btn">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Body */}
        <Box className="modal-body">
          <Typography id="modal-description" className="modal-text">
            {errorMessage || "Error desconocido de conexión."}
          </Typography>
        </Box>

        {/* Footer */}
        <Box className="modal-footer">
          <Button variant="contained" onClick={onClose} className="modal-btn-confirm">
            Entendido
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ErrorModal;