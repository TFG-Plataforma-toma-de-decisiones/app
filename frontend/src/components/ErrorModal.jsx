import './ErrorModal.css';

function ErrorModal({ isOpen, onClose, title = "Ocurrió un error", errorMessage }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            <span role="img" aria-label="warning">⚠️</span>
            {title}
          </h2>
          <button onClick={onClose} aria-label="close" className="modal-close-icon-btn">
            X
          </button>
        </div>

        <div className="modal-body">
          <p id="modal-description" className="modal-text">
            {errorMessage || "Error desconocido de conexión."}
          </p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn-confirm">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;