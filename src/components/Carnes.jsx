import React from 'react';

const Carnes = ({ carnes }) => {
  return (
    <div className="detalhes-secao">
      <h4>🥩 Carnes</h4>
      <div className="items-list">
        {carnes.map((carne, index) => (
          <div key={index} className="item-tag">{carne}</div>
        ))}
      </div>
    </div>
  );
};

export default Carnes;
