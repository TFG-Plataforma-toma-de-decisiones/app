import React, { useState } from 'react';
import axios from 'axios';
import './SWOTModal.css';
import { useFeedback } from '../../hooks/useFeedback';
const SWOTModal = ({ swot, onClose }) => {
    const baseURL=import.meta.env.VITE_API_URL
    // Estado para manejar el texto y deshabilitar el botón mientras se genera
    const [isDownloading, setIsDownloading] = useState(false);
    const {showMessage} =useFeedback()
    if (!swot) return null;

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            // Reemplaza la URL por la ruta real de tu backend si es diferente
            const response = await axios.post(`${baseURL}/exportar-dafo`, swot, {
                // ¡SÚPER IMPORTANTE! Sin esto, el PDF se descarga corrupto
                responseType: 'blob', 
            });

            // Truco para forzar la descarga en el navegador
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Analisis_DAFO.pdf'); // Nombre del archivo
            document.body.appendChild(link);
            link.click();
            
            // Limpieza
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            showMessage({type:"error",message:"Hubo un problema al generar el PDF."})
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                
                {/* Agrupamos el título y el botón para que queden alineados */}
                <div className="modal-header">
                    <h2>Análisis DAFO</h2>
                    <button 
                        className="download-pdf-button" 
                        onClick={handleDownloadPDF} 
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Generando PDF...' : 'Descargar PDF 📄'}
                    </button>
                </div>

                <div className="swot-container">
                    <div className="swot-category">
                        <h3>Fortalezas</h3>
                        <ul>
                            {swot.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="swot-category">
                        <h3>Oportunidades</h3>
                        <ul>
                            {swot.opportunities.map((opportunity, index) => (
                                <li key={index}>{opportunity}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="swot-category">
                        <h3>Debilidades</h3>
                        <ul>
                            {swot.weaknesses.map((weakness, index) => (
                                <li key={index}>{weakness}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="swot-category">
                        <h3>Amenazas</h3>
                        <ul>
                            {swot.threats.map((threat, index) => (
                                <li key={index}>{threat}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SWOTModal;