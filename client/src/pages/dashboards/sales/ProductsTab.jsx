import { FiPlus, FiSearch } from "react-icons/fi";

const ProductsTab = ({ products, onNewSale, isLoading, darkMode }) => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          Product Catalog
        </h2>
        <div className="flex w-full md:w-auto gap-3">
          <button
            onClick={onNewSale}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <FiPlus /> New Sale
          </button>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product._id} 
              className={`border rounded-lg overflow-hidden transition-shadow hover:shadow-md ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}
            >
              <div className={`p-4 ${product.quantity < product.threshold ? 
                darkMode ? 'bg-red-900/10' : 'bg-red-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-medium text-lg ${darkMode ? 'text-white' : 'text-gray-800'} mb-1`}>
                    {product.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.category}
                  </span>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                  {product.description ? product.description : 'No description provided'}
                </p>
              
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
                    <p className="font-medium">
                      Ksh.{product.pricePerUnit}/{product.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</p>
                    <p className={`font-medium ${
                      product.quantity < product.threshold ? 
                        darkMode ? 'text-red-400' : 'text-red-600' : 
                        darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {product.quantity} {product.unit}
                    </p>
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                  Supplier: {product.supplier || 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {isLoading ? 'Loading products...' : 'No products available'}
        </div>
      )}
    </div>
  );
};

export default ProductsTab;