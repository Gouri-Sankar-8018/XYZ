import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import '../App.css';
import { useSuppliers } from '../context/SuppliersContext';
import { useProducts } from '../context/ProductsContext'; // Add this import
import { useInventory } from '../context/InventoryContext';

const Suppliers = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'list');
  const { suppliers, setSuppliers } = useSuppliers();
  const { products, setProducts } = useProducts(); // Update this line to get setProducts
  const { inventory } = useInventory();
  const [formData, setFormData] = useState({
    supplierId: `SUP-${String(Date.now()).slice(-6)}`, // Add supplier ID
    basicInfo: {
      name: '',
      businessName: '',
      contact: '',
      contactNumber: '',
      email: '',
      gstin: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: '',
      paymentTerms: 'immediate', // Add new field
      status: 'active', // Add new field
    },
    products: [],
  });
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Add validation state
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = useCallback((data) => {
    const newErrors = {};

    // Basic Info validation
    if (!data.basicInfo.name) newErrors.name = 'Name is required';
    if (!data.basicInfo.businessName) newErrors.businessName = 'Business name is required';
    if (!data.basicInfo.contact) newErrors.contact = 'Contact is required';
    if (!data.basicInfo.contactNumber) newErrors.contactNumber = 'Alternate contact is required';
    if (!data.basicInfo.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.basicInfo.email)) newErrors.email = 'Invalid email format';
    if (!data.basicInfo.gstin) newErrors.gstin = 'GSTIN is required';

    // Bank details validation
    if (!data.bankDetails.accountNumber) newErrors.accountNumber = 'Account number is required';
    if (!data.bankDetails.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (!data.bankDetails.confirmAccountNumber) newErrors.confirmAccountNumber = 'Please confirm account number';
    else if (data.bankDetails.accountNumber !== data.bankDetails.confirmAccountNumber) newErrors.confirmAccountNumber = 'Account numbers do not match';

    return newErrors;
  }, []);

  const handleAddSupplier = useCallback((e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newSupplier = {
      id: Date.now(),
      supplierId: `SUP-${String(Date.now()).slice(-6)}`, // Generate new ID for each supplier
      ...formData,
      createdAt: new Date().toISOString(),
    };

    setSuppliers(prev => [...prev, newSupplier]);
    setActiveTab('list');
    setFormData({
      supplierId: `SUP-${String(Date.now()).slice(-6)}`, // Reset with new ID
      basicInfo: { name: '', contact: '', email: '', gstin: '' },
      address: { street: '', city: '', state: '', pincode: '' },
      bankDetails: {
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branch: '',
        paymentTerms: 'immediate',
        status: 'active'
      },
      products: [],
    });
    setErrors({});
  }, [formData, validateForm]);

  // Initialize deletedSuppliers from localStorage
  const [deletedSuppliers, setDeletedSuppliers] = useState(() => {
    const stored = localStorage.getItem('deletedSuppliers');
    return stored ? JSON.parse(stored) : [];
  });
  const [dateFilter, setDateFilter] = useState('');
  const [filteredDeletedSuppliers, setFilteredDeletedSuppliers] = useState([]);

  // Update localStorage when deletedSuppliers changes
  useEffect(() => {
    localStorage.setItem('deletedSuppliers', JSON.stringify(deletedSuppliers));
  }, [deletedSuppliers]);

  // Replace the existing handleDelete function with this new one
  const handleDelete = useCallback((id) => {
    // Find the supplier
    const supplier = suppliers.find(s => s.id === id);

    // Check if any products exist with this supplier ID and have stock
    const hasStock = products.some(product => {
      const inventoryItem = inventory.find(item => item.sku === product.sku);
      return product.supplierId === supplier.supplierId &&
        inventoryItem &&
        inventoryItem.quantityInStock > 0;
    });

    if (hasStock) {
      alert('Cannot delete this supplier. There are products in stock associated with this supplier. Please clear the stock first.');
      return;
    }

    // If no stock, show confirmation dialog
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      const supplierToDelete = suppliers.find(s => s.id === id);
      const deletedSupplier = {
        ...supplierToDelete,
        deletedAt: new Date().toISOString()
      };

      setDeletedSuppliers(prev => [...prev, deletedSupplier]);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      
      const updatedProducts = products.filter(product => 
        product.supplierId !== supplierToDelete.supplierId
      );
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    }
  }, [suppliers, products, inventory, setProducts, setSuppliers]);

  const [editProduct, setEditProduct] = useState({
    category: '',
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [editProductInput, setEditProductInput] = useState({ category: '' });

  // Add this useEffect to load categories
  useEffect(() => {
    const loadCategories = () => {
      const saved = localStorage.getItem('categories');
      if (saved) {
        setAvailableCategories(JSON.parse(saved));
      }
    };
    loadCategories();
    
    // Add event listener for storage changes
    window.addEventListener('storage', loadCategories);
    return () => window.removeEventListener('storage', loadCategories);
  }, []);

  const addProduct = useCallback(() => {
    if (editProduct.category) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { ...editProduct }]
      }));
      setEditProduct({ category: '' });
    }
  }, [editProduct]);

  // Replace the hardcoded categories with the availableCategories
  const productCategories = availableCategories;
  
  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setViewModal(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier({ ...supplier });
    setEditModal(true);
  };

  const handleUpdate = useCallback((e) => {
    e.preventDefault();
    const validationErrors = validateForm(selectedSupplier);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSuppliers(prev => prev.map(sup =>
      sup.id === selectedSupplier.id ? {
        ...selectedSupplier,
        updatedAt: new Date().toISOString()
      } : sup
    ));
    setEditModal(false);
    setErrors({});
  }, [selectedSupplier, validateForm]);

  // Render error message helper
  const renderError = useCallback((field) => {
    return errors[field] ? (
      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
    ) : null;
  }, [errors]);

  // Modified input field component
  const InputField = useCallback(({ label, name, value, onChange, type = "text", error, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`input-field w-full ${error ? 'border-red-500' : ''}`}
        placeholder={label}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  ), []);

  // Filter deleted suppliers with error handling
  useEffect(() => {
    try {
      if (!dateFilter) {
        setFilteredDeletedSuppliers(deletedSuppliers);
        return;
      }

      const filtered = deletedSuppliers.filter(supplier => {
        const deletedDate = new Date(supplier.deletedAt).toLocaleDateString();
        const filterDate = new Date(dateFilter).toLocaleDateString();
        return deletedDate === filterDate;
      });
      setFilteredDeletedSuppliers(filtered);
    } catch (error) {
      console.error('Error filtering deleted suppliers:', error);
      setFilteredDeletedSuppliers([]);
    }
  }, [dateFilter, deletedSuppliers]);

  // Add state for payment terms
  const [availablePaymentTerms, setAvailablePaymentTerms] = useState([]);

  // Load payment terms on component mount
  useEffect(() => {
    const loadPaymentTerms = () => {
      const saved = localStorage.getItem('paymentTerms');
      if (saved) {
        setAvailablePaymentTerms(JSON.parse(saved));
      }
    };
    
    loadPaymentTerms();
    // Listen for changes in payment terms
    window.addEventListener('storage', loadPaymentTerms);
    return () => window.removeEventListener('storage', loadPaymentTerms);
  }, []);

  // Replace the payment terms select elements with this updated version
  const PaymentTermsSelect = ({ value, onChange, className = "input-field" }) => (
    <select
      className={className}
      value={value}
      onChange={onChange}
    >
      <option value="">Select Payment Terms</option>
      {availablePaymentTerms.map(term => (
        <option key={term.id} value={term.name}>
          {term.name} ({term.days} days)
        </option>
      ))}
    </select>
  );

  const handleAddProductToEdit = () => {
    if (
      editProductInput.category &&
      !selectedSupplier.products.some(
        (p) => p.category === editProductInput.category
      )
    ) {
      setSelectedSupplier((prev) => ({
        ...prev,
        products: [
          ...prev.products,
          { id: Date.now() + Math.random(), category: editProductInput.category }
        ]
      }));
      setEditProductInput({ category: '' });
    }
  };

  const handleRemoveProductFromEdit = (id) => {
    setSelectedSupplier((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id)
    }));
  };

  const handleEditProductCategory = (id, newCategory) => {
    setSelectedSupplier((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, category: newCategory } : p
      )
    }));
  };

  return (
    <div className="w-full h-full p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Supplier Management</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            className={`tab-button ${activeTab === 'list' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('list')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List of Suppliers
          </button>
          <button
            className={`tab-button ${activeTab === 'add' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('add')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Supplier
          </button>
          <button
            className={`tab-button ${activeTab === 'deleted' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('deleted')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deleted History
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="table-header">
                  <tr>
                    <th>Supplier ID</th>
                    <th>Name</th>
                    <th>Business Name</th>
                    <th>Contact Name</th>
                    <th>Contact Number</th>
                    <th>Email</th>
                    <th>GSTIN</th>
                    <th>City</th>
                    <th>Products</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.supplierId}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.basicInfo.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.basicInfo.businessName}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.basicInfo.contact}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.basicInfo.contactNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.basicInfo.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.basicInfo.gstin}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.address?.city}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">{supplier.products.length}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            className="table-action-btn text-blue-600 hover:bg-blue-50"
                            onClick={() => handleView(supplier)}
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="table-action-btn text-green-600 hover:bg-green-50"
                            onClick={() => handleEdit(supplier)}
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="table-action-btn text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(supplier.id)}
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'add' ? (
        <form onSubmit={handleAddSupplier} className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Owner Name"
                  value={formData.basicInfo.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    basicInfo: { ...formData.basicInfo, name: e.target.value }
                  })}
                  error={errors.name}
                  className="w-full"
                />
                <InputField
                  label="Business Name"
                  value={formData.basicInfo.businessName}
                  onChange={(e) => setFormData({
                    ...formData,
                    basicInfo: { ...formData.basicInfo, businessName: e.target.value }
                  })}
                  error={errors.businessName}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Contact Name"
                  value={formData.basicInfo.contact}
                  onChange={(e) => setFormData({
                    ...formData,
                    basicInfo: { ...formData.basicInfo, contact: e.target.value }
                  })}
                  error={errors.contact}
                  className="w-full"
                />
                <InputField
                  label="Contact Number"
                  value={formData.basicInfo.contactNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    basicInfo: { ...formData.basicInfo, contactNumber: e.target.value }
                  })}
                  error={errors.contactNumber}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  type="email"
                  value={formData.basicInfo.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    basicInfo: { ...formData.basicInfo, email: e.target.value }
                  })}
                  error={errors.email}
                  className="w-full"
                />
                <InputField
                  label="GSTIN"
                  value={formData.basicInfo.gstin}
                  onChange={(e) => setFormData({
                    ...formData,
                    basicInfo: { ...formData.basicInfo, gstin: e.target.value }
                  })}
                  error={errors.gstin}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Address Details Card */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Address Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input
                    type="text"
                    placeholder="Street"
                    className="input-field"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    className="input-field"
                    value={formData.address.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    className="input-field"
                    value={formData.address.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="input-field"
                    value={formData.address.pincode}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Bank Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={formData.bankDetails.accountName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                    })}
                    placeholder="Enter account name"
                  />
                </div>

                {/* Simplified Account Number field */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input
                    type="password"
                    className={`input-field w-full ${errors.accountNumber ? 'border-red-500' : ''}`}
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          accountNumber: value,
                          confirmAccountNumber: '' // Reset confirm field when account number changes
                        }
                      });
                    }}
                    placeholder="Enter account number"
                    maxLength={20}
                  />
                  {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                </div>

                {/* Simplified Confirm Account Number field */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Account Number</label>
                  <div className="relative">
                    <input
                      type="password"
                      className={`input-field w-full ${
                        formData.bankDetails.confirmAccountNumber && 
                        formData.bankDetails.confirmAccountNumber !== formData.bankDetails.accountNumber 
                          ? 'border-red-500' 
                          : formData.bankDetails.confirmAccountNumber === formData.bankDetails.accountNumber 
                            ? 'border-green-500' 
                            : ''
                      }`}
                      value={formData.bankDetails.confirmAccountNumber || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
                        setFormData({
                          ...formData,
                          bankDetails: { ...formData.bankDetails, confirmAccountNumber: value }
                        });
                      }}
                      placeholder="Confirm account number"
                      maxLength={20}
                    />
                    {formData.bankDetails.confirmAccountNumber && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formData.bankDetails.confirmAccountNumber === formData.bankDetails.accountNumber ? (
                          '✓'
                        ) : (
                          '×'
                        )}
                      </span>
                    )}
                  </div>
                  {formData.bankDetails.confirmAccountNumber && 
                   formData.bankDetails.confirmAccountNumber !== formData.bankDetails.accountNumber && (
                    <p className="text-red-500 text-sm mt-1">Account numbers do not match</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="Bank Name"
                    className="input-field"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                    })}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    className="input-field"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, ifscCode: e.target.value }
                    })}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input
                    type="text"
                    placeholder="Branch"
                    className="input-field"
                    value={formData.bankDetails.branch}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, branch: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <PaymentTermsSelect
                    value={formData.bankDetails.paymentTerms}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, paymentTerms: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <select
                    className="input-field"
                    value={formData.bankDetails.status}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, status: e.target.value }
                    })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Categories Card */}
          <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Product Categories</h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  className="input-field flex-1"
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addProduct}
                  className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {formData.products.map((product) => (
                  <div key={product.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span className="font-medium">{product.category}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        products: formData.products.filter(p => p.id !== product.id)
                      })}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium
            hover:bg-primary-600 transition-colors duration-200 shadow-sm hover:shadow
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Save Supplier
          </button>
        </form>
      ) : activeTab === 'deleted' ? (
        <div className="mt-4 sm:mt-6">
          <div className="mb-4 flex justify-end">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field w-full sm:w-auto"
            />
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeletedSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="px-6 py-4">{supplier.supplierId}</td>
                    <td className="px-6 py-4">{supplier.basicInfo.name}</td>
                    <td className="px-6 py-4">{supplier.basicInfo.businessName}</td>
                    <td className="px-6 py-4">{supplier.basicInfo.contact}</td>
                    <td className="px-6 py-4">{supplier.basicInfo.email}</td>
                    <td className="px-6 py-4">
                      {new Date(supplier.deletedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDeletedSuppliers.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No deleted suppliers found
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Supplier Details</h2>
              <button onClick={() => setViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedSupplier && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Basic Information</h3>
                    <p>Supplier ID: {selectedSupplier.supplierId}</p>
                    <p>Name: {selectedSupplier.basicInfo.name}</p>
                    <p>Business Name: {selectedSupplier.basicInfo.businessName}</p>
                    <p>Contact: {selectedSupplier.basicInfo.contact}</p>
                    <p>Contact Number: {selectedSupplier.basicInfo.contactNumber}</p>
                    <p>Email: {selectedSupplier.basicInfo.email}</p>
                    <p>GSTIN: {selectedSupplier.basicInfo.gstin}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Address</h3>
                    <p>Street: {selectedSupplier.address.street}</p>
                    <p>City: {selectedSupplier.address.city}</p>
                    <p>State: {selectedSupplier.address.state}</p>
                    <p>Pincode: {selectedSupplier.address.pincode}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <p>Account Name: {selectedSupplier.bankDetails.accountName}</p>
                    <p>Account Number: {selectedSupplier.bankDetails.accountNumber}</p>
                    <p>Bank Name: {selectedSupplier.bankDetails.bankName}</p>
                    <p>IFSC Code: {selectedSupplier.bankDetails.ifscCode}</p>
                    <p>Branch: {selectedSupplier.bankDetails.branch}</p>
                    <p>Payment Terms: {selectedSupplier.bankDetails.paymentTerms}</p>
                    <p>Status: {selectedSupplier.bankDetails.status}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Products</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {selectedSupplier.products.map((product) => (
                      <div key={product.id} className="bg-gray-50 p-3 rounded">
                        <span className="font-medium text-gray-800">{product.category}</span>
                      </div>
                    ))}
                    {selectedSupplier.products.length === 0 && (
                      <p className="col-span-full text-gray-500 text-center py-4">
                        No product categories added
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Supplier</h2>
              <button onClick={() => setEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedSupplier && (
              <form onSubmit={handleUpdate} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Name"
                      value={selectedSupplier.basicInfo.name}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        basicInfo: { ...selectedSupplier.basicInfo, name: e.target.value }
                      })}
                      error={errors.name}
                      className="w-full"
                    />
                    <InputField
                      label="Business Name"
                      value={selectedSupplier.basicInfo.businessName}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        basicInfo: { ...selectedSupplier.basicInfo, businessName: e.target.value }
                      })}
                      error={errors.businessName}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Contact"
                      value={selectedSupplier.basicInfo.contact}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        basicInfo: { ...selectedSupplier.basicInfo, contact: e.target.value }
                      })}
                      error={errors.contact}
                      className="w-full"
                    />
                    <InputField
                      label="Contact Number"
                      value={selectedSupplier.basicInfo.contactNumber}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        basicInfo: { ...selectedSupplier.basicInfo, contactNumber: e.target.value }
                      })}
                      error={errors.contactNumber}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Email"
                      type="email"
                      value={selectedSupplier.basicInfo.email}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        basicInfo: { ...selectedSupplier.basicInfo, email: e.target.value }
                      })}
                      error={errors.email}
                      className="w-full"
                    />
                    <InputField
                      label="GSTIN"
                      value={selectedSupplier.basicInfo.gstin}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        basicInfo: { ...selectedSupplier.basicInfo, gstin: e.target.value }
                      })}
                      error={errors.gstin}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Address Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Street</label>
                      <input
                        type="text"
                        placeholder="Street"
                        className="input-field"
                        value={selectedSupplier.address.street}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          address: { ...selectedSupplier.address, street: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="input-field"
                        value={selectedSupplier.address.city}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          address: { ...selectedSupplier.address, city: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="input-field"
                        value={selectedSupplier.address.state}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          address: { ...selectedSupplier.address, state: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        placeholder="Pincode"
                        className="input-field"
                        value={selectedSupplier.address.pincode}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          address: { ...selectedSupplier.address, pincode: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Account Name</label>
                      <input
                        type="text"
                        placeholder="Account Name"
                        className="input-field"
                        value={selectedSupplier.bankDetails.accountName}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          bankDetails: { ...selectedSupplier.bankDetails, accountName: e.target.value }
                        })}
                      />
                    </div>
                    <InputField
                      label="Account Number"
                      value={selectedSupplier.bankDetails.accountNumber}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        bankDetails: { ...selectedSupplier.bankDetails, accountNumber: e.target.value }
                      })}
                      error={errors.accountNumber}
                      className="w-full"
                    />
                    <InputField
                      label="Confirm Account Number"
                      value={selectedSupplier.bankDetails.confirmAccountNumber || ''}
                      onChange={(e) => setSelectedSupplier({
                        ...selectedSupplier,
                        bankDetails: { ...selectedSupplier.bankDetails, confirmAccountNumber: e.target.value }
                      })}
                      error={errors.confirmAccountNumber}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="Bank Name"
                        className="input-field"
                        value={selectedSupplier.bankDetails.bankName}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          bankDetails: { ...selectedSupplier.bankDetails, bankName: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="IFSC Code"
                        className="input-field"
                        value={selectedSupplier.bankDetails.ifscCode}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          bankDetails: { ...selectedSupplier.bankDetails, ifscCode: e.target.value }
                        })}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Branch</label>
                      <input
                        type="text"
                        placeholder="Branch"
                        className="input-field"
                        value={selectedSupplier.bankDetails.branch}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          bankDetails: { ...selectedSupplier.bankDetails, branch: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                      <PaymentTermsSelect
                        value={selectedSupplier.bankDetails.paymentTerms}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          bankDetails: { ...selectedSupplier.bankDetails, paymentTerms: e.target.value }
                        })}
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Account Status</label>
                      <select
                        className="input-field"
                        value={selectedSupplier.bankDetails.status}
                        onChange={(e) => setSelectedSupplier({
                          ...selectedSupplier,
                          bankDetails: { ...selectedSupplier.bankDetails, status: e.target.value }
                        })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Product Categories Edit Section */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Product Categories</h3>
                  <div className="flex flex-col sm:flex-row gap-4 mb-3">
                    <select
                      className="input-field flex-1"
                      value={editProductInput.category}
                      onChange={(e) =>
                        setEditProductInput({ category: e.target.value })
                      }
                    >
                      <option value="">Select Category</option>
                      {productCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleAddProductToEdit}
                      className="w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Add Category
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSupplier.products.map((product) => (
                      <div key={product.id} className="flex items-center bg-gray-50 p-3 rounded gap-2">
                        <select
                          className="input-field flex-1"
                          value={product.category}
                          onChange={(e) =>
                            handleEditProductCategory(product.id, e.target.value)
                          }
                        >
                          <option value="">Select Category</option>
                          {productCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveProductFromEdit(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {selectedSupplier.products.length === 0 && (
                      <p className="col-span-full text-gray-500 text-center py-4">
                        No product categories added
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600"
                >
                  Update Supplier
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
