import React from 'react';
import PacoteChurrasco from './PacoteChurrasco';

const ChurrascoOptions = ({ setChurrasco, churrasco, churrascoPackages }) => {
  return (
    <>
      {churrascoPackages.map((pkg) => (
        <PacoteChurrasco
          key={pkg.id ?? pkg.name}
          pkg={pkg}
          setChurrasco={setChurrasco}
          isSelected={churrasco?.id ? churrasco.id === pkg.id : churrasco?.name === pkg.name}
        />
      ))}
    </>
  );
};

export default ChurrascoOptions;
