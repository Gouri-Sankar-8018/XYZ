import { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useProducts } from '../context/ProductsContext';

const InvoicePrintModal = ({ invoice, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 print:bg-transparent">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 print:w-full print:max-w-full print:shadow-none print:p-2">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-xl font-bold">Invoice Preview</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <div>
              <h3 className="font-bold text-lg text-primary-700">Garment Billing Software</h3>
              <div className="text-xs text-gray-500">Point of Sale Invoice</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Invoice #: {invoice.invoiceNumber}</div>
              <div className="text-xs text-gray-500">Date: {new Date(invoice.date).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div>
              <div className="font-semibold">Customer:</div>
              <div>{invoice.customerName}</div>
              {invoice.mobile && <div className="text-xs text-gray-500">Mobile: {invoice.mobile}</div>}
            </div>
            <div>
              <div className="font-semibold">Payment Method:</div>
              <div>{invoice.paymentMethod}</div>
            </div>
          </div>
        </div>
        <table className="w-full text-xs border mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">SKU</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">GST</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{item.sku}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border text-center">{item.quantity}</td>
                <td className="p-2 border text-right">₹{item.price}</td>
                <td className="p-2 border text-right">{item.discount}%</td>
                <td className="p-2 border text-right">{item.gst}%</td>
                <td className="p-2 border text-right">
                  ₹{((item.price * item.quantity) * (1 - item.discount / 100) * (1 + item.gst / 100)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col items-end space-y-1 mb-4">
          <div>Subtotal: <span className="font-semibold">₹{invoice.totals.subtotal.toFixed(2)}</span></div>
          <div>Discount: <span className="font-semibold text-red-600">-₹{invoice.totals.discount.toFixed(2)}</span></div>
          <div>CGST: <span className="font-semibold">₹{invoice.totals.cgst.toFixed(2)}</span></div>
          <div>SGST: <span className="font-semibold">₹{invoice.totals.sgst.toFixed(2)}</span></div>
          <div className="text-lg font-bold border-t pt-2 mt-2">Total: ₹{invoice.totals.total.toFixed(2)}</div>
        </div>
        <div className="flex justify-end gap-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const InvoiceHistoryViewModal = ({ invoice, onClose }) => {
  if (!invoice) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 max-h-[95vh] overflow-y-auto border border-primary-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-primary-100 to-primary-300 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-lg">
              <i className="fas fa-file-invoice"></i>
            </span>
            <h2 className="text-xl font-bold text-primary-800">Invoice Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-primary-700 transition">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        {/* Info Section */}
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-3 mb-3">
            <div>
              <div className="font-bold text-lg text-primary-700">Garment Billing Software</div>
              <div className="text-xs text-gray-500">Point of Sale Invoice</div>
            </div>
            <div className="text-right mt-2 md:mt-0">
              <div className="font-semibold text-primary-700">Invoice #: <span className="text-gray-800">{invoice.invoiceNumber}</span></div>
              <div className="text-xs text-gray-500">Date: {new Date(invoice.date).toLocaleString()}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="font-semibold text-gray-700">Customer</div>
              <div className="text-gray-900">{invoice.customerName}</div>
              {invoice.mobile && <div className="text-xs text-gray-500">Mobile: {invoice.mobile}</div>}
            </div>
            <div>
              <div className="font-semibold text-gray-700">Payment Method</div>
              <div className="text-gray-900">{invoice.paymentMethod}</div>
            </div>
          </div>
          {/* Items Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden mb-4 shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-primary-50">
                <tr>
                  <th className="p-2 border-b text-left">SKU</th>
                  <th className="p-2 border-b text-left">Product</th>
                  <th className="p-2 border-b text-center">Qty</th>
                  <th className="p-2 border-b text-right">Price</th>
                  <th className="p-2 border-b text-right">Discount</th>
                  <th className="p-2 border-b text-right">GST</th>
                  <th className="p-2 border-b text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-2">{item.sku}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-center">{item.quantity}</td>
                    <td className="p-2 text-right">₹{item.price}</td>
                    <td className="p-2 text-right">{item.discount}%</td>
                    <td className="p-2 text-right">{item.gst}%</td>
                    <td className="p-2 text-right font-semibold text-primary-700">
                      ₹{((item.price * item.quantity) * (1 - item.discount / 100) * (1 + item.gst / 100)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Totals */}
          <div className="flex flex-col items-end space-y-1 mb-4">
            <div className="flex gap-8">
              <div className="text-gray-600">Subtotal:</div>
              <div className="font-semibold text-gray-900">₹{invoice.totals.subtotal.toFixed(2)}</div>
            </div>
            <div className="flex gap-8">
              <div className="text-gray-600">Discount:</div>
              <div className="font-semibold text-red-600">-₹{invoice.totals.discount.toFixed(2)}</div>
            </div>
            <div className="flex gap-8">
              <div className="text-gray-600">CGST:</div>
              <div className="font-semibold text-gray-900">₹{invoice.totals.cgst.toFixed(2)}</div>
            </div>
            <div className="flex gap-8">
              <div className="text-gray-600">SGST:</div>
              <div className="font-semibold text-gray-900">₹{invoice.totals.sgst.toFixed(2)}</div>
            </div>
            <div className="flex gap-8 border-t pt-2 mt-2">
              <div className="text-lg font-bold text-primary-700">Total:</div>
              <div className="text-lg font-bold text-primary-900">₹{invoice.totals.total.toFixed(2)}</div>
            </div>
          </div>
          {/* Footer Actions */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewBill = () => {
  const { inventory, processSale } = useInventory();
  const { products } = useProducts();
  const [customerName, setCustomerName] = useState('Walk-in');
  const [mobile, setMobile] = useState('');
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [activeTab, setActiveTab] = useState('new');
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastInvoice, setLastInvoice] = useState(null);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);

  // Add state for return/exchange
  const [returnInvoiceNum, setReturnInvoiceNum] = useState('');
  const [returnInvoice, setReturnInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);
  const [exchangeSearch, setExchangeSearch] = useState('');
  const [exchangeSearchResults, setExchangeSearchResults] = useState([]);
  const [returnSuccess, setReturnSuccess] = useState(false);

  // For replace
  const [replaceItems, setReplaceItems] = useState([]);
  const [replaceSearch, setReplaceSearch] = useState('');
  const [replaceSearchResults, setReplaceSearchResults] = useState([]);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('returnReplaceExchangeHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Add these state hooks if missing
  const [historyViewModal, setHistoryViewModal] = useState(false);
  const [historyViewInvoice, setHistoryViewInvoice] = useState(null);

  useEffect(() => {
    setInvoiceNumber(`INV-${Date.now()}`);
  }, []);

  useEffect(() => {
    // Get last invoice
    const lastInv = invoices[0] || null;
    setLastInvoice(lastInv);
  }, [invoices]);

  const searchProducts = (term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const results = products.filter(
        product =>
          product.sku.toLowerCase().includes(term.toLowerCase()) ||
          product.name.toLowerCase().includes(term.toLowerCase())
      ).map(product => ({
        sku: product.sku,
        productName: product.name,
        price: parseFloat(product.sellingPrice),
        quantityInStock: parseInt(product.quantity),
        size: product.size,
        color: product.color,
        gst: parseFloat(product.taxRate) || 18
      }));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addProduct = (product) => {
    const existingItem = items.find(item => item.sku === product.sku);
    if (existingItem) {
      setItems(items.map(item =>
        item.sku === product.sku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, {
        sku: product.sku,
        name: product.productName,
        quantity: 1,
        price: product.price || 0,
        gst: product.gst || 18,
        discount: 0,
        size: product.size || '',
        color: product.color || ''
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateItemQuantity = (sku, quantity) => {
    const product = inventory.find(p => p.sku === sku);
    if (product && quantity <= product.quantityInStock) {
      setItems(items.map(item =>
        item.sku === sku ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (sku) => {
    setItems(items.filter(item => item.sku !== sku));
  };

  // Update calculateTotals to split GST
  const calculateTotals = () => {
    return items.reduce((acc, item) => {
      const subtotal = item.price * item.quantity;
      const discount = (subtotal * item.discount) / 100;
      const afterDiscount = subtotal - discount;
      const gst = (afterDiscount * item.gst) / 100;
      const cgst = gst / 2;
      const sgst = gst / 2;
      return {
        subtotal: acc.subtotal + subtotal,
        discount: acc.discount + discount,
        cgst: acc.cgst + cgst,
        sgst: acc.sgst + sgst,
        total: acc.total + afterDiscount + gst
      };
    }, { subtotal: 0, discount: 0, cgst: 0, sgst: 0, total: 0 });
  };

  const saveInvoice = (invoice) => {
    setInvoices(prev => {
      const updated = [invoice, ...prev];
      localStorage.setItem('invoices', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (items.length === 0) return;

    processSale(items.map(item => ({
      sku: item.sku,
      quantity: item.quantity
    })), invoiceNumber);

    const invoice = {
      invoiceNumber,
      date: new Date().toISOString(),
      customerName,
      mobile,
      items,
      totals: calculateTotals(),
      paymentMethod
    };

    saveInvoice(invoice);

    // Reset form
    setItems([]);
    setCustomerName('Walk-in');
    setMobile('');
    setInvoiceNumber(`INV-${Date.now()}`);
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput);
    if (product) {
      addProduct({
        sku: product.sku,
        productName: product.name,
        price: parseFloat(product.sellingPrice),
        quantityInStock: parseInt(product.quantity),
        size: product.size,
        color: product.color,
        gst: parseFloat(product.taxRate) || 18
      });
      setBarcodeInput('');
    }
  };

  // Handler to search invoice for return/exchange
  const handleReturnInvoiceSearch = () => {
    const found = invoices.find(inv => inv.invoiceNumber === returnInvoiceNum.trim());
    setReturnInvoice(found || null);
    setReturnItems([]);
    setExchangeItems([]);
    setReturnSuccess(false);
  };

  // Handler to select items for return/exchange
  const handleReturnItemChange = (sku, checked) => {
    if (!returnInvoice) return;
    if (checked) {
      const item = returnInvoice.items.find(i => i.sku === sku);
      setReturnItems(prev => [...prev, { ...item, returnQty: item.quantity }]);
    } else {
      setReturnItems(prev => prev.filter(i => i.sku !== sku));
      setExchangeItems(prev => prev.filter(i => i.originalSku !== sku));
    }
  };

  const handleReturnQtyChange = (sku, qty) => {
    setReturnItems(prev =>
      prev.map(i => i.sku === sku ? { ...i, returnQty: qty } : i)
    );
  };

  // Handler for searching products to exchange
  const handleExchangeSearch = (term) => {
    setExchangeSearch(term);
    if (term.length > 2) {
      const results = products.filter(
        p =>
          p.sku.toLowerCase().includes(term.toLowerCase()) ||
          p.name.toLowerCase().includes(term.toLowerCase())
      );
      setExchangeSearchResults(results);
    } else {
      setExchangeSearchResults([]);
    }
  };

  // Handler to add an exchange product
  const handleAddExchangeProduct = (originalSku, product, qty) => {
    setExchangeItems(prev => [
      ...prev.filter(i => i.originalSku !== originalSku),
      {
        originalSku,
        sku: product.sku,
        name: product.name,
        qty,
        price: parseFloat(product.sellingPrice),
        gst: parseFloat(product.taxRate) || 18
      }
    ]);
    setExchangeSearch('');
    setExchangeSearchResults([]);
  };

  // Handler for searching products to replace
  const handleReplaceSearch = (term) => {
    setReplaceSearch(term);
    if (term.length > 2) {
      const results = products.filter(
        p =>
          p.sku.toLowerCase().includes(term.toLowerCase()) ||
          p.name.toLowerCase().includes(term.toLowerCase())
      );
      setReplaceSearchResults(results);
    } else {
      setReplaceSearchResults([]);
    }
  };

  // Handler to add a replace product
  const handleAddReplaceProduct = (originalSku, product, qty) => {
    setReplaceItems(prev => [
      ...prev.filter(i => i.originalSku !== originalSku),
      {
        originalSku,
        sku: product.sku,
        name: product.name,
        qty,
        price: parseFloat(product.sellingPrice),
        gst: parseFloat(product.taxRate) || 18
      }
    ]);
    setReplaceSearch('');
    setReplaceSearchResults([]);
  };

  // Handler to process return/replace/exchange
  const handleProcessReturnReplaceExchange = () => {
    // 1. Update inventory for returned items
    returnItems.forEach(item => {
      const invIdx = inventory.findIndex(i => i.sku === item.sku);
      if (invIdx !== -1) {
        inventory[invIdx].quantityInStock += Number(item.returnQty);
      }
    });

    // 2. Update inventory for exchanged items (decrease stock for new, increase for returned)
    exchangeItems.forEach(rep => {
      // Increase stock for returned
      const retIdx = inventory.findIndex(i => i.sku === rep.originalSku);
      if (retIdx !== -1) {
        inventory[retIdx].quantityInStock += Number(rep.qty);
      }
      // Decrease stock for exchange
      const repIdx = inventory.findIndex(i => i.sku === rep.sku);
      if (repIdx !== -1) {
        inventory[repIdx].quantityInStock -= Number(rep.qty);
      }
    });

    // 3. Update inventory for replaced items (decrease stock for new, increase for returned)
    replaceItems.forEach(rep => {
      // Increase stock for returned
      const retIdx = inventory.findIndex(i => i.sku === rep.originalSku);
      if (retIdx !== -1) {
        inventory[retIdx].quantityInStock += Number(rep.qty);
      }
      // Decrease stock for replacement
      const repIdx = inventory.findIndex(i => i.sku === rep.sku);
      if (repIdx !== -1) {
        inventory[repIdx].quantityInStock -= Number(rep.qty);
      }
    });

    // Save inventory changes (simulate context update)
    localStorage.setItem('inventory', JSON.stringify(inventory));

    // Save to history
    const entry = {
      id: Date.now(),
      invoiceNumber: returnInvoice?.invoiceNumber,
      date: new Date().toISOString(),
      customerName: returnInvoice?.customerName,
      mobile: returnInvoice?.mobile,
      returned: [...returnItems],
      exchanged: [...exchangeItems],
      replaced: [...replaceItems]
    };
    const updatedHistory = [entry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('returnReplaceExchangeHistory', JSON.stringify(updatedHistory));

    setReturnSuccess(true);
    setReturnInvoice(null);
    setReturnInvoiceNum('');
    setReturnItems([]);
    setExchangeItems([]);
    setReplaceItems([]);
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional POS Header */}
      <header className="bg-sky-100 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-6 border-b border-primary-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow text-white text-2xl font-bold">
                <i className="fas fa-cash-register"></i>
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-primary-800 tracking-tight leading-tight">POS</h1>
                <p className="text-xs text-primary-900 font-medium tracking-wide">Garment Billing</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center">
              <span className="text-xs text-gray-500 font-semibold">
                <i className="fas fa-file-invoice text-primary-500 mr-1"></i>
                Invoice: <span className="font-bold text-primary-900">{invoiceNumber}</span>
              </span>
              {lastInvoice && (
                <span className="text-xs text-gray-500 font-semibold">
                  <i className="fas fa-history text-primary-400 mr-1"></i>
                  Last: <span className="font-bold text-primary-900">{lastInvoice.invoiceNumber}</span>
                </span>
              )}
              <span className="hidden md:inline-block h-6 border-l border-primary-200 mx-2"></span>
            </div>
            <nav className="flex gap-1 md:gap-2">
              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'new'
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
              >
                <i className="fas fa-plus mr-2"></i>New Invoice
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'history'
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
              >
                <i className="fas fa-list mr-2"></i>Invoice History
              </button>
                {/* <button
                  onClick={() => setActiveTab('return')}
                  className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'return'
                      ? 'bg-primary-600 text-white shadow'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                >
                  <i className="fas fa-undo mr-2"></i>Return/Exchange/Replace
                </button>
                <button
                  onClick={() => setActiveTab('returnHistory')}
                  className={`px-4 py-2 rounded-md font-semibold transition-all ${activeTab === 'returnHistory'
                      ? 'bg-primary-600 text-white shadow'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    }`}
                >
                  <i className="fas fa-history mr-2"></i>R/R/E History
                </button> */}
            </nav>
          </div>
        </div>
      </header>

      {/* New Invoice Tab */}
      {activeTab === 'new' ? (
        <div className="max-w-7xl mx-auto p-6">
          {/* Quick Action Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Date Field */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Date
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="input-field focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Barcode Scanner */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scan Barcode
              </label>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="input-field flex-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Scan or enter barcode"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  <i className="fas fa-barcode"></i>
                </button>
              </form>
            </div>

            {/* Customer Name Field */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input-field focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter customer name"
              />
            </div>

            {/* Mobile Number Field */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="input-field focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter mobile number"
              />
            </div>
          </div>

          {/* Product Search Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => searchProducts(e.target.value)}
                placeholder="Search by SKU or name"
                className="input-field focus:ring-primary-500 focus:border-primary-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                  {searchResults.map(product => (
                    <div
                      key={product.sku}
                      className="p-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                      onClick={() => addProduct(product)}
                    >
                      <div>
                        <div className="font-medium text-gray-800">{product.productName}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                      <div className="text-primary-600 font-medium">₹{product.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size/Color</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.sku} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center">
                          {item.size}
                          <span className="mx-2">•</span>
                          <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.color.toLowerCase() }}></div>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.sku, parseInt(e.target.value))}
                          className="w-20 px-2 py-1 text-sm border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => setItems(items.map(i =>
                            i.sku === item.sku ? { ...i, discount: parseFloat(e.target.value) } : i
                          ))}
                          className="w-20 px-2 py-1 text-sm border rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.gst}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{((item.price * item.quantity) * (1 - item.discount / 100) * (1 + item.gst / 100)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Updated Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-field focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Discount:</span>
                  <span className="text-red-600">-₹{totals.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>CGST:</span>
                  <span>₹{totals.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>SGST:</span>
                  <span>₹{totals.sgst.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <i className="fas fa-print mr-2"></i>
              Print Invoice
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <i className="fas fa-envelope mr-2"></i>
              Email Invoice
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <i className="fas fa-check mr-2"></i>
              Generate Invoice
            </button>
          </div>
        </div>
      ) : activeTab === 'history' ? (
        // Enhanced Invoice History Table
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search by invoice number or customer name..."
                className="input-field w-full focus:ring-primary-500 focus:border-primary-500"
                onChange={(e) => {
                  // Add search functionality here
                }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map(invoice => (
                    <tr key={invoice.invoiceNumber} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.customerName}
                        {invoice.mobile && (
                          <span className="text-gray-500 text-xs block">
                            {invoice.mobile}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {invoice.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ₹{invoice.totals.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800' :
                            invoice.paymentMethod === 'CREDIT' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {invoice.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          className="text-primary-600 hover:text-primary-900 mx-2"
                          title="View"
                          onClick={() => {
                            setHistoryViewInvoice(invoice);
                            setHistoryViewModal(true);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {historyViewModal && historyViewInvoice && (
            <InvoiceHistoryViewModal
              invoice={historyViewInvoice}
              onClose={() => {
                setHistoryViewModal(false);
                setHistoryViewInvoice(null);
              }}
            />
          )}
        </div>
      ) : activeTab === 'return' ? (
        // Return/Exchange/Replace Tab
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-primary-700">Return / Exchange / Replace Product</h2>
            {returnSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                Return/Exchange/Replace processed successfully and inventory updated!
              </div>
            )}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="Enter Invoice Number"
                value={returnInvoiceNum}
                onChange={e => setReturnInvoiceNum(e.target.value)}
              />
              <button
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                onClick={handleReturnInvoiceSearch}
              >
                Search Invoice
              </button>
            </div>
            {returnInvoice && (
              <div className="mt-4">
                <div className="mb-2">
                  <span className="font-semibold">Invoice:</span> {returnInvoice.invoiceNumber} | <span className="font-semibold">Date:</span> {new Date(returnInvoice.date).toLocaleString()}
                </div>
                <div className="mb-4">
                  <span className="font-semibold">Customer:</span> {returnInvoice.customerName} {returnInvoice.mobile && <span>({returnInvoice.mobile})</span>}
                </div>
                <table className="w-full mb-4 border rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2">Return</th>
                      <th className="px-2 py-2">SKU</th>
                      <th className="px-2 py-2">Product</th>
                      <th className="px-2 py-2">Qty</th>
                      <th className="px-2 py-2">Return Qty</th>
                      <th className="px-2 py-2">Exchange</th>
                      <th className="px-2 py-2">Replace</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnInvoice.items.map(item => (
                      <tr key={item.sku}>
                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={!!returnItems.find(i => i.sku === item.sku)}
                            onChange={e => handleReturnItemChange(item.sku, e.target.checked)}
                          />
                        </td>
                        <td className="px-2 py-2">{item.sku}</td>
                        <td className="px-2 py-2">{item.name}</td>
                        <td className="px-2 py-2 text-center">{item.quantity}</td>
                        <td className="px-2 py-2 text-center">
                          {returnItems.find(i => i.sku === item.sku) ? (
                            <input
                              type="number"
                              min={1}
                              max={item.quantity}
                              value={returnItems.find(i => i.sku === item.sku)?.returnQty || 1}
                              onChange={e => handleReturnQtyChange(item.sku, Math.max(1, Math.min(item.quantity, Number(e.target.value))))}
                              className="w-16 px-1 py-1 border rounded"
                            />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {returnItems.find(i => i.sku === item.sku) && (
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                              onClick={() => {
                                setExchangeSearch('');
                                setExchangeSearchResults([]);
                                setExchangeItems(prev => prev.filter(r => r.originalSku !== item.sku));
                              }}
                            >
                              Exchange
                            </button>
                          )}
                          {exchangeItems.find(r => r.originalSku === item.sku) && (
                            <div className="mt-2">
                              <input
                                type="text"
                                className="input-field w-32 mb-1"
                                placeholder="Search exchange"
                                value={exchangeSearch}
                                onChange={e => handleExchangeSearch(e.target.value)}
                              />
                              {exchangeSearchResults.length > 0 && (
                                <div className="bg-white border rounded shadow max-h-32 overflow-y-auto">
                                  {exchangeSearchResults.map(prod => (
                                    <div
                                      key={prod.sku}
                                      className="p-2 hover:bg-primary-50 cursor-pointer flex justify-between"
                                      onClick={() =>
                                        handleAddExchangeProduct(item.sku, prod, returnItems.find(i => i.sku === item.sku)?.returnQty || 1)
                                      }
                                    >
                                      <span>{prod.name} ({prod.sku})</span>
                                      <span>Stock: {prod.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {exchangeItems.find(r => r.originalSku === item.sku) && (
                                <div className="mt-1 text-xs text-green-700">
                                  Exchanged with: {exchangeItems.find(r => r.originalSku === item.sku)?.name}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {returnItems.find(i => i.sku === item.sku) && (
                            <button
                              className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                              onClick={() => {
                                setReplaceSearch('');
                                setReplaceSearchResults([]);
                                setReplaceItems(prev => prev.filter(r => r.originalSku !== item.sku));
                              }}
                            >
                              Replace
                            </button>
                          )}
                          {replaceItems.find(r => r.originalSku === item.sku) && (
                            <div className="mt-2">
                              <input
                                type="text"
                                className="input-field w-32 mb-1"
                                placeholder="Search replace"
                                value={replaceSearch}
                                onChange={e => handleReplaceSearch(e.target.value)}
                              />
                              {replaceSearchResults.length > 0 && (
                                <div className="bg-white border rounded shadow max-h-32 overflow-y-auto">
                                  {replaceSearchResults.map(prod => (
                                    <div
                                      key={prod.sku}
                                      className="p-2 hover:bg-primary-50 cursor-pointer flex justify-between"
                                      onClick={() =>
                                        handleAddReplaceProduct(item.sku, prod, returnItems.find(i => i.sku === item.sku)?.returnQty || 1)
                                      }
                                    >
                                      <span>{prod.name} ({prod.sku})</span>
                                      <span>Stock: {prod.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {replaceItems.find(r => r.originalSku === item.sku) && (
                                <div className="mt-1 text-xs text-purple-700">
                                  Replaced with: {replaceItems.find(r => r.originalSku === item.sku)?.name}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-4">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={handleProcessReturnReplaceExchange}
                    disabled={returnItems.length === 0}
                  >
                    Process Return/Exchange/Replace
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    onClick={() => {
                      setReturnInvoice(null);
                      setReturnInvoiceNum('');
                      setReturnItems([]);
                      setExchangeItems([]);
                      setReplaceItems([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'returnHistory' ? (
        // Return/Replace/Exchange History Tab
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-primary-700">Return / Replace / Exchange History</h2>
            <div className="overflow-x-auto">
              <table className="w-full border rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Invoice #</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Returned</th>
                    <th className="px-2 py-2">Exchanged</th>
                    <th className="px-2 py-2">Replaced</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">No history found</td>
                    </tr>
                  )}
                  {history.map(entry => (
                    <tr key={entry.id}>
                      <td className="px-2 py-2">{new Date(entry.date).toLocaleString()}</td>
                      <td className="px-2 py-2">{entry.invoiceNumber}</td>
                      <td className="px-2 py-2">{entry.customerName} {entry.mobile && <span>({entry.mobile})</span>}</td>
                      <td className="px-2 py-2">
                        {entry.returned && entry.returned.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {entry.returned.map(i => (
                              <li key={i.sku}>{i.name} ({i.sku}) x {i.returnQty}</li>
                            ))}
                          </ul>
                        ) : '-'}
                      </td>
                      <td className="px-2 py-2">
                        {entry.exchanged && entry.exchanged.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {entry.exchanged.map(i => (
                              <li key={i.originalSku}>{i.name} ({i.sku}) x {i.qty}</li>
                            ))}
                          </ul>
                        ) : '-'}
                      </td>
                      <td className="px-2 py-2">
                        {entry.replaced && entry.replaced.length > 0 ? (
                          <ul className="list-disc pl-4">
                            {entry.replaced.map(i => (
                              <li key={i.originalSku}>{i.name} ({i.sku}) x {i.qty}</li>
                            ))}
                          </ul>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
      {/* ...existing code for modals... */}
    </div>
  );
};

export default NewBill;
