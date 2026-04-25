import React from 'react';

const Acompanhamentos = ({ acompanhamentos }) => {
  return (
    <div className="detalhes-secao">
      <h4>🍞 Acompanhamentos</h4>
      <div className="items-list">
        {acompanhamentos.map((item, index) => (
          <div key={index} className="item-tag">{item}</div>
        ))}
      </div>
    </div>
  );
};

export default Acompanhamentos;
