import './DeleteModal.css';

function DeleteModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            <span role="img" aria-label="warning">️🗑️</span>
            {title}
          </h2>
          <button onClick={onClose} aria-label="close" className="modal-close-icon-btn">
            X
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="modal-btn-delete">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
