import { createContext, useContext, useState } from 'react';

const SuppliersContext = createContext();

export const SuppliersProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);

  return (
    <SuppliersContext.Provider value={{ suppliers, setSuppliers }}>
      {children}
    </SuppliersContext.Provider>
  );
};

export const useSuppliers = () => useContext(SuppliersContext);
