import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignUpForm';
import HomePage from './pages/HomePage';
import GeneratePage from './pages/GeneratePage';
import UserHistory from './pages/UserHistory';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import UpgradePro from './components/UpgradePro';

const App = () => {
  // Get PayPal client ID from environment variables (Vite uses VITE_ prefix)
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

  // Only render PayPalScriptProvider if we have a valid client ID
  const renderWithPayPal = (children) => {
    if (paypalClientId && paypalClientId.trim() !== '') {
      return (
        <PayPalScriptProvider options={{ "client-id": paypalClientId }}>
          {children}
        </PayPalScriptProvider>
      );
    }
    return children;
  };

  return (
    <Router>
      <AuthProvider>
        {renderWithPayPal(
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/generate" element={<GeneratePage />} />
            <Route path="/history" element={<UserHistory />} />
            <Route path="/upgrade" element={<UpgradePro />} />
          </Routes>
        )}
      </AuthProvider>
    </Router>
  );
};

export default App;



