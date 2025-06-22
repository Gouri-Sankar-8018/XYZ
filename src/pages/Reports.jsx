import { useState } from 'react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      <div className="bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="border-b overflow-x-auto">
          <nav className="flex space-x-4 px-4 md:px-6 min-w-max">
            {['sales', 'inventory', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Report
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 md:p-6">
          {/* Date Selection */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="date" className="input-field flex-1" />
            <input type="date" className="input-field flex-1" />
            <button className="btn-primary whitespace-nowrap">
              <i className="fas fa-chart-line mr-2"></i>
              Generate Report
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="text-sm md:text-base font-semibold mb-2 text-blue-900">Total Revenue</h4>
              <p className="text-xl md:text-2xl text-blue-700">₹1,45,678</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <h4 className="text-sm md:text-base font-semibold mb-2 text-green-900">Total Orders</h4>
              <p className="text-xl md:text-2xl text-green-700">234</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
              <h4 className="text-sm md:text-base font-semibold mb-2 text-red-900">Average Order Value</h4>
              <p className="text-xl md:text-2xl text-red-700">₹623</p>
            </div>
          </div>

          {/* Add responsive tables and charts here */}
        </div>
      </div>
    </div>
  );
};

export default Reports;
