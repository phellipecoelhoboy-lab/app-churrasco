import React, { useState } from 'react';
import Carnes from './Carnes';
import Acompanhamentos from './Acompanhamentos';

const PacoteChurrasco = ({ pkg, setChurrasco, isSelected }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className={`pacote-card ${isSelected ? 'pacote-selected' : ''}`}>
      {/* CABEÇALHO DO CARD */}
      <div className="pacote-header">
        <label className="pacote-label">
          <input
            type="radio"
            name="churrasco"
            onChange={() => setChurrasco(pkg)}
            checked={isSelected}
            className="pacote-radio"
          />
          <div className="pacote-info-main">
            <strong className="pacote-name">🍖 {pkg.name}</strong>
            <span className="pacote-price">R$ {pkg.price.toFixed(2)}/pessoa</span>
          </div>
        </label>
      </div>

      {/* PREVIEW DOS ITENS */}
      <div className="pacote-preview">
        <div className="preview-item">
          <span className="preview-icon">🥩</span>
          <span className="preview-count">{pkg.meats?.length || 0} carnes</span>
        </div>
        <div className="preview-item">
          <span className="preview-icon">🥗</span>
          <span className="preview-count">{pkg.sideDishes?.length || 0} acompanhamentos</span>
        </div>
      </div>

      {/* BOTÃO EXPANDIR */}
      <button 
        className="pacote-expand-btn"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? '▼ Menos detalhes' : '▶ Ver detalhes'}
      </button>

      {/* DETALHES EXPANDÍVEIS */}
      {expanded && (
        <div className="pacote-detalhes">
          <Carnes carnes={pkg.meats} />
          <Acompanhamentos acompanhamentos={pkg.sideDishes} />
        </div>
      )}
    </article>
  );
};

export default PacoteChurrasco;
