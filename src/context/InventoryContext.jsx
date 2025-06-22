import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProducts } from './ProductsContext';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const { products, setProducts } = useProducts();
  const [stockHistory, setStockHistory] = useState(() => {
    const saved = localStorage.getItem('stockHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Move the inventory state declaration before using it
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [];
  });

  // Define syncWithProducts after states are declared
  const syncWithProducts = (inventoryItems) => {
    const updatedProducts = products.map(product => {
      const inventoryItem = inventoryItems.find(item => item.sku === product.sku);
      if (inventoryItem) {
        return {
          ...product,
          quantity: inventoryItem.quantityInStock
        };
      }
      return product;
    });
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  // Effect to sync products with inventory on load
  useEffect(() => {
    if (inventory.length > 0) {
      syncWithProducts(inventory);
    }
  }, [inventory]);

  const updateStock = (orderItems, orderId, supplier) => {
    const updates = [];
    const now = new Date().toISOString();

    setInventory(prev => {
      const updated = [...prev];
      
      orderItems.forEach(item => {
        const index = updated.findIndex(p => p.sku === item.sku);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            quantityInStock: (updated[index].quantityInStock || 0) + item.quantity,
            lastRestocked: now
          };
          updates.push({
            sku: item.sku,
            oldQty: updated[index].quantityInStock - item.quantity,
            delivered: item.quantity,
            newQty: updated[index].quantityInStock
          });
        }
      });

      // Update products as well
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => {
          const update = updates.find(u => u.sku === product.sku);
          if (update) {
            return {
              ...product,
              quantity: update.newQty
            };
          }
          return product;
        });
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });

      localStorage.setItem('inventory', JSON.stringify(updated));
      syncWithProducts(updated); // Sync with products after updating inventory
      return updated;
    });

    // Add supplier name to stock history entry
    const historyEntry = {
      id: Date.now(),
      date: now,
      orderId,
      supplier: supplier?.basicInfo?.businessName || supplier, // Store supplier name instead of just ID
      supplierInfo: supplier, // Store full supplier info for reference
      type: 'IN',
      items: updates,
      user: 'Current User'
    };

    setStockHistory(prev => {
      const updated = [historyEntry, ...prev];
      localStorage.setItem('stockHistory', JSON.stringify(updated));
      return updated;
    });

    return updates;
  };

  const updateStockLevel = (sku, newQuantity, reason, type = 'ADJUSTMENT') => {
    const now = new Date().toISOString();
    const currentStock = inventory.find(item => item.sku === sku);
    
    if (!currentStock) return false;

    const difference = newQuantity - currentStock.quantityInStock;

    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.sku === sku) {
          return {
            ...item,
            quantityInStock: newQuantity,
            lastRestocked: now
          };
        }
        return item;
      });
      localStorage.setItem('inventory', JSON.stringify(updated));
      syncWithProducts(updated); // Sync with products after updating inventory
      return updated;
    });

    // Create history entry for manual adjustment
    const historyEntry = {
      id: Date.now(),
      date: now,
      orderId: `ADJ-${Date.now().toString().slice(-6)}`,
      type,
      reason,
      items: [{
        sku,
        oldQty: currentStock.quantityInStock,
        delivered: difference,
        newQty: newQuantity
      }],
      user: 'Current User' // Replace with actual user system
    };

    setStockHistory(prev => {
      const updated = [historyEntry, ...prev];
      localStorage.setItem('stockHistory', JSON.stringify(updated));
      return updated;
    });

    return true;
  };

  const initializeInventory = (products) => {
    const newInventory = products.map(product => ({
      sku: product.sku,
      productName: product.name,
      quantityInStock: Number(product.quantity) || 0,
      minimumAlertLevel: Number(product.minStockAlert) || 5,
      lastRestocked: new Date().toISOString()
    }));

    setInventory(newInventory);
    localStorage.setItem('inventory', JSON.stringify(newInventory));
  };

  const processSale = (items, invoiceId) => {
    const updates = [];
    const now = new Date().toISOString();

    setInventory(prev => {
      const updated = [...prev];
      
      items.forEach(item => {
        const index = updated.findIndex(p => p.sku === item.sku);
        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            quantityInStock: updated[index].quantityInStock - item.quantity
          };
          updates.push({
            sku: item.sku,
            oldQty: updated[index].quantityInStock + item.quantity,
            delivered: -item.quantity,
            newQty: updated[index].quantityInStock
          });
        }
      });

      localStorage.setItem('inventory', JSON.stringify(updated));
      return updated;
    });

    // Create stock history entry for sale
    const historyEntry = {
      id: Date.now(),
      date: now,
      invoiceId,
      type: 'OUT',
      items: updates,
      user: 'Current User'
    };

    setStockHistory(prev => {
      const updated = [historyEntry, ...prev];
      localStorage.setItem('stockHistory', JSON.stringify(updated));
      return updated;
    });

    return updates;
  };

  const value = {
    inventory,
    setInventory,
    stockHistory,
    updateStock,
    updateStockLevel,
    initializeInventory,
    processSale
  };
  
  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};