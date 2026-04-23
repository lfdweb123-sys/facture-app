import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import InvoiceForm from './components/invoices/InvoiceForm';
import Invoices from './pages/Invoices';
import ContractForm from './components/contracts/ContractForm';
import Contracts from './pages/Contracts';
import Payments from './pages/Payments';
import WalletPage from './pages/Wallet';
import AIChat from './components/ai/AIChat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" />;
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {user && <Header />}
      <div className="flex flex-1">
        {user && <Sidebar />}
        <main className={`flex-1 ${user ? 'ml-0 lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0' : ''}`}>
          <Routes>
            {/* Page publique - Accueil */}
            <Route path="/" element={<Home />} />
            
            {/* Pages publiques - Auth */}
            <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
            
            {/* Page publique - Paiement client */}
            <Route path="/pay" element={<Payments />} />
            
            {/* Pages protégées */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
            <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
            <Route path="/contracts/new" element={<ProtectedRoute><ContractForm /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/ai-assistant" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}