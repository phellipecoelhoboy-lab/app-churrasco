import React from 'react';

const BebidasChurrasco = ({ bebidas }) => {
  return (
    <div className="detalhes-secao">
      <h4>🥤 Bebidas</h4>
      <div className="items-list">
        {bebidas.map((bebida, index) => (
          <div key={index} className="item-tag">{bebida}</div>
        ))}
      </div>
    </div>
  );
};

export default BebidasChurrasco;
  