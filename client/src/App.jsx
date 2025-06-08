import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ErrorBoundary } from "react-error-boundary";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EngineerDashboard from "./pages/dashboards/EngineerDashboard";
import FinanceDashboard from "./pages/dashboards/FinanceDashboard";
import SalesDashboard from "./pages/dashboards/SalesDashboard";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

// Error boundary fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-100 text-red-700 rounded-lg m-4">
      <p className="font-bold">Something went wrong:</p>
      <pre className="whitespace-pre-wrap">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and theme from localStorage on mount
  useEffect(() => {
    const loadInitialData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedTheme = localStorage.getItem("darkMode");
        
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedTheme) setDarkMode(JSON.parse(storedTheme));
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main className="flex-1">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            
            {/* Auth routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" replace /> : <Register setUser={setUser} />} 
            />

            {/* Protected dashboard routes */}
            <Route 
              path="/admin-dashboard/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard darkMode={darkMode} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/engineer-dashboard/*" 
              element={
                <ProtectedRoute requiredRole="engineer">
                  <EngineerDashboard darkMode={darkMode} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/finance-dashboard/*" 
              element={
                <ProtectedRoute requiredRole="finance">
                  <FinanceDashboard darkMode={darkMode} />
                </ProtectedRoute>
              } 
            />
               <Route 
                path="/sales-dashboard/*" 
                element={
                  <ProtectedRoute requiredRole="sales">
                    <SalesDashboard user={user} darkMode={darkMode} />
                  </ProtectedRoute>
                } 
              />

            {/* Catch-all route */}
            <Route path="*" element={
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold dark:text-white">404 - Page Not Found</h1>
                <p className="mt-4 dark:text-gray-300">The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </ErrorBoundary>
      </main>

      <Footer darkMode={darkMode} />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />
    </div>
  );
};

export default App;