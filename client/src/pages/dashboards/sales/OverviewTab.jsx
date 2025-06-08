import React from 'react';
import { FiTrendingUp, FiBox, FiDollarSign, FiShoppingCart, FiUser, FiPhone, FiFileText } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";

const OverviewTab = ({ products = [], sales = [], darkMode, user }) => {
  // Calculate statistics with proper null checks
  const totalProducts = products.length;
  const allSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  
  // Fixed My Sales calculation with proper ID comparison
  const mySales = sales.filter(sale => {
    if (!sale.soldBy || !user?._id) return false;
    return sale.soldBy.toString() === user._id.toString();
  }).length;
  
  const myRevenue = sales.filter(sale => {
    if (!sale.soldBy || !user?._id) return false;
    return sale.soldBy.toString() === user._id.toString();
  }).reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  
  const lowStockProducts = products.filter(p => (p.quantity || 0) < 10).length;

  // Enhanced recent sales data
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.dateSold || 0) - new Date(a.dateSold || 0))
    .slice(0, 5);

  return (
    <div className={`p-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
        Sales Performance Dashboard
      </h2>
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Products */}
        <StatCard 
          icon={<FiBox />}
          title="Total Products"
          value={totalProducts}
          color="blue"
          darkMode={darkMode}
        />

        {/* All Sales */}
        <StatCard 
          icon={<FiShoppingCart />}
          title="Team Sales"
          value={allSales}
          color="green"
          darkMode={darkMode}
        />

        {/* My Sales - Highlighted */}
        <StatCard 
          icon={<FaUserTie />}
          title="My Sales"
          value={mySales}
          color="indigo"
          darkMode={darkMode}
          isHighlighted={mySales > 0}
          isEmpty={mySales === 0}
        />

        {/* Low Stock */}
        <StatCard 
          icon={<FiTrendingUp />}
          title="Low Stock"
          value={lowStockProducts}
          color="yellow"
          darkMode={darkMode}
          isWarning={lowStockProducts > 0}
        />

        {/* Total Revenue */}
        <StatCard 
          icon={<FiDollarSign />}
          title="Team Revenue"
          value={`Ksh ${totalRevenue.toLocaleString()}`}
          color="purple"
          darkMode={darkMode}
          isCurrency
        />

        {/* My Revenue - Highlighted */}
        <StatCard 
          icon={<FiDollarSign />}
          title="My Revenue"
          value={`Ksh ${myRevenue.toLocaleString()}`}
          color="teal"
          darkMode={darkMode}
          isCurrency
          isHighlighted={myRevenue > 0}
          isEmpty={myRevenue === 0}
        />
      </div>

      {/* Recent Sales Table */}
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className={`p-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex justify-between items-center`}>
          <h3 className="text-lg font-semibold flex items-center">
            <FiShoppingCart className="mr-2" /> Recent Transactions
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {Math.min(recentSales.length, 5)} of {allSales} total sales
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Product</TableHeader>
                <TableHeader>Qty</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Sold By</TableHeader>
                <TableHeader>Contact</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Notes</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <SaleRow 
                    key={index} 
                    sale={sale} 
                    darkMode={darkMode}
                    isMine={sale.soldBy?.toString() === user?._id?.toString()}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No recent sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ 
  icon, 
  title, 
  value, 
  color, 
  darkMode, 
  isWarning = false, 
  isCurrency = false,
  isHighlighted = false,
  isEmpty = false
}) => {
  const colorClasses = {
    bg: {
      blue: darkMode ? 'bg-blue-900/30' : 'bg-blue-100',
      green: darkMode ? 'bg-green-900/30' : 'bg-green-100',
      indigo: darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100',
      yellow: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100',
      purple: darkMode ? 'bg-purple-900/30' : 'bg-purple-100',
      teal: darkMode ? 'bg-teal-900/30' : 'bg-teal-100'
    },
    text: {
      blue: darkMode ? 'text-blue-300' : 'text-blue-600',
      green: darkMode ? 'text-green-300' : 'text-green-600',
      indigo: darkMode ? 'text-indigo-300' : 'text-indigo-600',
      yellow: darkMode ? 'text-yellow-300' : 'text-yellow-600',
      purple: darkMode ? 'text-purple-300' : 'text-purple-600',
      teal: darkMode ? 'text-teal-300' : 'text-teal-600'
    }
  };

  return (
    <div className={`p-4 rounded-xl shadow-lg ${
      darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
    } ${isWarning ? 'ring-2 ring-yellow-400' : ''} ${
      isHighlighted ? (darkMode ? 'ring-2 ring-indigo-400' : 'ring-2 ring-indigo-500') : ''
    } transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-start">
        <div className={`p-3 rounded-full ${colorClasses.bg[color]} mr-4`}>
          {React.cloneElement(icon, { className: `text-xl ${colorClasses.text[color]}` })}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${isCurrency ? 'text-green-500 dark:text-green-400' : ''}`}>
            {value}
          </p>
          {isEmpty && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {title.includes('Revenue') ? 'No revenue yet' : 'No sales yet'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Table Header Component
const TableHeader = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
    {children}
  </th>
);

// Sale Row Component
const SaleRow = ({ sale, darkMode, isMine }) => {
  // Format soldBy display
  const soldByDisplay = sale.soldBy?.username || 
                       sale.soldBy?.name || 
                       (typeof sale.soldBy === 'string' ? sale.soldBy : 'N/A');

  return (
    <tr className={`${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'} ${
      isMine ? (darkMode ? 'bg-indigo-900/20' : 'bg-indigo-50') : ''
    } transition-colors duration-150`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FiUser className="mr-2 opacity-70" />
          {sale.customerName || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {sale.product?.name || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {sale.quantity || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600 dark:text-green-400">
        Ksh {(sale.totalPrice || 0).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <FaUserTie className="mr-2 opacity-70" />
          {soldByDisplay}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {sale.customerContact ? (
          <div className="flex items-center">
            <FiPhone className="mr-2 opacity-70" />
            {sale.customerContact}
          </div>
        ) : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {sale.dateSold ? new Date(sale.dateSold).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'N/A'}
      </td>
      <td className="px-6 py-4 max-w-xs">
        {sale.notes ? (
          <div className="flex items-center">
            <FiFileText className="mr-2 opacity-70 flex-shrink-0" />
            <span className="truncate">{sale.notes}</span>
          </div>
        ) : '-'}
      </td>
    </tr>
  );
};

export default OverviewTab;