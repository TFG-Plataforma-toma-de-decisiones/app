import './DeleteModal.css';

function DeleteModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} data-cy="delete-modal">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            <span role="img" aria-label="warning">️🗑️</span>
            {title}
          </h2>
          <button onClick={onClose} aria-label="close" className="modal-close-icon-btn" data-cy="delete-modal-close">
            X
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn-cancel" data-cy="delete-modal-cancel">
            Cancelar
          </button>
          <button onClick={onConfirm} className="modal-btn-delete" data-cy="delete-modal-confirm">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
