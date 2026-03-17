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
      toast.success('Giriş başarılı!');
      navigate('/');
    } catch (error) {
      toast.error('Giriş başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast.success(authMode === 'firebase' ? 'Google ile giriş yapıldı!' : 'Demo modu: Giriş yapıldı!');
      navigate('/');
    } catch (error) {
      toast.error('Google ile giriş başarısız oldu');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
      setShowResetModal(false);
      setResetEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Sıfırlama bağlantısı gönderilemedi. Lütfen e-posta adresinizi kontrol edin.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] relative overflow-hidden p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#030303] to-[#030303] pointer-events-none" />
      <div className="absolute inset-0 z-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card p-10 border-white/5 bg-[#050505] relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]" data-testid="login-page">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
              <Link to="/" className="hover:text-cyan-400 transition-colors">TRADXEAI</Link>
            </h1>
            <p className="text-xs font-mono tracking-widest text-cyan-500/80 uppercase">Sisteme Giriş Yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-gray-500 font-mono tracking-widest uppercase">E-posta</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-14"
                  placeholder="ornek@email.com"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-gray-500 font-mono tracking-widest uppercase">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-14 text-2xl tracking-[0.2em]"
                  placeholder="••••••••"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono tracking-widest uppercase mt-4">
              <Link to="/register" className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors" data-testid="register-link">
                Hesap Oluştur
              </Link>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-gray-500 hover:text-white transition-colors"
                data-testid="forgot-password-link"
              >
                Şifremi Unuttum
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-[0.2em] text-sm transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] rounded-none h-14 mt-8"
              data-testid="login-btn"
            >
              {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs font-mono tracking-widest uppercase">
              <span className="px-4 bg-[#050505] text-gray-600">VEYA</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14 flex items-center justify-center gap-3 group"
            data-testid="google-signin-btn"
          >
            <Chrome size={18} className="group-hover:text-cyan-400 transition-colors" />
            Google İle Giriş Yap
          </Button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#050505] w-full max-w-md rounded-none shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/10 flex flex-col p-8 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-mono tracking-widest text-white uppercase">Şifre Sıfırlama</h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <p className="text-xs font-mono tracking-widest uppercase text-gray-400 leading-relaxed">
                E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz.
              </p>

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-xs text-gray-500 font-mono tracking-widest uppercase">E-posta Adresi</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={18} />
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-12 bg-black/50 border-white/10 text-white focus:border-cyan-400 font-mono tracking-widest rounded-none h-14"
                    placeholder="ornek@email.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-400 font-bold uppercase tracking-widest text-sm transition-colors rounded-none h-14 flex items-center justify-center gap-3"
                >
                  {resetLoading ? 'GÖNDERİLİYOR...' : 'SIFIRLAMA BAĞLANTISI GÖNDER'}
                  {!resetLoading && <ArrowRight size={18} />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}