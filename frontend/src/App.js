import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Subscriptions from './pages/Subscriptions';
import Markets from './pages/Markets';
import Savings from './pages/Savings';
import Calendar from './pages/Calendar';
import Tools from './pages/Tools';
import AIAnalysis from './pages/AIAnalysis';
import Login from './pages/Login';
import Register from './pages/Register';
import { Toaster } from 'sonner';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/accounts" element={<PrivateRoute><Layout><Accounts /></Layout></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Layout><Transactions /></Layout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
          <Route path="/subscriptions" element={<PrivateRoute><Layout><Subscriptions /></Layout></PrivateRoute>} />
          <Route path="/markets" element={<PrivateRoute><Layout><Markets /></Layout></PrivateRoute>} />
          <Route path="/savings" element={<PrivateRoute><Layout><Savings /></Layout></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><Layout><Calendar /></Layout></PrivateRoute>} />
          <Route path="/tools" element={<PrivateRoute><Layout><Tools /></Layout></PrivateRoute>} />
          <Route path="/ai-analysis" element={<PrivateRoute><Layout><AIAnalysis /></Layout></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="system" />
    </div>
  );
}

export default App;