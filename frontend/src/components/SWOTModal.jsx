import React from 'react';
import './SWOTModal.css';

const SWOTModal = ({ swot, onClose, isLoading }) => {
    if (!isLoading && !swot) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>X</button>
                <h2>Análisis DAFO</h2>
                {isLoading ? (
                    <p>Cargando...</p>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default SWOTModal;
