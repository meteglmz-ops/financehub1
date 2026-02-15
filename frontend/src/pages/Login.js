import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Chrome, X, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, loginWithGoogle, resetPassword, authMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast.success(authMode === 'firebase' ? 'Signed in with Google!' : 'Demo mode: Signed in!');
      navigate('/');
    } catch (error) {
      toast.error('Google sign-in failed');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Password reset link sent to your email!');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset link. Please check your email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-black dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 border border-gray-200 dark:border-white/10" data-testid="login-page">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-electric dark:to-cyan bg-clip-text text-transparent mb-2">
              FinanceHub
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back! Please login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                  placeholder="your@email.com"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/register" className="text-blue-600 dark:text-electric hover:underline" data-testid="register-link">
                Create account
              </Link>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-gray-600 dark:text-gray-400 hover:underline"
                data-testid="forgot-password-link"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
              data-testid="login-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-black text-gray-500">or</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full btn-secondary flex items-center justify-center gap-2"
            data-testid="google-signin-btn"
          >
            <Chrome size={20} />
            Sign in with Google
          </Button>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reset Password</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div>
                <Label htmlFor="reset-email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  {!resetLoading && <ArrowRight size={16} />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}