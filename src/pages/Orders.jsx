import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, Table, Card, Button, Tag, Space, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { useTheme } from '../context/ThemeContext';
import { useSuppliers } from '../context/SuppliersContext';
import { useProducts } from '../context/ProductsContext'; // Add this import
import { useInventory } from '../context/InventoryContext';
import moment from 'moment';
import '../App.css';

const { TabPane } = Tabs;

const Orders = () => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { updateStock } = useInventory();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || '1');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [form] = Form.useForm();
  const [viewModal, setViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const datePickerStyle = { width: '100%' };

  // Sample data - replace with actual data
  const mockOrders = [
    {
      orderId: 'PO-000123',
      supplier: 'ABC Fabrics',
      orderDate: '2024-01-20',
      totalAmount: 15000,
      expectedDelivery: '2024-02-01',
      status: 'Pending',
    }
  ];

  const orderColumns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate' },
    { 
      title: 'Total Amount', 
      dataIndex: 'totalAmount', 
      render: (amount) => `₹${amount?.toLocaleString()}`
    },
    { title: 'Expected Delivery', dataIndex: 'expectedDelivery' },
    { 
      title: 'Status', 
      dataIndex: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.orderId, value)}
          className="w-32"
        >
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="Delivered">Delivered</Select.Option>
          <Select.Option value="Cancelled">Cancelled</Select.Option>
        </Select>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => handleView(record)}
          >
            <i className="fas fa-eye"></i>
          </Button>
          {/* <Button 
            type="link" 
            onClick={() => handleEdit(record)}
          >
            <i className="fas fa-edit"></i>
          </Button> */}
          <Button 
            type="link" 
            onClick={() => handleDelete(record.orderId)}
            className="text-red-500"
          >
            <i className="fas fa-trash"></i>
          </Button>
        </Space>
      ),
    },
  ];

  const orderItemColumns = [
    { title: 'Product ID', dataIndex: 'productId', key: 'productId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
  ];

  // Add new state for order form
  const [orderId] = useState(`PO-${String(Date.now()).slice(-6)}`);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: '',
    phone: ''
  });

  // Add this inside the Orders component, near the other state declarations
  const [savedAddresses] = useState(() => {
    const addresses = localStorage.getItem('shippingAddresses');
    return addresses ? JSON.parse(addresses) : [];
  });

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
      // Get products for this supplier with their costs
      const supplierProducts = products.filter(p => p.supplierId === supplierId);
      setAvailableProducts(supplierProducts);
      setOrderItems([]);
      form.setFieldsValue({ supplier: supplierId });
    }
  };

  const handleAddProduct = (product) => {
    if (!orderItems.some(item => item.category === product.category)) {
      const newItem = {
        id: Date.now(),
        category: product.category,
        name: product.name,
        sku: product.sku, // Add SKU
        costPrice: parseFloat(product.costPrice) || 0,
        quantity: 1,
        discount: 0,
        total: parseFloat(product.costPrice) || 0
      };
      setOrderItems(prev => [...prev, newItem]);
      calculateTotalAmount([...orderItems, newItem]);
    }
  };

  const handleDiscountChange = (id, discount) => {
    const newDiscount = Math.min(Math.max(Number(discount) || 0, 0), 100); // Clamp between 0-100
    const updatedItems = orderItems.map(item => {
      if (item.id === id) {
        const discountAmount = (item.costPrice * item.quantity * newDiscount) / 100;
        const totalAfterDiscount = (item.costPrice * item.quantity) - discountAmount;
        return {
          ...item,
          discount: newDiscount,
          total: totalAfterDiscount
        };
      }
      return item;
    });
    setOrderItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  // Add total calculation function
  const calculateTotalAmount = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    const totalDiscount = items.reduce((sum, item) => {
      const discountAmount = (item.costPrice * item.quantity * (item.discount || 0)) / 100;
      return sum + discountAmount;
    }, 0);
    const afterDiscount = subtotal - totalDiscount;
    const tax = afterDiscount * 0.18; // 18% GST on amount after discount
    const total = afterDiscount + tax;

    setPaymentDetails(prev => ({
      ...prev,
      totalAmount: total,
      subtotal: subtotal,
      totalDiscount: totalDiscount,
      tax: tax,
      remainingAmount: total - prev.paidAmount
    }));
  };

  // Modify quantity change handler to maintain discount
  const handleQuantityChange = (id, quantity) => {
    const newQuantity = Number(quantity) || 0;
    const updatedItems = orderItems.map(item => {
      if (item.id === id) {
        const discountAmount = (item.costPrice * newQuantity * (item.discount || 0)) / 100;
        const totalAfterDiscount = (item.costPrice * newQuantity) - discountAmount;
        return {
          ...item,
          quantity: newQuantity,
          total: totalAfterDiscount
        };
      }
      return item;
    });
    setOrderItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  // Add new state for payment tracking
  const [paymentDetails, setPaymentDetails] = useState({
    paymentType: '',
    paidAmount: 0,
    remainingAmount: 0,
    totalAmount: 0,
    subtotal: 0,
    tax: 0
  });

  // Update payment type handler
  const handlePaymentTypeChange = (value) => {
    setPaymentDetails(prev => ({
      ...prev,
      paymentType: value,
      paidAmount: value === 'cash' ? prev.totalAmount : 0,
      remainingAmount: value === 'cash' ? 0 : prev.totalAmount
    }));
  };

  // Update payment amount handler
  const handlePaymentAmountChange = (value) => {
    const paidAmount = Number(value) || 0;
    setPaymentDetails(prev => ({
      ...prev,
      paidAmount: paidAmount,
      remainingAmount: prev.totalAmount - paidAmount
    }));
  };

  // Add form field handlers
  const [formValues, setFormValues] = useState({
    orderDate: null,
    expectedDelivery: null
  });

  const handleDateChange = (date, field) => {
    setFormValues(prev => ({
      ...prev,
      [field]: date
    }));
    form.setFieldValue(field, date);
  };

  const onFinish = (values) => {
    const newOrder = {
      orderId: orderId,
      supplier: selectedSupplier.basicInfo.businessName,
      orderDate: formValues.orderDate?.format('YYYY-MM-DD'),
      expectedDelivery: formValues.expectedDelivery?.format('YYYY-MM-DD'),
      totalAmount: paymentDetails.totalAmount,
      status: 'Pending',
      items: orderItems,
      shippingAddress: shippingAddress, // Add this line
      paymentDetails: {
        ...paymentDetails,
        paidAmount: paymentDetails.paidAmount,
        remainingAmount: paymentDetails.remainingAmount
      }
    };

    setOrders(prev => [...prev, newOrder]);
    localStorage.setItem('orders', JSON.stringify([...orders, newOrder])); // Add this line

    // Reset form and states
    setSelectedSupplier(null);
    setOrderItems([]);
    setPaymentDetails({
      paymentType: '',
      paidAmount: 0,
      remainingAmount: 0,
      totalAmount: 0,
      subtotal: 0,
      tax: 0
    });
    form.resetFields();
    setActiveTab('1');
  };

  // Modified input field component to match Suppliers
  const InputField = ({ label, name, value, onChange, type = "text", error }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'border-red-500' : ''}`}
        placeholder={label}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );

  const selectClasses = "w-full bg-white dark:bg-dark-200 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200";
  const selectDropdownClasses = darkMode ? 
    "bg-dark-200 border border-gray-700 text-gray-200" : 
    "bg-white border border-gray-200 text-gray-700";

  const renderDropdown = (label, options, value, onChange, placeholder) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={selectClasses}
        classNames={{
          popup: {
            root: selectDropdownClasses
          }
        }}
        popupMatchSelectWidth={true}
      >
        {options.map(opt => (
          <Select.Option key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Option>
        ))}
      </Select>
    </div>
  );

  const handleStatusChange = (orderId, newStatus) => {
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex === -1) return;

    const order = orders[orderIndex];
    
    // Only process if changing to Delivered
    if (newStatus === 'Delivered' && order.status !== 'Delivered') {
      // Update inventory
      const updates = updateStock(
        order.items,
        order.orderId,
        order.supplier
      );

      // Show success message with stock updates
      message.success(
        <div>
          <p>Order marked as delivered!</p>
          <p>Stock updates:</p>
          <ul>
            {updates.map(update => (
              <li key={update.sku}>
                {update.sku}: {update.oldQty} → {update.newQty} 
                (+{update.delivered})
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Update order status
    const updatedOrders = orders.map(order => 
      order.orderId === orderId 
        ? { ...order, status: newStatus }
        : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setViewModal(true);
    form.setFieldsValue({
      ...order,
      orderDate: moment(order.orderDate),
      expectedDelivery: moment(order.expectedDelivery),
      shippingAddress: order.shippingAddress || {},
      paymentDetails: order.paymentDetails || {},
      status: order.status,
      supplier: order.supplier
    });
  };

  const handleGenerateBill = (order) => {
    // Implement bill generation logic here
    console.log('Generating bill for order:', order);
    // You can add PDF generation or redirect to a bill page
  };

  const handleShippingAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsEditMode(true);
    setViewModal(true);
    form.setFieldsValue({
      ...order,
      orderDate: moment(order.orderDate),
      expectedDelivery: moment(order.expectedDelivery),
      shippingAddress: order.shippingAddress || {},
      status: order.status,
      supplier: order.supplier
    });
  };

  const handleDelete = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const updatedOrders = orders.filter(order => order.orderId !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }
  };

  const handleUpdateOrder = (values) => {
    const updatedOrder = {
      ...selectedOrder,
      orderDate: values.orderDate.format('YYYY-MM-DD'),
      expectedDelivery: values.expectedDelivery.format('YYYY-MM-DD'),
      shippingAddress: values.shippingAddress,
      status: values.status,
      items: selectedOrder.items,
      paymentDetails: {
        ...selectedOrder.paymentDetails,
        paymentType: values.paymentDetails.paymentType,
        paidAmount: values.paymentDetails.paidAmount,
        remainingAmount: selectedOrder.paymentDetails.totalAmount - values.paymentDetails.paidAmount
      }
    };

    const updatedOrders = orders.map(order => 
      order.orderId === selectedOrder.orderId ? updatedOrder : order
    );

    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    message.success('Order updated successfully');
    setViewModal(false);
    setIsEditMode(false);
    setSelectedOrder(null);
    form.resetFields();
  };

  // Add this handler function
  const handleShippingAddressSelect = (addressId) => {
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      if (isEditMode) {
        form.setFieldsValue({
          shippingAddress: {
            name: selectedAddress.name,
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            contactPerson: selectedAddress.contactPerson,
            phone: selectedAddress.phone
          }
        });
      } else {
        setShippingAddress(selectedAddress);
      }
    }
  };

  // Replace the renderViewModal function with this improved version
  const renderViewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold dark:text-white">
                {isEditMode ? 'Edit Order' : 'Order Details'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Order ID: {selectedOrder?.orderId}</span>
                <Tag color={selectedOrder?.status === 'Delivered' ? 'green' : 
                          selectedOrder?.status === 'Cancelled' ? 'red' : 'orange'}>
                  {selectedOrder?.status}
                </Tag>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditMode && (
                <Button  
                  type="primary"
                  onClick={() => setIsEditMode(true)}
                  icon={<i className="fas fa-edit mr-1" />}
                >
                  Edit
                </Button>
              )}
              <Button 
                onClick={() => {
                  setViewModal(false);
                  setIsEditMode(false);
                  setSelectedOrder(null);
                  form.resetFields();
                }}
                icon={<i className="fas fa-times" />}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          <Form
            form={form}
            onFinish={handleUpdateOrder}
            layout="vertical"
            initialValues={{
              ...selectedOrder,
              orderDate: moment(selectedOrder?.orderDate),
              expectedDelivery: moment(selectedOrder?.expectedDelivery),
              shippingAddress: selectedOrder?.shippingAddress || {},
              paymentDetails: selectedOrder?.paymentDetails || {}
            }}
          >
            {/* Order Summary Card */}
            <Card className="mb-6" title={
              <span className="flex items-center gap-2">
                <i className="fas fa-info-circle" />
                Order Summary
              </span>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Supplier" name="supplier">
                  <Input readOnly />
                </Form.Item>
                <Form.Item label="Status" name="status">
                  <Select disabled={!isEditMode}>
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="Delivered">Delivered</Select.Option>
                    <Select.Option value="Cancelled">Cancelled</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Order Date" name="orderDate">
                  <DatePicker 
                    disabled={!isEditMode}
                    format="DD-MM-YYYY"
                    className="w-full"
                  />
                </Form.Item>
                <Form.Item label="Expected Delivery" name="expectedDelivery">
                  <DatePicker 
                    disabled={!isEditMode}
                    format="DD-MM-YYYY"
                    className="w-full"
                  />
                </Form.Item>
              </div>
            </Card>

            {/* Order Items Card */}
            <Card className="mb-6" title={
              <span className="flex items-center gap-2">
                <i className="fas fa-box" />
                Order Items
              </span>
            }>
              <Table 
                dataSource={selectedOrder?.items}
                columns={[
                  {
                    title: '#',
                    key: 'index',
                    width: 50,
                    render: (_, __, index) => index + 1
                  },
                  {
                    title: 'Product',
                    key: 'product',
                    render: (_, record) => (
                      <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-xs text-gray-500">SKU: {record.sku}</div>
                      </div>
                    )
                  },
                  {
                    title: 'Qty',
                    dataIndex: 'quantity',
                    width: 80,
                    align: 'center'
                  },
                  {
                    title: 'Unit Price',
                    dataIndex: 'costPrice',
                    width: 120,
                    align: 'right',
                    render: price => `₹${price?.toFixed(2)}`
                  },
                  {
                    title: 'Discount',
                    dataIndex: 'discount',
                    width: 100,
                    align: 'right',
                    render: discount => `${discount || 0}%`
                  },
                  {
                    title: 'Total',
                    key: 'total',
                    width: 120,
                    align: 'right',
                    render: (_, record) => {
                      const total = record.quantity * record.costPrice * (1 - (record.discount || 0) / 100);
                      return <span className="font-medium">₹{total.toFixed(2)}</span>;
                    }
                  }
                ]}
                pagination={false}
                scroll={{ x: 'max-content' }}
                summary={() => {
                  const totals = selectedOrder?.items?.reduce((acc, item) => {
                    const total = item.quantity * item.costPrice * (1 - (item.discount || 0) / 100);
                    return {
                      subtotal: acc.subtotal + (item.quantity * item.costPrice),
                      discount: acc.discount + (item.quantity * item.costPrice * (item.discount || 0) / 100),
                      total: acc.total + total
                    };
                  }, { subtotal: 0, discount: 0, total: 0 }) || { subtotal: 0, discount: 0, total: 0 };

                  return (
                    <Table.Summary.Row className="bg-gray-50 dark:bg-gray-700">
                      <Table.Summary.Cell colSpan={5} align="right">
                        <strong>Total:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right">
                        <strong>₹{totals.total.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </Card>

            {/* Payment Details Card */}
            <Card className="mb-6" title={
              <span className="flex items-center gap-2">
                <i className="fas fa-money-bill" />
                Payment Details
              </span>
            }>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Form.Item name={['paymentDetails', 'paymentType']} label="Payment Type">
                    <Select disabled={!isEditMode}>
                      <Select.Option value="cash">Cash Payment</Select.Option>
                      <Select.Option value="advance">Advance Payment</Select.Option>
                      <Select.Option value="credit">Credit Payment</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name={['paymentDetails', 'paidAmount']} label="Paid Amount">
                    <InputNumber
                      className="w-full"
                      disabled={!isEditMode}
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder?.paymentDetails?.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder?.paymentDetails?.totalDiscount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%):</span>
                    <span>₹{selectedOrder?.paymentDetails?.tax?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>₹{selectedOrder?.paymentDetails?.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-500">
                      <span>Paid Amount:</span>
                      <span>₹{selectedOrder?.paymentDetails?.paidAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Balance:</span>
                      <span>₹{selectedOrder?.paymentDetails?.remainingAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            {isEditMode && (
              <div className="flex justify-end gap-3">
                <Button 
                  onClick={() => {
                    setIsEditMode(false);
                    form.setFieldsValue(selectedOrder);
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Order Management</h1>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            className={`tab-button ${activeTab === '1' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('1')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Purchase Orders
          </button>
          <button
            className={`tab-button ${activeTab === '2' ? 'tab-active' : 'tab-inactive'}`}
            onClick={() => setActiveTab('2')}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Place New Order
          </button>
        </div>
      </div>

      {activeTab === '1' ? (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          {/* View Order Modal */}
          {viewModal && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-2 sm:p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">
                      {isEditMode ? 'Edit Order' : 'Order Details'}
                    </h2>
                    <p className="text-sm text-gray-500">Order ID: {selectedOrder?.orderId}</p>
                  </div>
                  <div className="flex gap-2">
                    {!isEditMode && (
                      <Button 
                        type="primary"
                        onClick={() => setIsEditMode(true)}
                      >
                        Edit Order
                      </Button>
                    )}
                    <button 
                      onClick={() => {
                        setViewModal(false);
                        setIsEditMode(false);
                        setSelectedOrder(null);
                        form.resetFields();
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <Form
                  form={form}
                  onFinish={handleUpdateOrder}
                  layout="vertical"
                  initialValues={{
                    ...selectedOrder,
                    orderDate: moment(selectedOrder?.orderDate),
                    expectedDelivery: moment(selectedOrder?.expectedDelivery),
                    shippingAddress: selectedOrder?.shippingAddress || {},
                    paymentDetails: {
                      ...selectedOrder?.paymentDetails,
                      paidAmount: selectedOrder?.paymentDetails?.paidAmount || 0
                    },
                    status: selectedOrder?.status || 'Pending'
                  }}
                  className="space-y-4"
                >
                  {/* Order Information Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-4 dark:text-white">Order Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item name="supplier" label="Supplier">
                            <Input readOnly />
                          </Form.Item>
                          <Form.Item name="status" label="Status">
                            <Select disabled={!isEditMode}>
                              <Select.Option value="Pending">Pending</Select.Option>
                              <Select.Option value="Delivered">Delivered</Select.Option>
                              <Select.Option value="Cancelled">Cancelled</Select.Option>
                            </Select>
                          </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item name="orderDate" label="Order Date">
                            <DatePicker 
                              style={datePickerStyle}
                              disabled={!isEditMode}
                              format="DD-MM-YYYY"
                              className="w-full"
                            />
                          </Form.Item>
                          <Form.Item name="expectedDelivery" label="Expected Delivery">
                            <DatePicker 
                              style={datePickerStyle}
                              disabled={!isEditMode}
                              format="DD-MM-YYYY"
                              className="w-full"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Section */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-4 dark:text-white">Shipping Address</h3>
                      {isEditMode && (
                        <div className="mb-4">
                          <Select
                            placeholder="Select saved address"
                            className="w-full"
                            onChange={handleShippingAddressSelect}
                            allowClear
                          >
                            {savedAddresses.map(addr => (
                              <Select.Option key={addr.id} value={addr.id}>
                                {addr.name} - {addr.city}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      )}
                      <div className="space-y-4">
                        <Form.Item name={['shippingAddress', 'name']} label="Address Name">
                          <Input readOnly={!isEditMode} />
                        </Form.Item>
                        <Form.Item name={['shippingAddress', 'street']} label="Street">
                          <Input.TextArea readOnly={!isEditMode} />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item name={['shippingAddress', 'city']} label="City">
                            <Input readOnly={!isEditMode} />
                          </Form.Item>
                          <Form.Item name={['shippingAddress', 'state']} label="State">
                            <Input readOnly={!isEditMode} />
                          </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item name={['shippingAddress', 'pincode']} label="PIN Code">
                            <Input readOnly={!isEditMode} />
                          </Form.Item>
                          <Form.Item name={['shippingAddress', 'phone']} label="Phone">
                            <Input readOnly={!isEditMode} />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Section */}
                  <div className="mt-6">
                    <h3 className="font-medium mb-4 dark:text-white">Order Items</h3>
                    <Table 
                      dataSource={selectedOrder?.items || []}
                      columns={[
                        {
                          title: 'Sl No',
                          key: 'index',
                          render: (text, record, index) => index + 1,
                        },
                        {
                          title: 'SKU',
                          dataIndex: 'sku',
                          key: 'sku',
                        },
                        {
                          title: 'Product Name',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Unit Price',
                          dataIndex: 'costPrice',
                          key: 'costPrice',
                          render: (price) => `₹${price?.toFixed(2)}`
                        },
                        {
                          title: 'Quantity',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          render: (qty, record) => isEditMode ? (
                            <InputNumber
                              min={1}
                              value={qty}
                              onChange={(value) => handleEditQuantity(record.id, value)}
                              className="w-20"
                            />
                          ) : qty
                        },
                        {
                          title: 'Discount (%)',
                          dataIndex: 'discount',
                          key: 'discount',
                          render: (discount, record) => isEditMode ? (
                            <InputNumber
                              min={0}
                              max={100}
                              value={discount || 0}
                              onChange={(value) => handleEditDiscount(record.id, value)}
                              className="w-20"
                            />
                          ) : discount || 0
                        },
                        {
                          title: 'Total',
                          key: 'total',
                          render: (_, record) => {
                            const discountAmount = (record.costPrice * record.quantity * (record.discount || 0)) / 100;
                            const total = (record.costPrice * record.quantity) - discountAmount;
                            return `₹${total.toFixed(2)}`;
                          }
                        }
                      ]}
                      pagination={false}
                      className="dark:text-white"
                    />
                  </div>

                  {/* Updated Payment Details Section */}
                  <div className="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium mb-4 dark:text-white">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Form.Item
                          name={['paymentDetails', 'paymentType']}
                          label="Payment Type"
                        >
                          <Select disabled={!isEditMode}>
                            <Select.Option value="cash">Cash Payment</Select.Option>
                            <Select.Option value="advance">Advance Payment</Select.Option>
                            <Select.Option value="credit">Credit Payment</Select.Option>
                          </Select>
                        </Form.Item>
                        <p className="dark:text-white">
                          <span className="font-medium">Subtotal:</span>{' '}
                          ₹{selectedOrder?.paymentDetails?.subtotal?.toFixed(2)}
                        </p>
                        <p className="dark:text-white">
                          <span className="font-medium">Total Discount:</span>{' '}
                          ₹{selectedOrder?.paymentDetails?.totalDiscount?.toFixed(2)}
                        </p>
                        <p className="dark:text-white">
                          <span className="font-medium">Tax (18%):</span>{' '}
                          ₹{selectedOrder?.paymentDetails?.tax?.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Form.Item
                          name={['paymentDetails', 'paidAmount']}
                          label="Paid Amount"
                        >
                          <InputNumber
                            className="w-full"
                            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/₹\s?|(,*)/g, '')}
                            disabled={!isEditMode || selectedOrder?.paymentDetails?.paymentType === 'cash'}
                          />
                        </Form.Item>
                        <p className="dark:text-white">
                          <span className="font-medium">Total Amount:</span>{' '}
                          ₹{selectedOrder?.paymentDetails?.totalAmount?.toFixed(2)}
                        </p>
                        <p className="dark:text-white">
                          <span className="font-medium">Remaining Amount:</span>{' '}
                          ₹{selectedOrder?.paymentDetails?.remainingAmount?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isEditMode && (
                    <div className="mt-6 flex justify-end space-x-4">
                      <Button 
                        onClick={() => {
                          setIsEditMode(false);
                          form.setFieldsValue(selectedOrder);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="primary" htmlType="submit">
                        Save Changes
                      </Button>
                    </div>
                  )}
                </Form>
              </div>
            </div>
          )}

          {/* Mobile Order Cards */}
          <div className="block sm:hidden">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{order.orderId}</h3>
                    <p className="text-sm text-gray-500">{order.supplier}</p>
                  </div>
                  <Tag color={order.status === 'Delivered' ? 'green' : 'orange'}>
                    {order.status}
                  </Tag>
                </div>
                <div className="space-y-2 text-sm">
                  <p>Order Date: {order.orderDate}</p>
                  <p>Expected: {order.expectedDelivery}</p>
                  <p>Amount: ₹{order.totalAmount?.toLocaleString()}</p>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button type="link" onClick={() => handleView(order)}>
                    <i className="fas fa-eye"></i>
                  </Button>
                  <Button type="link" onClick={() => handleEdit(order)}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button type="link" danger onClick={() => handleDelete(order.orderId)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block">
            <Table 
              columns={orderColumns}
              dataSource={orders}
              rowKey="orderId"
              className="data-table"
              pagination={false}
            />
          </div>
        </div>
      ) : (
        <Form 
          form={form} 
          onFinish={onFinish}
          className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
          initialValues={{
            orderId: orderId,
            street: '',
            city: '',
            state: '',
            pincode: '',
            contactPerson: '',
            phone: ''
          }}
        >
          {/* Order Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item
                name="orderId"
                label="Order ID"
              >
                <Input disabled className="input-field" />
              </Form.Item>

              <Form.Item
                name="supplier"
                label="Supplier"
                rules={[{ required: true, message: 'Please select a supplier' }]}
              >
                <Select
                  placeholder="Select supplier"
                  onChange={handleSupplierChange}
                  className={selectClasses}
                >
                  {suppliers.map(supplier => (
                    <Select.Option key={supplier.supplierId} value={supplier.supplierId}>
                      {supplier.basicInfo.businessName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="orderDate"
                label="Order Date"
                rules={[{ required: true, message: 'Please select order date' }]}
              >
                <DatePicker 
                  style={datePickerStyle}
                  placeholder="Select date"
                  onChange={(date) => handleDateChange(date, 'orderDate')}
                  format="DD-MM-YYYY"
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                name="expectedDelivery"
                label="Expected Delivery"
                rules={[{ required: true, message: 'Please select expected delivery date' }]}
              >
                <DatePicker 
                  style={datePickerStyle}
                  placeholder="Select date"
                  onChange={(date) => handleDateChange(date, 'expectedDelivery')}
                  format="DD-MM-YYYY"
                  className="w-full"
                />
              </Form.Item>
              
            </div>
          </div>

          {selectedSupplier && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Product Selection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md cursor-pointer dark:hover:bg-gray-700 transition-all"
                  >
                    <div className="font-medium dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      SKU: {product.sku}<br/>
                      Category: {product.category}<br/>
                      Cost Price: ₹{product.costPrice}
                    </div>
                  </div>
                ))}
              </div>

              {orderItems.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-4 dark:text-white">Selected Products</h3>
                  <div className="overflow-x-auto">
                    <Table 
                      dataSource={orderItems}
                      columns={[
                        {
                          title: 'Sl No',
                          key: 'index',
                          render: (text, record, index) => index + 1,
                        },
                        {
                          title: 'SKU',
                          dataIndex: 'sku',
                          key: 'sku',
                        },
                        {
                          title: 'Product Name',
                          dataIndex: 'name',
                          key: 'name',
                        },
                        {
                          title: 'Unit Price',
                          dataIndex: 'costPrice',
                          key: 'costPrice',
                          render: (price) => `₹${price?.toFixed(2)}`
                        },
                        {
                          title: 'Quantity',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          render: (qty, record) => (
                            <InputNumber
                              min={1}
                              value={qty}
                              onChange={(value) => handleQuantityChange(record.id, value)}
                              className="w-20"
                            />
                          )
                        },
                        {
                          title: 'Discount (%)',
                          dataIndex: 'discount',
                          key: 'discount',
                          render: (discount, record) => (
                            <InputNumber
                              min={0}
                              max={100}
                              value={discount || 0}
                              onChange={(value) => handleDiscountChange(record.id, value)}
                              className="w-20"
                            />
                          )
                        },
                        {
                          title: 'Total',
                          key: 'total',
                          render: (_, record) => {
                            const discountAmount = (record.costPrice * record.quantity * (record.discount || 0)) / 100;
                            const total = (record.costPrice * record.quantity) - discountAmount;
                            return `₹${total.toFixed(2)}`;
                          }
                        },
                        {
                          title: 'Actions',
                          key: 'actions',
                          render: (_, record) => (
                            <Button 
                              type="link" 
                              danger
                              onClick={() => setOrderItems(prev => prev.filter(item => item.id !== record.id))}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          )
                        }
                      ]}
                      pagination={false}
                      className="dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping Address Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Shipping Address</h2>
            
            {/* Address Selector */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Select Shipping Address
              </label>
              <Select
                placeholder="Select a saved address"
                className="w-full mb-4"
                optionLabelProp="label"
                onChange={(value) => {
                  const selectedAddress = savedAddresses.find(addr => addr.id === value);
                  if (selectedAddress) {
                    setShippingAddress(selectedAddress);
                    form.setFieldsValue({
                      shippingAddress: selectedAddress
                    });
                  }
                }}
                allowClear
              >
                {savedAddresses.map(addr => (
                  <Select.Option 
                    key={addr.id} 
                    value={addr.id}
                    label={`${addr.name} - ${addr.city}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{addr.name}</span>
                      <span className="text-gray-500">{addr.city}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Selected Address Card */}
            {shippingAddress.street && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {shippingAddress.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({shippingAddress.city})
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state}</p>
                      <p>PIN: {shippingAddress.pincode}</p>
                      <p>Contact: {shippingAddress.contactPerson}</p>
                      <p>Phone: {shippingAddress.phone}</p>
                    </div>
                  </div>
                  <Button 
                    type="link"
                    onClick={() => {
                      setShippingAddress({
                        street: '',
                        city: '',
                        state: '',
                        pincode: '',
                        contactPerson: '',
                        phone: ''
                      });
                      form.setFieldsValue({
                        shippingAddress: {}
                      });
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Payment Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Terms Dropdown */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Terms
                </label>
                <Select
                  value={paymentDetails.paymentType}
                  onChange={handlePaymentTypeChange}
                  className={selectClasses}
                  placeholder="Select payment terms"
                >
                  <Select.Option value="cash">Cash Payment</Select.Option>
                  <Select.Option value="advance">Advance Payment</Select.Option>
                  <Select.Option value="credit">Credit Payment</Select.Option>
                </Select>
              </div>

              {/* Show payment fields for all payment types */}
              {paymentDetails.paymentType && (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {paymentDetails.paymentType === 'cash' ? 'Full Amount' :
                       paymentDetails.paymentType === 'advance' ? 'Advance Amount' :
                       'Credit Amount'}
                    </label>
                    <InputNumber
                      className="input-field"
                      value={paymentDetails.paidAmount}
                      onChange={handlePaymentAmountChange}
                      min={0}
                      max={paymentDetails.totalAmount}
                      disabled={paymentDetails.paymentType === 'cash'}
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/₹\s?|(,*)/g, '')}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Remaining Amount
                    </label>
                    <InputNumber
                      className="input-field"
                      value={paymentDetails.remainingAmount}
                      disabled
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </div>

                  {/* Payment summary */}
                  <div className="col-span-2">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Subtotal:</div>
                        <div className="text-right">₹{paymentDetails.subtotal?.toFixed(2)}</div>
                        <div>Total Discount:</div>
                        <div className="text-right text-red-500">-₹{paymentDetails.totalDiscount?.toFixed(2)}</div>
                        <div>Tax (18%):</div>
                        <div className="text-right">₹{paymentDetails.tax?.toFixed(2)}</div>
                        <div className="font-medium">Total Amount:</div>
                        <div className="text-right font-medium">₹{paymentDetails.totalAmount?.toFixed(2)}</div>
                        <div className="text-primary-600">Amount Paying:</div>
                        <div className="text-right text-primary-600">₹{paymentDetails.paidAmount?.toFixed(2)}</div>
                        <div className="text-red-600">Balance Amount:</div>
                        <div className="text-right text-red-600">₹{paymentDetails.remainingAmount?.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Notes Field */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Notes
                </label>
                <Input.TextArea 
                  rows={4} 
                  className="input-field"
                  placeholder="Add any payment related notes"
                />
              </div>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="flex justify-end gap-3">
            <Button onClick={() => setActiveTab('1')}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create Order
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default Orders;
