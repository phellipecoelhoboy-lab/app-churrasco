import React from 'react';

const AcompanhamentosSelector = ({ acompanhamentosCustomizados, setAcompanhamentosCustomizados, availableSideDishes = [] }) => {
  const handleAcompanhamentoToggle = (acompanhamento) => {
    if (acompanhamentosCustomizados.includes(acompanhamento)) {
      // Remove o acompanhamento se já está selecionado
      setAcompanhamentosCustomizados(acompanhamentosCustomizados.filter(a => a !== acompanhamento));
    } else {
      // Adiciona o acompanhamento se não está selecionado
      setAcompanhamentosCustomizados([...acompanhamentosCustomizados, acompanhamento]);
    }
  };

  return (
    <div className="acompanhamentos-selector">
      <h4>🥗 Selecione os Acompanhamentos Desejados</h4>
      <div className="acompanhamentos-grid">
        {availableSideDishes.map((acompanhamento) => (
          <label key={acompanhamento} className="acompanhamento-checkbox-item">
            <input
              type="checkbox"
              checked={acompanhamentosCustomizados.includes(acompanhamento)}
              onChange={() => handleAcompanhamentoToggle(acompanhamento)}
              className="acompanhamento-checkbox"
            />
            <span className="acompanhamento-label">{acompanhamento}</span>
          </label>
        ))}
      </div>
      <div className="acompanhamentos-resumo">
        <p>
          <strong>{acompanhamentosCustomizados.length}</strong> acompanhamento(s) selecionado(s)
        </p>
        {acompanhamentosCustomizados.length > 0 && (
          <div className="acompanhamentos-selecionados">
            {acompanhamentosCustomizados.map((acompanhamento, idx) => (
              <span key={idx} className="acompanhamento-tag">{acompanhamento}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcompanhamentosSelector;
