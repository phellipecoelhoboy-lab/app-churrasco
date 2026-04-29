import React from 'react';

const ExtrasOptions = ({ extras, setExtras, extrasCatalog }) => {
  const groupedExtras = extrasCatalog.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleExtraChange = (extra) => {
    setExtras(prevExtras => {
      if (prevExtras.find(item => item.id === extra.id)) {
        return prevExtras.filter(item => item.id !== extra.id);
      } else {
        return [...prevExtras, extra];
      }
    });
  };

  return (
    <div>
      {Object.entries(groupedExtras).map(([category, items]) => (
        <div key={category}>
          <h3>{category}</h3>
          {items.map((extra) => (
            <div key={extra.id ?? extra.name} className="pacote-card">
              <label>
                <input
                  type="checkbox"
                  onChange={() => handleExtraChange(extra)}
                  checked={extras.some((item) => item.id === extra.id)}
                />
                <div className="pacote-info">
                  <h4>{extra.name}</h4>
                  {extra.ingredients && <p>{extra.ingredients}</p>}
                </div>
              </label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ExtrasOptions;
