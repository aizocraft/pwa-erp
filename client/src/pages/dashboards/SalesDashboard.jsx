import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiDollarSign, FiShoppingCart, FiPackage, FiSun, FiMoon } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import OverviewTab from "./sales/OverviewTab";
import ProductsTab from "./sales/ProductsTab";
import SalesTab from "./sales/SalesTab";
import NewSaleForm from "./sales/NewSaleForm";
import api from "../../utils/api";

const SalesDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or system preference
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Toggle dark mode with smooth transition
  const toggleDarkMode = () => {
    document.documentElement.classList.add('transition-colors');
    document.documentElement.classList.add('duration-200');
    setDarkMode(!darkMode);
    setTimeout(() => {
      document.documentElement.classList.remove('transition-colors');
      document.documentElement.classList.remove('duration-200');
    }, 200);
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productsRes, salesRes] = await Promise.all([
        api.get("/sales/products"),
        api.get("/sales/history")
      ]);
      setProducts(productsRes.data?.products || []);
      setSales(salesRes.data?.sales || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load data", {
        theme: darkMode ? "dark" : "light"
      });
    } finally {
      setIsLoading(false);
    }
  }, [darkMode]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle new sale
  const handleNewSale = async (saleData) => {
    try {
      setIsLoading(true);
      const response = await api.post("/sales/sell", saleData);
      
      setSales(prev => [response.data.sale, ...prev]);
      setProducts(prev => prev.map(p => 
        p._id === saleData.productId ? 
        { ...p, quantity: p.quantity - saleData.quantity } : p
      ));
      
      toast.success("Sale completed successfully!", {
        theme: darkMode ? "dark" : "light"
      });
      setActiveTab("sales");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Sale failed", {
        theme: darkMode ? "dark" : "light"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSales = sales.filter(sale => 
    sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme={darkMode ? "dark" : "light"}
      />
      
      {/* Header with Dark Mode Toggle */}
      <header className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Sales Dashboard
            </h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className={`mb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {[
              { id: 'overview', icon: FiDollarSign, label: 'Overview' },
              { id: 'products', icon: FiPackage, label: 'Products' },
              { id: 'sales', icon: FiShoppingCart, label: 'Sales' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? darkMode
                        ? 'border-blue-400 text-blue-400'
                        : 'border-blue-600 text-blue-600'
                      : darkMode
                        ? 'border-transparent text-gray-400 hover:text-gray-300'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search Bar */}
        {activeTab !== 'new-sale' && (
          <div className="mb-6 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="text"
              className={`block w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/30 text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={`rounded-xl shadow-lg overflow-hidden ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {isLoading && (
            <div className={`absolute inset-0 z-20 flex items-center justify-center ${
              darkMode ? 'bg-gray-900/80' : 'bg-white/80'
            }`}>
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                darkMode ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
            </div>
          )}

          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab products={products} sales={sales} darkMode={darkMode} />
            )}

            {activeTab === 'products' && (
              <ProductsTab 
                products={filteredProducts} 
                onNewSale={() => setActiveTab('new-sale')} 
                darkMode={darkMode} 
              />
            )}

            {activeTab === 'sales' && (
              <SalesTab sales={filteredSales} darkMode={darkMode} />
            )}

            {activeTab === 'new-sale' && (
              <NewSaleForm
                products={products}
                onSubmit={handleNewSale}
                onCancel={() => setActiveTab('products')}
                darkMode={darkMode}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesDashboard;