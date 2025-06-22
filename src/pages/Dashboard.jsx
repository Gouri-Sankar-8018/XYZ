import { Bar } from 'react-chartjs-2';
import { useState, useEffect, useMemo } from 'react'; // Add useMemo
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext'; // Add this import
import { useProducts } from '../context/ProductsContext'; // Add this import
import { useSuppliers } from '../context/SuppliersContext'; // Add this import
import WelcomeBanner from '../components/WelcomeBanner';
import ImageCarousel from '../components/ImageCarousel';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  const { inventory } = useInventory();
  const { products } = useProducts();
  const { suppliers } = useSuppliers();

  const summaryData = [
    {
      title: 'Total Sales',
      value: '₹45,675',
      change: '+12%',
      icon: 'fa-indian-rupee-sign',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'group-hover:bg-blue-600'
    },
    {
      title: 'Today\'s Sales',
      value: '₹5,320',
      change: '-5%',
      icon: 'fa-indian-rupee-sign',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'group-hover:bg-green-600'
    },
    {
      title: 'Weekly Sales',
      value: '₹18,450',
      change: '+8%',
      icon: 'fa-indian-rupee-sign',
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      hoverColor: 'group-hover:bg-yellow-600'
    },
    {
      title: 'Most Sold Product',
      value: 'Saree',
      change: '+20%',
      icon: 'fa-shirt',
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      hoverColor: 'group-hover:bg-pink-600'
    }
  ];

  const recentOrders = [
    {
      id: 'ORD001',
      supplier: 'Rajesh Textiles',
      amount: '₹25,500',
      paidAmount: '₹20,000',
      orderDate: '2024-01-28',
      deliveryDate: '2024-02-05',
      status: 'processing'
    },
    {
      id: 'ORD002',
      supplier: 'Krishna Fabrics',
      amount: '₹18,800',
      paidAmount: '₹18,800',
      orderDate: '2024-01-27',
      deliveryDate: '2024-02-03',
      status: 'completed'
    },
    {
      id: 'ORD003',
      supplier: 'Lakshmi Silks',
      amount: '₹32,000',
      paidAmount: '₹15,000',
      orderDate: '2024-01-26',
      deliveryDate: '2024-02-02',
      status: 'pending'
    },
    {
      id: 'ORD004',
      supplier: 'Global Apparels',
      amount: '₹45,000',
      paidAmount: '₹45,000',
      orderDate: '2024-01-25',
      deliveryDate: '2024-02-01',
      status: 'completed'
    },
    {
      id: 'ORD005',
      supplier: 'Unity Textiles',
      amount: '₹12,000',
      paidAmount: '₹6,000',
      orderDate: '2024-01-24',
      deliveryDate: '2024-01-31',
      status: 'processing'
    },
  ];

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(14, 165, 233, 0.5)',
      borderColor: 'rgb(14, 165, 233)',
      borderWidth: 2
    }]
  };

  const lowStockItems = useMemo(() => {
    return inventory
      .filter(item => {
        const product = products.find(p => p.sku === item.sku);
        return item.quantityInStock <= (item.minimumAlertLevel || 5);
      })
      .map(item => {
        const product = products.find(p => p.sku === item.sku);
        const supplier = suppliers.find(s => s.supplierId === product?.supplierId);
        return {
          ...item,
          productName: product?.name || 'Unknown Product',
          supplier: supplier?.basicInfo?.businessName || 'Unknown Supplier',
          category: product?.category || 'Uncategorized',
          size: product?.size || '-',
          color: product?.color || '-'
        };
      });
  }, [inventory, products, suppliers]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50/50">
      <div className="animate-dashboard-fade-in">
        <WelcomeBanner />

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
            <button
              onClick={() => navigate('/suppliers', { state: { activeTab: 'add' } })}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
            >
              <i className="fa-solid fa-plus mr-2 text-sm"></i>
              <span>Add Supplier</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryData.map((item, index) => (
              <div
                key={item.title}
                className={`group relative overflow-hidden rounded-lg border border-gray-100/50
                  ${item.bgColor} hover:shadow-lg transition-all duration-300
                  hover:shadow-${item.gradient.split('-')[2]}-500/10`}
              >
                <div className="px-5 py-4">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                      {item.title}
                    </p>
                    <div className={`p-3 rounded-lg bg-white/80 backdrop-blur-sm
                      ${item.hoverColor} transition-colors duration-300`}>
                      <i className={`fa-solid ${item.icon} text-lg
                        ${item.gradient.split('-')[2]}-600 group-hover:text-white`}></i>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900">
                      {item.value}
                    </h3>
                    <span className={`inline-flex items-center text-sm font-medium ${item.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                      <i className={`fa-solid ${item.change.startsWith('+') ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                      {item.change}
                    </span>
                  </div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} 
                  opacity-20 group-hover:opacity-5 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>

          {/* Low Stock Alerts Section */}
          {lowStockItems.length > 0 && (
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
                        <p className="text-sm text-gray-500">
                          {lowStockItems.length} items need attention
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => navigate('/orders', { state: { activeTab: '2' } })}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Place Order
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size/Color</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min. Level</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {lowStockItems.map((item) => (
                          <tr key={item.sku} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{item.productName}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.size} / {item.color}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${item.quantityInStock === 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'}`}>
                                {item.quantityInStock} units
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.minimumAlertLevel} units
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{item.supplier}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${item.quantityInStock === 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'}`}>
                                {item.quantityInStock === 0 ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-5">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-dark-700 bg-gray-100">
                        {['Order ID', 'Supplier', 'Amount', 'Paid', 'Order Date', 'Delivery Date', 'Status'].map((header) => (
                          <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 tracking-wide uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                      {recentOrders.map((order, idx) => (
                        <tr
                          key={order.id}
                          className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          <td className="px-4 py-3 font-medium text-gray-700">{order.id}</td>
                          <td className="px-4 py-3">{order.supplier}</td>
                          <td className="px-4 py-3">{order.amount}</td>
                          <td className="px-4 py-3">{order.paidAmount}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium
                              ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Featured Products</h3>
              <ImageCarousel />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .animate-dashboard-fade-in {
          animation: dashboardFadeIn 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes dashboardFadeIn {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
