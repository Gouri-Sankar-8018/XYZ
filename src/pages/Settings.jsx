import { useState, useEffect, useCallback } from 'react';
import { Tabs } from 'antd';

const Settings = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    website: '',
    contactPerson: ''
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: 'INV',
    startNumber: 1000,
    defaultTaxRate: 18,
    termsAndConditions: '',
    footer: '',
    showLogo: true,
    paymentTerms: 'immediate',
    currency: 'INR'
  });

  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    logo: null,
    logoPreview: '',
    openingTime: '',
    closingTime: '',
    workingDays: [], // Initialize as empty array
    branchCode: ''
  });

  const [staff, setStaff] = useState([]);
  const [newStaff, setNewStaff] = useState({
    id: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
    status: 'active'
  });

  // Categories: Remove static defaults, only use localStorage or empty array
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [];
  });

  // Payment Terms: Remove static defaults, only use localStorage or empty array
  const [paymentTerms, setPaymentTerms] = useState(() => {
    const saved = localStorage.getItem('paymentTerms');
    return saved ? JSON.parse(saved) : [];
  });

  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [newPaymentTerm, setNewPaymentTerm] = useState({ name: '', days: '' });

  const [shippingAddresses, setShippingAddresses] = useState(() => {
    const saved = localStorage.getItem('shippingAddresses');
    return saved ? JSON.parse(saved) : [];
  });

  const [newAddress, setNewAddress] = useState({
    id: '',
    name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: '',
    phone: ''
  });

  const [categorySearch, setCategorySearch] = useState('');

  // Add new states for product master data
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

  // Add new states for new entries
  const [newBrand, setNewBrand] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newFabricType, setNewFabricType] = useState('');
  const [newGender, setNewGender] = useState('');

  useEffect(() => {
    const loadSettings = () => {
      const savedBusinessInfo = localStorage.getItem('businessInfo');
      const savedInvoiceSettings = localStorage.getItem('invoiceSettings');
      const savedStoreSettings = localStorage.getItem('storeSettings');
      const savedStaff = localStorage.getItem('staff');

      if (savedBusinessInfo) setBusinessInfo(JSON.parse(savedBusinessInfo));
      if (savedInvoiceSettings) setInvoiceSettings(JSON.parse(savedInvoiceSettings));
      if (savedStoreSettings) setStoreSettings(JSON.parse(savedStoreSettings));
      if (savedStaff) setStaff(JSON.parse(savedStaff));
    };

    loadSettings();
  }, []);

  const handleSaveBusinessInfo = (e) => {
    e.preventDefault();
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    alert('Business information saved successfully!');
  };

  const handleSaveInvoiceSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('invoiceSettings', JSON.stringify(invoiceSettings));
    alert('Invoice settings saved successfully!');
  };

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
    alert('Store settings saved successfully!');
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    const staffId = `STF${String(Date.now()).slice(-6)}`;
    const newStaffMember = { ...newStaff, id: staffId };
    
    setStaff(prev => {
      const updated = [...prev, newStaffMember];
      localStorage.setItem('staff', JSON.stringify(updated));
      return updated;
    });

    setNewStaff({
      id: '',
      name: '',
      role: '',
      email: '',
      phone: '',
      password: '',
      status: 'active'
    });
  };

  const handleDeleteStaff = (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      setStaff(prev => {
        const updated = prev.filter(s => s.id !== id);
        localStorage.setItem('staff', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreSettings(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category}"?`)) {
      const updatedCategories = categories.filter(c => c !== category);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
  };

  const handleEditCategory = (oldCategory, newCategory) => {
    const updatedCategories = categories.map(c => 
      c === oldCategory ? newCategory : c
    );
    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    setEditingCategory(null);
  };

  const handleAddPaymentTerm = (e) => {
    e.preventDefault();
    if (newPaymentTerm.name && newPaymentTerm.days !== '') {
      const newTerm = {
        id: Date.now(),
        ...newPaymentTerm
      };
      const updatedTerms = [...paymentTerms, newTerm];
      setPaymentTerms(updatedTerms);
      localStorage.setItem('paymentTerms', JSON.stringify(updatedTerms));
      setNewPaymentTerm({ name: '', days: '' });
    }
  };

  const handleDeletePaymentTerm = (id) => {
    if (window.confirm('Are you sure you want to delete this payment term?')) {
      const updatedTerms = paymentTerms.filter(term => term.id !== id);
      setPaymentTerms(updatedTerms);
      localStorage.setItem('paymentTerms', JSON.stringify(updatedTerms));
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    const addressId = `ADDR${String(Date.now()).slice(-6)}`;
    const addressToAdd = { ...newAddress, id: addressId };
    
    setShippingAddresses(prev => {
      const updated = [...prev, addressToAdd];
      localStorage.setItem('shippingAddresses', JSON.stringify(updated));
      return updated;
    });

    setNewAddress({
      id: '',
      name: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      contactPerson: '',
      phone: ''
    });
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setShippingAddresses(prev => {
        const updated = prev.filter(addr => addr.id !== id);
        localStorage.setItem('shippingAddresses', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const getFilteredCategories = useCallback(() => {
    return categories.filter(category => 
      category.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Add handlers for add/delete for each master
  const handleAddBrand = (e) => {
    e.preventDefault();
    if (newBrand.trim() && !brands.includes(newBrand.trim())) {
      const updated = [...brands, newBrand.trim()];
      setBrands(updated);
      localStorage.setItem('brands', JSON.stringify(updated));
      setNewBrand('');
    }
  };
  const handleDeleteBrand = (brand) => {
    const updated = brands.filter(b => b !== brand);
    setBrands(updated);
    localStorage.setItem('brands', JSON.stringify(updated));
  };

  const handleAddSize = (e) => {
    e.preventDefault();
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      const updated = [...sizes, newSize.trim()];
      setSizes(updated);
      localStorage.setItem('sizes', JSON.stringify(updated));
      setNewSize('');
    }
  };
  const handleDeleteSize = (size) => {
    const updated = sizes.filter(s => s !== size);
    setSizes(updated);
    localStorage.setItem('sizes', JSON.stringify(updated));
  };

  const handleAddColor = (e) => {
    e.preventDefault();
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      const updated = [...colors, newColor.trim()];
      setColors(updated);
      localStorage.setItem('colors', JSON.stringify(updated));
      setNewColor('');
    }
  };
  const handleDeleteColor = (color) => {
    const updated = colors.filter(c => c !== color);
    setColors(updated);
    localStorage.setItem('colors', JSON.stringify(updated));
  };

  const handleAddFabricType = (e) => {
    e.preventDefault();
    if (newFabricType.trim() && !fabricTypes.includes(newFabricType.trim())) {
      const updated = [...fabricTypes, newFabricType.trim()];
      setFabricTypes(updated);
      localStorage.setItem('fabricTypes', JSON.stringify(updated));
      setNewFabricType('');
    }
  };
  const handleDeleteFabricType = (type) => {
    const updated = fabricTypes.filter(f => f !== type);
    setFabricTypes(updated);
    localStorage.setItem('fabricTypes', JSON.stringify(updated));
  };

  const handleAddGender = (e) => {
    e.preventDefault();
    if (newGender.trim() && !genders.includes(newGender.trim())) {
      const updated = [...genders, newGender.trim()];
      setGenders(updated);
      localStorage.setItem('genders', JSON.stringify(updated));
      setNewGender('');
    }
  };
  const handleDeleteGender = (gender) => {
    const updated = genders.filter(g => g !== gender);
    setGenders(updated);
    localStorage.setItem('genders', JSON.stringify(updated));
  };

  const tabItems = [
    {
      key: 'business',
      label: 'Business Information',
      children: (
        <form onSubmit={handleSaveBusinessInfo} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input
                type="text"
                value={businessInfo.name}
                onChange={e => setBusinessInfo(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                value={businessInfo.contactPerson}
                onChange={e => setBusinessInfo(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={businessInfo.address}
                onChange={e => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                className="input-field"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={businessInfo.phone}
                onChange={e => setBusinessInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={businessInfo.email}
                onChange={e => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GSTIN</label>
              <input
                type="text"
                value={businessInfo.gstin}
                onChange={e => setBusinessInfo(prev => ({ ...prev, gstin: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                value={businessInfo.website}
                onChange={e => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Business Information</button>
        </form>
      ),
    },
    {
      key: 'invoice',
      label: 'Invoice Settings',
      children: (
        <form onSubmit={handleSaveInvoiceSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Prefix</label>
              <input
                type="text"
                value={invoiceSettings.prefix}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, prefix: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Starting Number</label>
              <input
                type="number"
                value={invoiceSettings.startNumber}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, startNumber: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
              <input
                type="number"
                value={invoiceSettings.defaultTaxRate}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, defaultTaxRate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
              <select
                value={invoiceSettings.paymentTerms}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
                className="input-field"
              >
                <option value="immediate">Immediate</option>
                <option value="15days">15 Days</option>
                <option value="30days">30 Days</option>
                <option value="45days">45 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={invoiceSettings.currency}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="input-field"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Terms and Conditions</label>
              <textarea
                value={invoiceSettings.termsAndConditions}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                className="input-field"
                rows="3"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Invoice Footer</label>
              <textarea
                value={invoiceSettings.footer}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, footer: e.target.value }))}
                className="input-field"
                rows="2"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={invoiceSettings.showLogo}
                onChange={e => setInvoiceSettings(prev => ({ ...prev, showLogo: e.target.checked }))}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Show Logo on Invoice</label>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Invoice Settings</button>
        </form>
      ),
    },
    {
      key: 'store',
      label: 'Store Settings',
      children: (
        <form onSubmit={handleSaveStoreSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={e => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch Code</label>
              <input
                type="text"
                value={storeSettings.branchCode}
                onChange={e => setStoreSettings(prev => ({ ...prev, branchCode: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Store Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="input-field"
              />
              {storeSettings.logoPreview && (
                <div className="mt-2">
                  <img
                    src={storeSettings.logoPreview}
                    alt="Store Logo Preview"
                    className="h-20 w-auto object-contain"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Opening Time</label>
              <input
                type="time"
                value={storeSettings.openingTime}
                onChange={e => setStoreSettings(prev => ({ ...prev, openingTime: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Closing Time</label>
              <input
                type="time"
                value={storeSettings.closingTime}
                onChange={e => setStoreSettings(prev => ({ ...prev, closingTime: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={storeSettings.workingDays?.includes(day) || false}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setStoreSettings(prev => ({
                          ...prev,
                          workingDays: isChecked
                            ? [...(prev.workingDays || []), day]
                            : (prev.workingDays || []).filter(d => d !== day)
                        }));
                      }}
                      className="mr-2"
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Store Settings</button>
        </form>
      ),
    },
    {
      key: 'staff',
      label: 'Staff Management',
      children: (
        <div className="space-y-6">
          {/* Add New Staff Form */}
          <form onSubmit={handleAddStaff} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Staff</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={e => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newStaff.role}
                  onChange={e => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="sales">Sales Associate</option>
                  <option value="inventory">Inventory Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={e => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={e => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={e => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={newStaff.status}
                  onChange={e => setNewStaff(prev => ({ ...prev, status: e.target.value }))}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary mt-4">Add Staff Member</button>
          </form>

          {/* Staff List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map(member => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      key: 'categories',
      label: 'Categories & Terms',
      children: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categories Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Categories</h3>
            <div className="space-y-4">
              <form onSubmit={handleAddCategory} className="flex gap-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="input-field flex-1"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Add Category
                </button>
              </form>

              <div className="relative">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="     Search categories..."
                  className="input-field w-full pl-10"
                />
                {categorySearch === '' && (
                  <svg 
                    className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Sl No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredCategories().map((category, index) => (
                      <tr key={category} className={categorySearch && category.toLowerCase().includes(categorySearch.toLowerCase()) ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {editingCategory === category ? (
                            <input
                              type="text"
                              defaultValue={category}
                              className="input-field w-full"
                              onBlur={(e) => handleEditCategory(category, e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditCategory(category, e.target.value);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className={categorySearch && category.toLowerCase().includes(categorySearch.toLowerCase()) ? 'font-medium' : ''}>
                              {category}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {getFilteredCategories().length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
                          No categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Terms Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Terms</h3>
            <form onSubmit={handleAddPaymentTerm} className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={newPaymentTerm.name}
                onChange={(e) => setNewPaymentTerm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Term name"
                className="input-field col-span-2"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newPaymentTerm.days}
                  onChange={(e) => setNewPaymentTerm(prev => ({ ...prev, days: e.target.value }))}
                  placeholder="Days"
                  className="input-field w-20"
                  min="0"
                />
                <button type="submit" className="btn-primary flex-grow whitespace-nowrap">
                  Add Term
                </button>
              </div>
            </form>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentTerms.map((term) => (
                    <tr key={term.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{term.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">{term.days}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeletePaymentTerm(term.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'shipping',
      label: 'Shipping Addresses',
      children: (
        <div className="space-y-6">
          {/* Add New Address Form */}
          <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Name</label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={e => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Head Office, Warehouse, etc."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <textarea
                  value={newAddress.street}
                  onChange={e => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="input-field"
                  rows="2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={e => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={newAddress.state}
                  onChange={e => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                <input
                  type="text"
                  value={newAddress.pincode}
                  onChange={e => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                  className="input-field"
                  maxLength={6}
                  pattern="\d{6}"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input
                  type="text"
                  value={newAddress.contactPerson}
                  onChange={e => setNewAddress(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={newAddress.phone}
                  onChange={e => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                  maxLength={10}
                  pattern="\d{10}"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-4">Add Address</button>
          </form>

          {/* Addresses List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shippingAddresses.map(address => (
              <div key={address.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-lg">{address.name}</h4>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state}</p>
                  <p>PIN: {address.pincode}</p>
                  <p>Contact: {address.contactPerson}</p>
                  <p>Phone: {address.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'product-master',
      label: 'Product Master',
      children: (
        <div className="flex flex-row gap-6">
          {/* Brand */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Brands</h3>
            <form onSubmit={handleAddBrand} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newBrand}
                onChange={e => setNewBrand(e.target.value)}
                placeholder="Add new brand"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
            <ul>
              {brands.map(brand => (
                <li key={brand} className="flex justify-between items-center py-1">
                  <span>{brand}</span>
                  <button onClick={() => handleDeleteBrand(brand)} className="text-red-600 hover:text-red-900">Delete</button>
                </li>
              ))}
              {brands.length === 0 && <li className="text-gray-400">No brands</li>}
            </ul>
          </div>
          {/* Size */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sizes</h3>
            <form onSubmit={handleAddSize} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                placeholder="Add new size"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
            <ul>
              {sizes.map(size => (
                <li key={size} className="flex justify-between items-center py-1">
                  <span>{size}</span>
                  <button onClick={() => handleDeleteSize(size)} className="text-red-600 hover:text-red-900">Delete</button>
                </li>
              ))}
              {sizes.length === 0 && <li className="text-gray-400">No sizes</li>}
            </ul>
          </div>
          {/* Color */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Colors</h3>
            <form onSubmit={handleAddColor} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newColor}
                onChange={e => setNewColor(e.target.value)}
                placeholder="Add new color"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
            <ul>
              {colors.map(color => (
                <li key={color} className="flex justify-between items-center py-1">
                  <span>{color}</span>
                  <button onClick={() => handleDeleteColor(color)} className="text-red-600 hover:text-red-900">Delete</button>
                </li>
              ))}
              {colors.length === 0 && <li className="text-gray-400">No colors</li>}
            </ul>
          </div>
          {/* Fabric Type */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Fabric Types</h3>
            <form onSubmit={handleAddFabricType} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newFabricType}
                onChange={e => setNewFabricType(e.target.value)}
                placeholder="Add new fabric type"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
            <ul>
              {fabricTypes.map(type => (
                <li key={type} className="flex justify-between items-center py-1">
                  <span>{type}</span>
                  <button onClick={() => handleDeleteFabricType(type)} className="text-red-600 hover:text-red-900">Delete</button>
                </li>
              ))}
              {fabricTypes.length === 0 && <li className="text-gray-400">No fabric types</li>}
            </ul>
          </div>
          {/* Gender */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Genders</h3>
            <form onSubmit={handleAddGender} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newGender}
                onChange={e => setNewGender(e.target.value)}
                placeholder="Add new gender"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
            <ul>
              {genders.map(gender => (
                <li key={gender} className="flex justify-between items-center py-1">
                  <span>{gender}</span>
                  <button onClick={() => handleDeleteGender(gender)} className="text-red-600 hover:text-red-900">Delete</button>
                </li>
              ))}
              {genders.length === 0 && <li className="text-gray-400">No genders</li>}
            </ul>
          </div>
        </div>
      ),
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <Tabs
        defaultActiveKey="business"
        items={tabItems}
        className="settings-tabs"
      />
    </div>
  );
};

export default Settings;
