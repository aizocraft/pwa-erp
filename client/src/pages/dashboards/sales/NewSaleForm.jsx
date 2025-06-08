import { useState } from "react";
import { FiX, FiChevronDown, FiCheck } from "react-icons/fi";

const NewSaleForm = ({ products, onSubmit, onCancel, darkMode }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    customerName: '',
    customerContact: '',
    notes: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, productId: product._id }));
    setProductDropdownOpen(false);
    setSearchTerm('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }
    if (formData.quantity > selectedProduct.quantity) {
      alert(`Only ${selectedProduct.quantity} ${selectedProduct.unit} available`);
      return;
    }
    onSubmit(formData);
  };

  // Format as Kenyan Shillings
  const formatKSH = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return selectedProduct.pricePerUnit * formData.quantity;
  };

  return (
    <div className={`rounded-lg shadow p-6 ${
      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
    } border`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          New Sale
        </h2>
        <button 
          onClick={onCancel}
          className={`p-1 rounded-full ${
            darkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Product Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Product
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setProductDropdownOpen(!productDropdownOpen)}
              className={`w-full flex justify-between items-center rounded-lg px-4 py-3 text-left border ${
                darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              {selectedProduct ? (
                <span>
                  {selectedProduct.name} (KSH {selectedProduct.pricePerUnit.toLocaleString()}/{selectedProduct.unit})
                </span>
              ) : (
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Select a product
                </span>
              )}
              <FiChevronDown className="w-5 h-5" />
            </button>

            {productDropdownOpen && (
              <div className={`absolute z-10 mt-1 w-full shadow-lg rounded-lg max-h-60 overflow-auto border ${
                darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
              }`}>
                <div className={`p-2 border-b ${
                  darkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    className={`w-full px-3 py-2 rounded-md ${
                      darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className={`divide-y ${
                  darkMode ? 'divide-gray-600' : 'divide-gray-200'
                }`}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className={`w-full text-left px-4 py-3 flex justify-between items-center ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        } ${
                          selectedProduct?._id === product._id ? 
                            darkMode ? 'bg-blue-900/30' : 'bg-blue-50' : ''
                        }`}
                      >
                        <div>
                          <p className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {product.name}
                          </p>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {product.quantity} {product.unit} available • KSH {product.pricePerUnit}/{product.unit}
                          </p>
                        </div>
                        {selectedProduct?._id === product._id && (
                          <FiCheck className={`w-5 h-5 ${
                            darkMode ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className={`px-4 py-3 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No products found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Quantity
          </label>
          <input
            type="number"
            min="1"
            max={selectedProduct?.quantity || ''}
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            className={`w-full rounded-lg px-4 py-3 border ${
              darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
          {selectedProduct && (
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Available: {selectedProduct.quantity} {selectedProduct.unit}
            </p>
          )}
        </div>

        {/* Customer Info */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Customer Name
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className={`w-full rounded-lg px-4 py-3 border ${
              darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Customer Contact (Optional)
          </label>
          <input
            type="text"
            value={formData.customerContact}
            onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
            className={`w-full rounded-lg px-4 py-3 border ${
              darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className={`w-full rounded-lg px-4 py-3 border ${
              darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
            rows="3"
          />
        </div>

        {/* Total and Submit */}
        <div className={`border-t pt-6 ${
          darkMode ? 'border-gray-600' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <span className={`font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Total
            </span>
            <span className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {formatKSH(calculateTotal())}
            </span>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-3 rounded-lg font-medium border ${
                darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={!selectedProduct}
            >
              Complete Sale
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewSaleForm;