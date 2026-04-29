import React, { useState } from 'react';

const BebidaOptions = ({ setBebidas, bebidas, beverages }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleToggleBebida = (drink, option) => {
    const itemId = `${drink.id}|${option.id}`;
    const updated = bebidas.some(b => b.id === itemId)
      ? bebidas.filter(b => b.id !== itemId)
      : [
          ...bebidas,
          {
            id: itemId,
            categoryId: drink.id,
            categoryName: drink.name,
            optionId: option.id,
            name: drink.name,
            option: option.name,
            price: option.price,
          },
        ];
    setBebidas(updated);
  };

  const isSelectedOption = (drink, option) => {
    return bebidas.some(b => b.categoryId === drink.id && b.optionId === option.id);
  };

  const countSelectedByCategory = (drinkId) => {
    return bebidas.filter(b => b.categoryId === drinkId).length;
  };

  return (
    <div>
      {/* PREVIEW DAS SELECIONADAS */}
      {bebidas.length > 0 && (
        <div className="bebidas-preview">
          <p className="preview-title">✓ Selecionadas ({bebidas.length}):</p>
          <div className="bebidas-chips">
            {bebidas.map(bebida => (
              <div key={bebida.id} className="bebida-chip">
                {bebida.option}
                <button 
                  className="chip-close"
                  onClick={() => handleToggleBebida({ id: bebida.categoryId, name: bebida.categoryName }, { id: bebida.optionId, name: bebida.option, price: bebida.price })}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIAS DE BEBIDA */}
      <div className="bebidas-categorias">
        {beverages.map((drink) => {
          const isExpanded = expandedCategory === drink.id;
          const selectedCount = countSelectedByCategory(drink.id);

          return (
            <div key={drink.id} className="bebida-categoria">
              {/* HEADER DA CATEGORIA */}
              <button
                className={`categoria-header ${selectedCount > 0 ? 'has-selected' : ''}`}
                onClick={() => setExpandedCategory(isExpanded ? null : drink.id)}
              >
                <div className="categoria-info">
                  <span className="categoria-icon">{drink.icon}</span>
                  <span className="categoria-name">{drink.name}</span>
                  {selectedCount > 0 && (
                    <span className="categoria-badge">{selectedCount}</span>
                  )}
                </div>
                <span className="categoria-arrow">{isExpanded ? '▼' : '▶'}</span>
              </button>

              {/* OPÇÕES DA CATEGORIA */}
              {isExpanded && (
                <div className="categoria-opcoes">
                  {drink.options.map((option) => {
                    const isSelected = isSelectedOption(drink, option);
                    return (
                      <label key={option.id} className={`opcao-checkbox ${isSelected ? 'selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleBebida(drink, option)}
                        />
                        <span className="opcao-text">{option.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BebidaOptions;
