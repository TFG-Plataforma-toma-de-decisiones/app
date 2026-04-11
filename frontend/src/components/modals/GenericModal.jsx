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
  const renderMessage = () => {
    if (Array.isArray(config.message) && config.message.length > 1) {
      return (
        <ul className="modal-list">
          {config.message.map((msg, index) => (
            <li key={index} className="modal-list-item">{msg}</li>
          ))}
        </ul>
      );
    }
    const text = Array.isArray(config.message) ? config.message[0] : config.message;
    return <p className="modal-text">{text}</p>;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className={`modal-title ${typeData.colorClass}`}>
            <span className="modal-icon-container">{typeData.icon}</span>
            {config.title}
          </h2>
          <button onClick={handleClose} className="modal-close-icon-btn" aria-label="Cerrar">
            <MdClose />
          </button>
        </div>

        <div className="modal-body">
          {renderMessage()}
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