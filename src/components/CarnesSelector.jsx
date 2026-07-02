import React from 'react';

const CarnesSelector = ({ carnesCustomizadas, setCarnesCustomizadas, availableMeats = [] }) => {
  const handleCarneToggle = (carne) => {
    if (carnesCustomizadas.includes(carne)) {
      // Remove a carne se já está selecionada
      setCarnesCustomizadas(carnesCustomizadas.filter(c => c !== carne));
    } else {
      // Adiciona a carne se não está selecionada
      setCarnesCustomizadas([...carnesCustomizadas, carne]);
    }
  };

  return (
    <div className="carnes-selector">
      <h4>🥩 Selecione as Carnes Desejadas</h4>
      <div className="carnes-grid">
        {availableMeats.map((carne) => (
          <label key={carne} className="carne-checkbox-item">
            <input
              type="checkbox"
              checked={carnesCustomizadas.includes(carne)}
              onChange={() => handleCarneToggle(carne)}
              className="carne-checkbox"
            />
            <span className="carne-label">{carne}</span>
          </label>
        ))}
      </div>
      <div className="carnes-resumo">
        <p>
          <strong>{carnesCustomizadas.length}</strong> carne(s) selecionada(s)
        </p>
        {carnesCustomizadas.length > 0 && (
          <div className="carnes-selecionadas">
            {carnesCustomizadas.map((carne, idx) => (
              <span key={idx} className="carne-tag">{carne}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarnesSelector;
