import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './DescriptionModal.css';

export default function DescriptionModal({ title, description, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div className="desc-modal-overlay" onClick={onClose}>
      <div className="desc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="desc-modal-header">
          <h3 className="desc-modal-title">{title}</h3>
          <button className="desc-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <p className="desc-modal-body">{description}</p>
      </div>
    </div>,
    document.body
  );
}
