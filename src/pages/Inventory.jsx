import { useState, useMemo, useEffect } from 'react';
import { Table, Tabs, Badge, Tooltip, Input, Select, DatePicker, Button, Tag, Space, Modal, Switch } from 'antd';
import { useInventory } from '../context/InventoryContext';
import { useProducts } from '../context/ProductsContext';
import { useSuppliers } from '../context/SuppliersContext';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const { Search } = Input;
const { RangePicker } = DatePicker;

const Inventory = () => {
  const { inventory, stockHistory, updateStockLevel, setInventory } = useInventory();
  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  const [activeTab, setActiveTab] = useState('1');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [stockAlerts, setStockAlerts] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Get unique categories and suppliers for filters
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // Enhanced inventory data with product details
  const enhancedInventory = useMemo(() => {
    return inventory.map(item => {
      const product = products.find(p => p.sku === item.sku) || {};
      const supplier = suppliers.find(s => s.supplierId === product.supplierId);
      return {
        ...item,
        productName: product.name,
        category: product.category,
        brand: product.brand,
        supplier: supplier?.basicInfo?.businessName,
        supplierId: product.supplierId,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        sizeColor: `${product.size} / ${product.color}`,
        status: item.quantityInStock <= (item.minimumAlertLevel || 0) ? 'low' : 'normal'
      };
    });
  }, [inventory, products, suppliers]);

  // Filter logic
  const filteredInventory = useMemo(() => {
    return enhancedInventory.filter(item => {
      const matchesSearch = (
        item.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchText.toLowerCase())
      );
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSupplier = selectedSupplier === 'all' || item.supplierId === selectedSupplier;
      const matchesStockAlert = !stockAlerts || item.status === 'low';
      return matchesSearch && matchesCategory && matchesSupplier && matchesStockAlert;
    });
  }, [enhancedInventory, searchText, selectedCategory, selectedSupplier, stockAlerts]);

  // Inventory columns with enhanced features
  const inventoryColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      sorter: (a, b) => a.sku.localeCompare(b.sku),
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      sorter: (a, b) => a.productName.localeCompare(b.productName),
    },
    {
      title: 'Size / Color',
      dataIndex: 'sizeColor',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantityInStock',
      sorter: (a, b) => a.quantityInStock - b.quantityInStock,
      render: (qty, record) => (
        <Space>
          <Badge 
            count={qty} 
            showZero 
            color={record.status === 'low' ? 'red' : 'blue'}
            overflowCount={9999}
          />
          {record.status === 'low' && (
            <Tag color="red">Low Stock</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Min Alert',
      dataIndex: 'minimumAlertLevel',
    },
    {
      title: 'Value',
      render: (_, record) => (
        <Tooltip title={`Cost: ₹${record.costPrice} | Selling: ₹${record.sellingPrice}`}>
          ₹{(record.quantityInStock * record.costPrice).toFixed(2)}
        </Tooltip>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastRestocked',
      sorter: (a, b) => new Date(a.lastRestocked) - new Date(b.lastRestocked),
      render: date => date ? new Date(date).toLocaleString() : '-'
    },
    {
      title: 'Supplier',
      dataIndex: 'supplier',
      sorter: (a, b) => a.supplier?.localeCompare(b.supplier),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            <i className="fas fa-edit"></i>
          </Button>
          <Button type="link" onClick={() => handleStockAdjustment(record)}>
            <i className="fas fa-balance-scale"></i>
          </Button>
          <Button type="link" onClick={() => handleViewHistory(record)}>
            <i className="fas fa-history"></i>
          </Button>
        </Space>
      ),
    },
  ];

  // Update the historyColumns definition
  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      render: date => new Date(date).toLocaleString()
    },
    { 
      title: 'Reference',
      dataIndex: 'orderId',
      render: (orderId, record) => (
        <Space>
          {orderId}
          <Tag color={record.type === 'IN' ? 'green' : 'red'}>
            {record.type}
          </Tag>
        </Space>
      )
    },
    { 
      title: 'Supplier/Customer',
      dataIndex: 'supplier',
      render: (supplier, record) => (
        <span>
          {record.type === 'IN' ? supplier : record.customer || 'Walk-in Customer'}
        </span>
      )
    },
    {
      title: 'Products',
      dataIndex: 'items',
      render: (items) => (
        <div className="space-y-1">
          {items.map((item, index) => {
            const product = products.find(p => p.sku === item.sku) || {};
            const supplier = suppliers.find(s => s.supplierId === product.supplierId);
            const stockLevel = inventory.find(i => i.sku === item.sku)?.quantityInStock || 0;
            const isLowStock = stockLevel <= (product.minStockAlert || 5);

            return (
              <div key={index} className="flex items-center justify-between gap-2">
                <Tooltip title={
                  <div>
                    <p>SKU: {item.sku}</p>
                    <p>Supplier: {supplier?.basicInfo?.businessName || 'N/A'}</p>
                    <p>Current Stock: {stockLevel}</p>
                    {isLowStock && <p className="text-red-500">Low Stock Alert!</p>}
                  </div>
                }>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{product.name || item.sku}</span>
                    {isLowStock && <Badge status="error" />}
                  </span>
                </Tooltip>
                <span className={`${item.delivered > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.oldQty} → {item.newQty} 
                  ({item.delivered > 0 ? '+' : ''}{item.delivered})
                </span>
              </div>
            );
          })}
        </div>
      )
    },
    { 
      title: 'User',
      dataIndex: 'user',
      render: user => (
        <Tag color="blue">{user}</Tag>
      )
    },
    {
      title: 'Status',
      render: (_, record) => {
        // Check if any product in the transaction is low on stock
        const lowStockItems = record.items.filter(item => {
          const stockLevel = inventory.find(i => i.sku === item.sku)?.quantityInStock || 0;
          const product = products.find(p => p.sku === item.sku);
          return stockLevel <= (product?.minStockAlert || 5);
        });

        return lowStockItems.length > 0 ? (
          <Tag color="red">Low Stock Alert</Tag>
        ) : (
          <Tag color="green">Normal</Tag>
        );
      }
    }
  ];

  const handleEdit = (record) => {
    setSelectedItem(record);
    setEditModalVisible(true);
  };

  // Add this function to initialize inventory when a product is created
  const initializeInventoryItem = (product) => {
    const existingItem = inventory.find(item => item.sku === product.sku);
    if (!existingItem) {
      const newItem = {
        sku: product.sku,
        productName: product.name,
        quantityInStock: Number(product.quantity) || 0,
        minimumAlertLevel: Number(product.minStockAlert) || 5,
        lastRestocked: new Date().toISOString()
      };
      setInventory(prev => {
        const updated = [...prev, newItem];
        localStorage.setItem('inventory', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Use this effect to initialize inventory for existing products
  useEffect(() => {
    products.forEach(product => {
      initializeInventoryItem(product);
    });
  }, [products]);

  const handleStockAdjustment = (record) => {
    Modal.confirm({
      title: 'Adjust Stock Level',
      content: (
        <div>
          <Input 
            type="number" 
            placeholder="Enter new quantity"
            onChange={(e) => setNewQuantity(e.target.value)}
          />
          <Input.TextArea
            placeholder="Reason for adjustment"
            onChange={(e) => setAdjustmentReason(e.target.value)}
          />
        </div>
      ),
      onOk() {
        return updateStockLevel(record.sku, parseInt(newQuantity), adjustmentReason);
      }
    });
  };

  const handleViewHistory = (record) => {
    setActiveTab('2');
    setSearchText(record.sku);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleSupplierChange = (value) => {
    setSelectedSupplier(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleStockAlertToggle = (checked) => {
    setStockAlerts(checked);
  };

  const handleEditModalOk = () => {
    // Save changes
    setEditModalVisible(false);
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
  };

  const exportToExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Low Stock Report');

    // Add title
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Low Stock Report';
    titleCell.font = {
      size: 16,
      bold: true
    };
    titleCell.alignment = { horizontal: 'center' };

    // Add date
    worksheet.mergeCells('A2:J2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: 'center' };

    // Define columns
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Size/Color', key: 'sizeColor', width: 15 },
      { header: 'Current Stock', key: 'quantityInStock', width: 15 },
      { header: 'Min Alert Level', key: 'minimumAlertLevel', width: 15 },
      { header: 'Cost Price', key: 'costPrice', width: 15 },
      { header: 'Total Value', key: 'totalValue', width: 15 },
      { header: 'Supplier', key: 'supplier', width: 30 },
      { header: 'Last Updated', key: 'lastRestocked', width: 20 }
    ];

    // Style the header row
    worksheet.getRow(3).font = { bold: true };
    worksheet.getRow(3).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data
    data.forEach(item => {
      worksheet.addRow({
        sku: item.sku,
        productName: item.productName,
        category: item.category,
        sizeColor: item.sizeColor,
        quantityInStock: item.quantityInStock,
        minimumAlertLevel: item.minimumAlertLevel,
        costPrice: item.costPrice,
        totalValue: item.quantityInStock * item.costPrice,
        supplier: item.supplier,
        lastRestocked: new Date(item.lastRestocked).toLocaleString()
      });
    });

    // Add total row
    const totalRow = worksheet.addRow({
      sku: 'TOTAL',
      quantityInStock: data.reduce((sum, item) => sum + item.quantityInStock, 0),
      totalValue: data.reduce((sum, item) => sum + (item.quantityInStock * item.costPrice), 0)
    });
    totalRow.font = { bold: true };

    // Style all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';
    const fileName = `low_stock_report_${new Date().toISOString().split('T')[0]}${fileExtension}`;

    const blob = new Blob([buffer], { type: fileType });
    saveAs(blob, fileName);
  };

  // Add this items configuration for Tabs
  const tabItems = [
    {
      key: '1',
      label: 'Current Stock',
      children: (
        <div className="w-full">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-4">
            <Search 
              placeholder="Search by SKU, Product, or Supplier"
              onSearch={handleSearch}
              className="w-full lg:w-[300px]"
            />
            <div className="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:gap-2">
              <Select 
                placeholder="Select Category"
                onChange={handleCategoryChange}
                className="w-full lg:w-[200px]"
                options={[{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))]}
              />
              <Select 
                placeholder="Select Supplier"
                onChange={handleSupplierChange}
                className="w-full lg:w-[200px]"
                options={[{ value: 'all', label: 'All Suppliers' }, ...suppliers.map(s => ({ value: s.supplierId, label: s.basicInfo.businessName }))]}
              />
              <RangePicker 
                onChange={handleDateRangeChange}
                className="w-full lg:w-[300px]"
              />
              <Switch 
                checked={stockAlerts}
                onChange={handleStockAlertToggle}
                checkedChildren="Stock Alerts On"
                unCheckedChildren="Stock Alerts Off"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table 
              columns={inventoryColumns}
              dataSource={filteredInventory}
              rowKey="sku"
              scroll={{ x: 'max-content' }}
            />
          </div>
        </div>
      )
    },
    {
      key: '2',
      label: 'Stock History',
      children: (
        <div className="overflow-x-auto">
          <Table 
            columns={historyColumns}
            dataSource={stockHistory}
            rowKey="id"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )
    },
    {
      key: '3',
      label: 'Low Stock',
      children: (
        <div>
          <div className="mb-4 flex justify-end">
            <Button
              type="primary"
              onClick={() => exportToExcel(filteredInventory.filter(item => item.status === 'low'))}
              icon={<i className="fas fa-file-excel mr-2"></i>}
            >
              Export to Excel
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table 
              columns={inventoryColumns}
              dataSource={filteredInventory.filter(item => item.status === 'low')}
              rowKey="sku"
              scroll={{ x: 'max-content' }}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="mb-4 lg:mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Inventory Management</h1>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} className="w-full" />

      <Modal
        title="Edit Stock Level"
        open={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        className="w-[90vw] lg:w-[500px]"
      >
        
        {/* Edit form content */}
      </Modal>
    </div>
  );
};

export default Inventory;
