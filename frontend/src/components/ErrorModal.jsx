import './ErrorModal.css'; // Los estilos que te pongo abajo
function ErrorModal({ isOpen, onClose, title = "Ocurrió un error", errorMessage }) {
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Detenemos la propagación para que al hacer clic dentro de la caja no se cierre */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">⚠️</span> {title}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p>{errorMessage || "Error desconocido de conexión."}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
        
      </div>
    </div>
  );
}

export default ErrorModal;