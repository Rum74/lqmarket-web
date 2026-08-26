import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { LQMARKET_LOGO } from '../../assets/logo';
import {
  X,
  Lock,
  User,
  Phone,
  ShieldCheck,
  Store,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    loginUser,
    registerUser
  } = useApp();

  const [accountInput, setAccountInput] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically reset all inputs, passwords and notification banners when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setAccountInput('');
      setPassword('');
      setName('');
      setPhone('');
      setShowPassword(false);
      setErrorMessage('');
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!accountInput.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập Tên tài khoản (hoặc Email/SĐT) và Mật khẩu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(accountInput, password);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 800);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !accountInput.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Họ tên, Tên tài khoản và Mật khẩu!');
      return;
    }

    if (accountInput.trim().length < 3) {
      setErrorMessage('Tên tài khoản phải có ít nhất 3 ký tự!');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu bảo mật phải có ít nhất 6 ký tự!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser(name, accountInput, password, selectedRole, phone);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 1000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 text-left">
        {/* Modal Top Header with Official Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={LQMARKET_LOGO}
              alt="LQMarket Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 min-w-[44px] min-h-[44px] aspect-square rounded-full object-cover shadow-lg shadow-amber-500/20 border border-amber-500/40 shrink-0"
            />
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">
                {authModalMode === 'login' ? 'ĐĂNG NHẬP TÀI KHOẢN' : 'ĐĂNG KÝ THÀNH VIÊN MỚI'}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">Sàn Mua Bán Acc Liên Quân Mobile Uy Tín</p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-2 bg-slate-950 border-b border-slate-800 gap-1 text-center">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authModalMode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Nhập
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthModalMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authModalMode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đăng Ký Tài Khoản
          </button>
        </div>

        {/* Error / Success Feedback Banner */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-rose-200">Thông báo:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="p-5 max-h-[72vh] overflow-y-auto space-y-4">
          {authModalMode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Email hoặc Tên tài khoản:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={accountInput}
                    onChange={e => setAccountInput(e.target.value)}
                    placeholder="Ví dụ: user1@gmail.com hoặc user1"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Mật khẩu:</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Chọn loại tài khoản bạn muốn đăng ký:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'buyer'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <UserCheck size={16} className={selectedRole === 'buyer' ? 'text-amber-400' : 'text-slate-400'} />
                      <span className="text-xs font-bold">Khách Mua Hàng</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Mua acc Liên Quân, bảo vệ tiền qua Escrow, nạp/rút ví.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedRole === 'seller'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Store size={16} className={selectedRole === 'seller' ? 'text-amber-400' : 'text-slate-400'} />
                      <span className="text-xs font-bold">Người Bán (Shop)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Đăng bán acc, quản lý gian hàng, rút tiền về ATM.
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Họ và Tên (hoặc Tên Shop):</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nhập họ và tên hoặc tên shop..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email hoặc Tên tài khoản:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={accountInput}
                    onChange={e => setAccountInput(e.target.value)}
                    placeholder="Ví dụ: user1@gmail.com hoặc user1"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Số điện thoại / Zalo:</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Mật khẩu (≥ 6 ký tự):</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? 'Đang tạo tài khoản...' : 'HOÀN TẤT ĐĂNG KÝ'}
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>

        {/* Footer Security Notice */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Bảo mật Cloud Firestore 256-bit & Giao dịch trung gian an toàn</span>
        </div>
      </div>
    </div>
  );
};

