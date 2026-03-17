import { 
  MdErrorOutline, 
  MdCheckCircleOutline, 
  MdWarningAmber, 
  MdInfoOutline,
  MdClose ,
  MdSync
} from 'react-icons/md';
import './GenericModal.css';

const TYPE_CONFIG = {
  error: { 
    icon: <MdErrorOutline />, 
    colorClass: 'type-error'
  },
  success: { 
    icon: <MdCheckCircleOutline />, 
    colorClass: 'type-success'
  },
  warning: { 
    icon: <MdWarningAmber />, 
    colorClass: 'type-warning'
  },
  info: { 
    icon: <MdInfoOutline />, 
    colorClass: 'type-info'
  },
  loading: { 
    icon: <MdSync className="icon-spin" />, 
    colorClass: 'type-info', 
    
  }
};

export default function GenericModal({ isOpen, onClose, config }) {
  if (!isOpen || !config) return null;

  const typeData = TYPE_CONFIG[config.type]
  const { icon, colorClass } = typeData;
  const handleClose = () => {
    if (config.onCancel) {
      config.onCancel();
    }
    onClose(); 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {/* Combinamos modal-title con la clase de color específica */}
          <h2 className={`modal-title ${colorClass}`}>
            <span className="modal-icon-container">{icon}</span>
            {config.title}
          </h2>
          <button onClick={handleClose} className="modal-close-icon-btn" aria-label="Cerrar">
            <MdClose />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-text">
            {config.message }
          </p>
        </div>

        <div className="modal-footer">
          {/* El botón también recibe la clase de color para el fondo */}
          <button onClick={handleClose} className={`modal-btn-confirm ${colorClass}-bg`}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}