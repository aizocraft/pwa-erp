import { FiDollarSign, FiCalendar } from "react-icons/fi";

const SalesTab = ({ sales, darkMode }) => {
  // Format as Kenyan Shillings
  const formatKSH = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Sales History
        </h2>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Total: {sales.length} transactions
        </div>
      </div>

      {sales.length > 0 ? (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div 
              key={sale._id} 
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sale.product?.name || 'Unknown Product'}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Sold to: {sale.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium flex items-center justify-end ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    <FiDollarSign className="mr-1" /> {formatKSH(sale.totalPrice)}
                  </p>
                  <p className={`text-sm flex items-center justify-end ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FiCalendar className="mr-1" /> {new Date(sale.dateSold).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {sale.notes && (
                <div className={`mt-2 pt-2 border-t ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">Notes:</span> {sale.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No sales history available
        </div>
      )}
    </div>
  );
};

export default SalesTab;