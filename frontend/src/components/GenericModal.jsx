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
    colorClass: 'type-info',
  },
  loading: { 
    icon: <MdSync className="icon-spin" />, 
    colorClass: 'type-info', 
    colorClassClose:'type-error',
    close:"Cancelar"
    
  }
};

export default function GenericModal({onClose, config }) {
  if (!config) return null;

  const typeData = TYPE_CONFIG[config.type]
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
          <h2 className={`modal-title ${typeData.colorClass}`}>
            <span className="modal-icon-container">{typeData.icon}</span>
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
          <button onClick={handleClose} className={`modal-btn-confirm ${typeData.colorClassClose || typeData.colorClass}-bg`}>
            {typeData.close || "Entendido"}
          </button>
        </div>
      </div>
    </div>
  );
}