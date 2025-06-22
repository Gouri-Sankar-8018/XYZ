import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSuppliers } from '../context/SuppliersContext';
import { useProducts } from '../context/ProductsContext';
import { useInventory } from '../context/InventoryContext';
import '../App.css';

const Products = () => {
  const [activeTab, setActiveTab] = useState('list');
  const { products, setProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    productId: `PRD-${Date.now()}`,
    name: '',
    category: '',
    brand: '',
    supplierId: '',
    size: '',
    color: '',
    fabricType: '',
    gender: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    minStockAlert: '',
    taxRate: '',
    warehouseLocation: '',
    expiryDate: '',
    sku: ''
  });
  const [filters, setFilters] = useState({
    name: '',
    color: '',
    size: '',
    category: 'all',
    supplierId: '',
    supplierName: '' // Add this new filter
  });
  const [sorting, setSorting] = useState({
    field: 'name',
    direction: 'asc'
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const { suppliers } = useSuppliers();
  const { initializeInventory } = useInventory();

  // Remove static data, use localStorage for all dropdowns
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('brands');
    return saved ? JSON.parse(saved) : [];
  });
  const [sizes, setSizes] = useState(() => {
    const saved = localStorage.getItem('sizes');
    return saved ? JSON.parse(saved) : [];
  });
  const [colors, setColors] = useState(() => {
    const saved = localStorage.getItem('colors');
    return saved ? JSON.parse(saved) : [];
  });
  const [fabricTypes, setFabricTypes] = useState(() => {
    const saved = localStorage.getItem('fabricTypes');
    return saved ? JSON.parse(saved) : [];
  });
  const [genders, setGenders] = useState(() => {
    const saved = localStorage.getItem('genders');
    return saved ? JSON.parse(saved) : [];
  });

  // Generate SKU
  const generateSKU = useCallback((data) => {
    if (!data.supplierId || !data.category || !data.brand || !data.size || !data.color) return '';

    const supplierCode = data.supplierId.split('SUP')[1] || '0001';
    const category = data.category.substring(0, 6).toUpperCase();
    const brand = data.brand.substring(0, 2).toUpperCase();
    const size = data.size.toUpperCase();
    const color = data.color.substring(0, 3).toUpperCase();

    return `SUP${supplierCode}-${category}-${brand}-${size}-${color}`;
  }, []);

  // Handle form change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'supplierId') {
      const selectedSupplier = suppliers.find(s => s.supplierId === value);
      if (selectedSupplier) {
        // Get categories from selected supplier's products
        const supplierCategories = selectedSupplier.products.map(p => p.category);
        setAvailableCategories(supplierCategories);
        // Reset category when supplier changes
        setFormData(prev => ({
          ...prev,
          [name]: value,
          category: '',
          sku: ''
        }));
        return;
      }
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // Auto-generate SKU when required fields are filled
      if (['supplierId', 'category', 'brand', 'size', 'color'].includes(name)) {
        newData.sku = generateSKU(newData);
      }
      return newData;
    });
  }, [generateSKU, suppliers]);

  // Modify handleSubmit to show confirmation dialog
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const confirmMessage = 'Please review your product details carefully. Once added, products cannot be modified.\n\nDo you want to proceed with saving this product?';
    
    if (window.confirm(confirmMessage)) {
      // Add new product
      const newProduct = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setProducts(prev => {
        const updated = [...prev, newProduct];
        initializeInventory(updated);
        return updated;
      });

      // Reset form
      setFormData({
        productId: `PRD-${Date.now()}`,
        name: '',
        category: '',
        brand: '',
        supplierId: '',
        size: '',
        color: '',
        fabricType: '',
        gender: '',
        costPrice: '',
        sellingPrice: '',
        quantity: '',
        minStockAlert: '',
        taxRate: '',
        warehouseLocation: '',
        expiryDate: '',
        sku: ''
      });
      setAvailableCategories([]);
      setActiveTab('list');
    }
  }, [formData, setProducts, initializeInventory]);

  // Handle sort column click
  const handleSort = (field) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Add delete handler
  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // Add view handler
  const handleView = (product) => {
    setSelectedProduct(product);
    setViewModal(true);
  };

  // Enhanced filter function
  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products
      .filter(product => {
        const matchesName = product.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesColor = !filters.color || product.color === filters.color;
        const matchesSize = !filters.size || product.size === filters.size;
        const matchesCategory = filters.category === 'all' || product.category === filters.category;
        const matchesSupplierId = !filters.supplierId || product.supplierId.includes(filters.supplierId);
        
        // Add supplier name filter
        const supplierName = suppliers.find(s => s.supplierId === product.supplierId)?.basicInfo.businessName || '';
        const matchesSupplierName = !filters.supplierName || 
          supplierName.toLowerCase().includes(filters.supplierName.toLowerCase());

        return matchesName && matchesColor && matchesSize && 
               matchesCategory && matchesSupplierId && matchesSupplierName;
      })
      .sort((a, b) => {
        const direction = sorting.direction === 'asc' ? 1 : -1;

        switch (sorting.field) {
          case 'name':
            return a.name.localeCompare(b.name) * direction;
          case 'price':
            return (a.sellingPrice - b.sellingPrice) * direction;
          case 'quantity':
            return (a.quantity - b.quantity) * direction;
          default:
            return 0;
        }
      });
  }, [products, filters, sorting, suppliers]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handlePrintBarcodes = () => {
    const selectedItems = products.filter(p => selectedProducts.includes(p.id));
    // TODO: Implement barcode printing logic
    console.log('Printing barcodes for:', selectedItems);
  };

  // Optionally, update dropdowns if localStorage changes elsewhere
  useEffect(() => {
    const syncDropdowns = () => {
      setCategories(localStorage.getItem('categories') ? JSON.parse(localStorage.getItem('categories')) : []);
      setBrands(localStorage.getItem('brands') ? JSON.parse(localStorage.getItem('brands')) : []);
      setSizes(localStorage.getItem('sizes') ? JSON.parse(localStorage.getItem('sizes')) : []);
      setColors(localStorage.getItem('colors') ? JSON.parse(localStorage.getItem('colors')) : []);
      setFabricTypes(localStorage.getItem('fabricTypes') ? JSON.parse(localStorage.getItem('fabricTypes')) : []);
      setGenders(localStorage.getItem('genders') ? JSON.parse(localStorage.getItem('genders')) : []);
    };
    window.addEventListener('storage', syncDropdowns);
    return () => window.removeEventListener('storage', syncDropdowns);
  }, []);

  return (
    <div className="w-full h-full p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Product Management</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            className={`tab-button ${activeTab === 'list' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('list')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Product List
          </button>
          <button
            className={`tab-button ${activeTab === 'add' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('add')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        // Product List View
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Print Barcode Button Section */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <button
              onClick={handlePrintBarcodes}
              disabled={selectedProducts.length === 0}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg ${
                selectedProducts.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <i className="fas fa-barcode mr-2"></i>
              Print Barcodes ({selectedProducts.length})
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4">
              <input
                type="text"
                placeholder="Search by product name..."
                className="input-field"
                value={filters.name}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Search by supplier ID..."
                className="input-field"
                value={filters.supplierId}
                onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Search by supplier name..."
                className="input-field"
                value={filters.supplierName}
                onChange={(e) => setFilters(prev => ({ ...prev, supplierName: e.target.value }))}
              />
              <select
                className="input-field"
                value={filters.color}
                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
              >
                <option value="">All Colors</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <select
                className="input-field"
                value={filters.size}
                onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
              >
                <option value="">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <select
                className="input-field"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Product Cards */}
          <div className="block sm:hidden">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-primary-600"
                      />
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{product.sku}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }}></div>
                      <span className="text-sm">{product.color} | {product.size}</span>
                    </div>
                    <p className="text-sm">
                      Stock: <span className={product.quantity <= product.minStockAlert ? 'text-red-600' : 'text-green-600'}>
                        {product.quantity}
                      </span>
                    </p>
                    <p className="text-sm">Price: ₹{product.sellingPrice}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handleView(product)}
                      className="p-2 text-blue-600 hover:text-blue-800">
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Product Name
                      {sorting.field === 'name' && (
                        <i className={`fas fa-sort-${sorting.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('quantity')}>
                    <div className="flex items-center gap-2">
                      Stock
                      {sorting.field === 'quantity' && (
                        <i className={`fas fa-sort-${sorting.direction === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: product.color }}></div>
                          <span className="text-sm text-gray-500">{product.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${product.quantity <= product.minStockAlert
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.costPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.sellingPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {suppliers.find(s => s.supplierId === product.supplierId)?.basicInfo.businessName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => handleView(product)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(product.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Add New Product Form
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-0">
              Add New Product
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Auto-generated fields */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product ID</label>
              <input
                type="text"
                value={formData.productId}
                className="input-field w-full bg-gray-50 text-sm sm:text-base"
                readOnly
              />
            </div>

            {/* Basic Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Supplier *</label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.supplierId}>
                    {supplier.basicInfo.businessName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
                required
                disabled={!formData.supplierId}
              >
                <option value="">Select Category</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {!formData.supplierId && (
                <p className="text-sm text-gray-500 mt-1">Please select a supplier first</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Brand *</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Size *</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Size</option>
                {sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Color *</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Color</option>
                {colors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fabric Type</label>
              <select
                name="fabricType"
                value={formData.fabricType}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select Fabric</option>
                {fabricTypes.map(fabric => (
                  <option key={fabric} value={fabric}>{fabric}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gendefr}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select Gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cost Price *</label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleInputChange}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Selling Price *</label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="input-field"
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Minimum Stock Alert</label>
              <input
                type="number"
                name="minStockAlert"
                value={formData.minStockAlert}
                onChange={handleInputChange}
                className="input-field"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tax/GST Rate (%)</label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Warehouse Location</label>
              <input
                type="text"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input
                type="text"
                value={formData.sku}
                className="input-field w-full bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Product
            </button>
          </div>
        </form>
      )}

      {/* Add View Modal */}
      {viewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            {/* Close button */}
            <button 
              onClick={() => {
                setViewModal(false);
                setSelectedProduct(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Modal header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Product Details</h2>
              <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
            </div>

            {/* Modal content with responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-4">Basic Information</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium">Product ID:</span> {selectedProduct.productId}</p>
                  <p><span className="font-medium">Name:</span> {selectedProduct.name}</p>
                  <p><span className="font-medium">SKU:</span> {selectedProduct.sku}</p>
                  <p><span className="font-medium">Category:</span> {selectedProduct.category}</p>
                  <p><span className="font-medium">Brand:</span> {selectedProduct.brand}</p>
                  <p><span className="font-medium">Supplier:</span> {
                    suppliers.find(s => s.supplierId === selectedProduct.supplierId)?.basicInfo.businessName
                  }</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-4">Product Details</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium">Size:</span> {selectedProduct.size}</p>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Color:</span>
                    <div className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: selectedProduct.color }}></div>
                    {selectedProduct.color}
                  </div>
                  <p><span className="font-medium">Fabric Type:</span> {selectedProduct.fabricType || 'N/A'}</p>
                  <p><span className="font-medium">Gender:</span> {selectedProduct.gender || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-4">Pricing & Stock</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium">Cost Price:</span> ₹{selectedProduct.costPrice.toLocaleString()}</p>
                  <p><span className="font-medium">Selling Price:</span> ₹{selectedProduct.sellingPrice.toLocaleString()}</p>
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Current Stock:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedProduct.quantity <= selectedProduct.minStockAlert 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedProduct.quantity}
                    </span>
                  </p>
                  <p><span className="font-medium">Minimum Stock Alert:</span> {selectedProduct.minStockAlert}</p>
                  <p><span className="font-medium">Tax Rate:</span> {selectedProduct.taxRate}%</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-4">Additional Information</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium">Warehouse Location:</span> {selectedProduct.warehouseLocation || 'N/A'}</p>
                  <p><span className="font-medium">Expiry Date:</span> {
                    selectedProduct.expiryDate 
                      ? new Date(selectedProduct.expiryDate).toLocaleDateString() 
                      : 'N/A'
                  }</p>
                  <p><span className="font-medium">Created At:</span> {
                    new Date(selectedProduct.createdAt).toLocaleString()
                  }</p>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setViewModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

