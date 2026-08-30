import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';
import confetti from '../../utils/confetti';
import { LQMARKET_LOGO } from '../../assets/logo';
import {
  Wallet,
  X,
  ArrowUpRight,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Building2,
  Home,
  CheckCircle,
  ExternalLink,
  Zap,
  ArrowLeft,
  Smartphone,
  CreditCard,
  RotateCcw,
  Lock
} from 'lucide-react';

const DENOMINATIONS: number[] = [
  10000,
  20000,
  50000,
  100000,
  200000,
  500000,
  1000000,
  2000000
];

const POPULAR_BANKS = [
  { value: 'MB Bank (Ngân Hàng Quân Đội)', label: 'MB Bank (Ngân Hàng Quân Đội)' },
  { value: 'Vietcombank (Ngoại Thương VN)', label: 'Vietcombank (Ngoại Thương VN)' },
  { value: 'Techcombank (Kỹ Thương VN)', label: 'Techcombank (Kỹ Thương VN)' },
  { value: 'ACB (Á Châu)', label: 'ACB (Á Châu)' },
  { value: 'VPBank (Việt Nam Thịnh Vượng)', label: 'VPBank (Việt Nam Thịnh Vượng)' },
  { value: 'BIDV (Đầu Tư & Phát Triển)', label: 'BIDV (Đầu Tư & Phát Triển)' },
  { value: 'VietinBank (Công Thương VN)', label: 'VietinBank (Công Thương VN)' },
  { value: 'TPBank (Tiên Phong)', label: 'TPBank (Tiên Phong)' },
  { value: 'Sacombank (Sài Gòn Thương Tín)', label: 'Sacombank (Sài Gòn Thương Tín)' },
  { value: 'Agribank (Nông Nghiệp VN)', label: 'Agribank (Nông Nghiệp VN)' },
  { value: 'Ví MoMo (Số điện thoại)', label: 'Ví MoMo (Số điện thoại)' }
];

type PaymentMethodType = 'qr_pay' | 'banking_app' | 'e_wallet';

export const WalletModal: React.FC = () => {
  const {
    isWalletModalOpen,
    setIsWalletModalOpen,
    currentUser,
    depositBalance,
    withdrawBalance,
    transactions,
    setCurrentView,
    refreshAllData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history' | 'guide'>('deposit');
  
  // 4-Step Payment Flow: 'select' -> 'review' -> 'qr' -> 'processing'
  const [depositStep, setDepositStep] = useState<'select' | 'review' | 'qr' | 'processing'>('select');
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('qr_pay');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [lockedMethodNotice, setLockedMethodNotice] = useState<string | null>(null);
  
  const [transferCode, setTransferCode] = useState<string>('');
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // PayOS Payment State
  const [payOsOrderCode, setPayOsOrderCode] = useState<number | null>(null);
  const [payOsCheckoutUrl, setPayOsCheckoutUrl] = useState<string | null>(null);
  const [isCreatingPayOsLink, setIsCreatingPayOsLink] = useState(false);
  const [payOsAccountNo, setPayOsAccountNo] = useState<string>('555507042002');
  const [payOsAccountName, setPayOsAccountName] = useState<string>('HUYNH VAN PHONG');

  // 5-minute Countdown Timer (300s)
  const [timeLeft, setTimeLeft] = useState<number>(300);
  
  // Processing status
  const [isCheckingResult, setIsCheckingResult] = useState(false);
  const [checkPaymentMessage, setCheckPaymentMessage] = useState<string>('Đang tải, vui lòng đợi...');

  // Manual Order Code Sync Recovery
  const [manualSyncCode, setManualSyncCode] = useState<string>('');
  const [isSyncingOrder, setIsSyncingOrder] = useState(false);
  const [manualSyncFeedback, setManualSyncFeedback] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);

  // Withdraw state - Automatically loaded from current user's profile
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [userWithdrawBank, setUserWithdrawBank] = useState<string>('MB Bank (Ngân Hàng Quân Đội)');
  const [userWithdrawAccount, setUserWithdrawAccount] = useState<string>('');
  const [userWithdrawAccountName, setUserWithdrawAccountName] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Webhook Sync Test in Guide tab
  const [webhookSyncStatus, setWebhookSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [webhookSyncMsg, setWebhookSyncMsg] = useState<string>('');

  const pollIntervalRef = useRef<any>(null);

  // Sync profile bank details whenever user changes or modal opens or tab switches
  useEffect(() => {
    if (currentUser) {
      if (currentUser.bankName) {
        setUserWithdrawBank(currentUser.bankName);
      } else {
        setUserWithdrawBank('MB Bank (Ngân Hàng Quân Đội)');
      }
      if (currentUser.bankAccount) {
        setUserWithdrawAccount(currentUser.bankAccount);
      } else {
        setUserWithdrawAccount('');
      }
      if (currentUser.bankAccountName) {
        setUserWithdrawAccountName(currentUser.bankAccountName);
      } else if (currentUser.name && currentUser.name !== 'Khách') {
        setUserWithdrawAccountName(currentUser.name.toUpperCase());
      } else {
        setUserWithdrawAccountName('');
      }
    }
  }, [currentUser, isWalletModalOpen, activeTab]);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isWalletModalOpen) {
      if (activeTab === 'guide' && currentUser?.role !== 'admin') {
        setActiveTab('deposit');
      }
      setDepositStep('select');
      setSelectedMethod('qr_pay');
      setDepositSuccess(false);
      setIsCheckingResult(false);
      setWithdrawSuccess(false);
      setWithdrawError(null);
      setLockedMethodNotice(null);
    }
  }, [isWalletModalOpen, activeTab, currentUser?.role]);

  // Auto-detect when returned from PayOS redirect (URL params)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const paymentStatus = searchParams.get('payment');
    const codeParam = searchParams.get('orderCode') || searchParams.get('order_code') || searchParams.get('code');
    const payOsStatus = searchParams.get('status');
    const storedCode = localStorage.getItem('last_payos_order_code') || localStorage.getItem('last_payos_memo');
    const storedAmount = Number(localStorage.getItem('last_payos_amount'));

    if (paymentStatus === 'success' || payOsStatus === 'PAID' || searchParams.get('code') === '00' || (codeParam && paymentStatus !== 'cancelled')) {
      const targetCode = codeParam || storedCode || '';
      if (targetCode) {
        setPayOsOrderCode(Number(targetCode));
        setTransferCode(targetCode);
      }
      if (storedAmount && !isNaN(storedAmount) && storedAmount > 0) {
        setDepositAmount(storedAmount);
      }
      setIsWalletModalOpen(true);
      setActiveTab('deposit');
      setDepositStep('qr'); // Return to payment QR tab as shown in Hình 2

      // Background verify and credit on backend
      api.post('/api/payos/manual-sync', {
        orderCode: Number(targetCode) || Number(storedCode),
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userName: currentUser?.name
      })
      .then(async (syncData) => {
        if (syncData && syncData.success && (syncData.status === 'PAID' || syncData.isPaid)) {
          await refreshAllData();
        } else if (targetCode) {
          const checkRes = await api.get(`/api/payos/check-payment/${targetCode}`);
          if (checkRes && checkRes.success && (checkRes.status === 'PAID' || checkRes.isPaid)) {
            await refreshAllData();
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        try {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } catch {}
      });
    }
  }, [currentUser?.id, currentUser?.email, currentUser?.name, refreshAllData, setIsWalletModalOpen]);

  // Create PayOS payment link
  const createPayOsLink = async (amountToDeposit: number, memoCode: string) => {
    setIsCreatingPayOsLink(true);
    try {
      localStorage.setItem('last_payos_memo', memoCode);
      localStorage.setItem('last_payos_amount', String(amountToDeposit));

      const data = await api.post('/api/payos/create-payment-link', {
        amount: amountToDeposit,
        description: `NAP ${memoCode}`,
        userId: currentUser?.id,
        userName: currentUser?.name,
        userEmail: currentUser?.email,
        memoCode: memoCode,
        returnUrl: `${window.location.origin}/?payment=success&orderCode=${memoCode}`,
        cancelUrl: `${window.location.origin}/?payment=cancelled&orderCode=${memoCode}`
      });

      if (data && data.success) {
        setPayOsOrderCode(data.orderCode);
        localStorage.setItem('last_payos_order_code', String(data.orderCode));
        setPayOsCheckoutUrl(data.checkoutUrl);
        if (data.accountNumber) setPayOsAccountNo(data.accountNumber);
        if (data.accountName) setPayOsAccountName(data.accountName);
      }
    } catch (err) {
      console.warn('Could not generate PayOS link, using standard VietQR fallback:', err);
    } finally {
      setIsCreatingPayOsLink(false);
    }
  };

  // Manual Sync Specific Order Code (For transactions completed outside the window)
  const handleSyncSpecificOrder = async (overrideCode?: string) => {
    const targetCode = (overrideCode || manualSyncCode || (payOsOrderCode ? String(payOsOrderCode) : '')).trim();
    if (!targetCode) {
      setManualSyncFeedback({ type: 'error', msg: 'Vui lòng nhập mã đơn hàng PayOS!' });
      return;
    }

    setIsSyncingOrder(true);
    setManualSyncFeedback({ type: 'info', msg: 'Đang liên hệ cổng PayOS để kiểm tra giao dịch...' });

    try {
      // 1. Try manual-sync endpoint (which triggers creditUserDeposit on backend)
      const syncData = await api.post('/api/payos/manual-sync', {
        orderCode: Number(targetCode),
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userName: currentUser?.name
      });

      if (syncData && syncData.success && (syncData.status === 'PAID' || syncData.isPaid)) {
        const creditedAmount = syncData.amount || depositAmount || 50000;
        depositBalance(
          creditedAmount,
          'Cổng PayOS Tự Động (VietQR/Napas 24/7)',
          `Đồng bộ PayOS đơn #${targetCode}`
        );
        setManualSyncFeedback({
          type: 'success',
          msg: `Thành công! Đã cộng +${creditedAmount.toLocaleString('vi-VN')}đ vào ví!`
        });
        try {
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
        } catch {}
        return;
      }

      // 2. Fallback to check-payment endpoint
      const checkData = await api.get(`/api/payos/check-payment/${targetCode}`);

      if (checkData && checkData.success && (checkData.status === 'PAID' || checkData.isPaid)) {
        const creditedAmount = checkData.amount || depositAmount || 50000;
        depositBalance(
          creditedAmount,
          'Cổng PayOS Tự Động (VietQR/Napas 24/7)',
          `Đồng bộ PayOS đơn #${targetCode}`
        );
        setManualSyncFeedback({
          type: 'success',
          msg: `Thành công! Đã cộng +${creditedAmount.toLocaleString('vi-VN')}đ vào ví!`
        });
        try {
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
        } catch {}
      } else {
        setManualSyncFeedback({
          type: 'error',
          msg: `Đơn hàng #${targetCode} chưa ghi nhận thanh toán PAID trên PayOS (Trạng thái: ${checkData?.status || 'PENDING'}).`
        });
      }
    } catch (e: any) {
      setManualSyncFeedback({
        type: 'error',
        msg: `Lỗi kết nối khi đồng bộ: ${e.message || 'Vui lòng thử lại sau.'}`
      });
    } finally {
      setIsSyncingOrder(false);
    }
  };

  // Generate QR code and reset 5-minute timer
  const initPaymentSession = () => {
    const code = `${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTransferCode(code);
    setTimeLeft(300); // 5 minutes exactly
    setDepositStep('qr');
    createPayOsLink(depositAmount, code);
  };

  // 5-minute countdown interval when on QR step
  useEffect(() => {
    if (!isWalletModalOpen || activeTab !== 'deposit' || depositStep !== 'qr') return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isWalletModalOpen, activeTab, depositStep, timeLeft]);

  // Background polling for real PayOS payment status (2s interval)
  useEffect(() => {
    if (!isWalletModalOpen || depositSuccess || activeTab !== 'deposit') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    if (depositStep !== 'qr' && depositStep !== 'processing') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    const checkStatus = async () => {
      if (!payOsOrderCode) return;
      try {
        const data = await api.get(`/api/payos/check-payment/${payOsOrderCode}`);
        if (data && data.success && (data.status === 'PAID' || data.isPaid)) {
          // Real transaction verified by PayOS and already credited strictly once in DB
          await refreshAllData();
          setDepositSuccess(true);
          setIsCheckingResult(false);

          try {
            confetti({
              particleCount: 130,
              spread: 95,
              origin: { y: 0.6 }
            });
          } catch {}

          // Auto redirect to home after 2.5 seconds
          setTimeout(() => {
            setIsWalletModalOpen(false);
            setCurrentView('home');
          }, 2500);
        }
      } catch (e) {}
    };

    pollIntervalRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isWalletModalOpen, depositSuccess, activeTab, depositStep, payOsOrderCode, refreshAllData, setIsWalletModalOpen, setCurrentView]);

  // Action: "Thanh toán đã hoàn tất" -> chuyển sang màn hình Chờ xử lý (Processing) và truy vấn thật từ PayOS
  const handlePaymentCompleted = async () => {
    const codeToVerify = payOsOrderCode || Number(transferCode) || Number(localStorage.getItem('last_payos_order_code')) || Number(localStorage.getItem('last_payos_memo'));
    setDepositStep('processing');
    setIsCheckingResult(true);
    setCheckPaymentMessage('Đang kết nối ngân hàng & cổng PayOS để xác nhận giao dịch...');

    try {
      // 1. Try manual sync with PayOS
      const syncData = await api.post('/api/payos/manual-sync', {
        orderCode: codeToVerify,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userName: currentUser?.name
      });

      if (syncData && syncData.success && (syncData.status === 'PAID' || syncData.isPaid)) {
        await refreshAllData();
        setDepositSuccess(true);
        setIsCheckingResult(false);
        try {
          confetti({
            particleCount: 150,
            spread: 95,
            origin: { y: 0.6 }
          });
        } catch {}

        setTimeout(() => {
          setIsWalletModalOpen(false);
          setCurrentView('home');
        }, 2500);
        return;
      }

      // 2. Fallback check-payment endpoint
      if (codeToVerify) {
        const checkData = await api.get(`/api/payos/check-payment/${codeToVerify}`);
        if (checkData && checkData.success && (checkData.status === 'PAID' || checkData.isPaid)) {
          await refreshAllData();
          setDepositSuccess(true);
          setIsCheckingResult(false);
          try {
            confetti({
              particleCount: 150,
              spread: 95,
              origin: { y: 0.6 }
            });
          } catch {}

          setTimeout(() => {
            setIsWalletModalOpen(false);
            setCurrentView('home');
          }, 2500);
          return;
        }
      }

      setCheckPaymentMessage('Chưa nhận được giao dịch từ ngân hàng. Hệ thống đang tự động kiểm tra lại...');
      setIsCheckingResult(false);
    } catch (e) {
      setCheckPaymentMessage('Đang chờ hệ thống PayOS xử lý giao dịch...');
      setIsCheckingResult(false);
    }
  };

  // Manual Check Now button
  const handleManualRecheck = async () => {
    const codeToVerify = payOsOrderCode || Number(transferCode) || Number(localStorage.getItem('last_payos_order_code')) || Number(localStorage.getItem('last_payos_memo'));
    setIsCheckingResult(true);
    setCheckPaymentMessage('Đang truy vấn trạng thái đơn hàng từ PayOS...');
    try {
      const syncData = await api.post('/api/payos/manual-sync', {
        orderCode: codeToVerify,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userName: currentUser?.name
      });

      if (syncData && syncData.success && (syncData.status === 'PAID' || syncData.isPaid)) {
        await refreshAllData();
        setDepositSuccess(true);
        try {
          confetti({
            particleCount: 150,
            spread: 95,
            origin: { y: 0.6 }
          });
        } catch {}
        setTimeout(() => {
          setIsWalletModalOpen(false);
          setCurrentView('home');
        }, 2500);
        return;
      }

      if (codeToVerify) {
        const data = await api.get(`/api/payos/check-payment/${codeToVerify}`);
        if (data && data.success && (data.status === 'PAID' || data.isPaid)) {
          await refreshAllData();
          setDepositSuccess(true);
          try {
            confetti({
              particleCount: 150,
              spread: 95,
              origin: { y: 0.6 }
            });
          } catch {}
          setTimeout(() => {
            setIsWalletModalOpen(false);
            setCurrentView('home');
          }, 2500);
          return;
        }
      }

      setCheckPaymentMessage('Chưa nhận được giao dịch từ ngân hàng. Vui lòng hoàn tất chuyển khoản theo đúng mã đơn hàng.');
    } catch (err) {
      setCheckPaymentMessage('Lỗi kiểm tra trạng thái. Vui lòng bấm kiểm tra lại sau giây lát.');
    } finally {
      setIsCheckingResult(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // High-reliability VietQR image URL (Always loads perfectly)
  const getVietQrUrl = () => {
    const memo = payOsOrderCode ? `NAP ${payOsOrderCode}` : `NAP ${transferCode}`;
    return `https://img.vietqr.io/image/970422-555507042002-compact2.png?amount=${depositAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent('HUYNH VAN PHONG')}`;
  };

  const getMethodName = () => {
    switch (selectedMethod) {
      case 'qr_pay':
        return 'QR Pay (Napas 24/7)';
      case 'banking_app':
        return 'Thanh toán qua App Ngân Hàng';
      case 'e_wallet':
        return 'Ví ShopeePay / MoMo / ZaloPay';
      default:
        return 'QR Pay';
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    if (withdrawAmount > currentUser.balance) {
      setWithdrawError('Số dư khả dụng không đủ để thực hiện lệnh rút!');
      return;
    }
    const success = withdrawBalance(
      withdrawAmount,
      `${userWithdrawBank} - ${userWithdrawAccount} (${userWithdrawAccountName})`,
      {
        bankName: userWithdrawBank,
        bankAccount: userWithdrawAccount,
        bankAccountName: userWithdrawAccountName
      }
    );
    if (success) {
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 4000);
    }
  };

  const handleConfirmPayOsWebhook = async () => {
    setWebhookSyncStatus('syncing');
    try {
      const webhookUrl = `${window.location.origin}/api/payos/webhook`;
      const res = await fetch('/api/payos/confirm-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookSyncStatus('success');
        setWebhookSyncMsg('Đã xác thực và kết nối thành công Webhook với máy chủ PayOS!');
      } else {
        setWebhookSyncStatus('error');
        setWebhookSyncMsg(data.message || 'Lỗi xác thực webhook');
      }
    } catch (err: any) {
      setWebhookSyncStatus('error');
      setWebhookSyncMsg('Lỗi kết nối máy chủ backend PayOS');
    }
  };

  if (!isWalletModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-left flex flex-col my-auto max-h-[96vh]">
        
        {/* TOP BRAND HEADER (LQMARKET OFFICIAL STYLE) */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={LQMARKET_LOGO}
              alt="LQMarket Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 min-w-[40px] min-h-[40px] aspect-square rounded-full object-cover shadow-md shadow-amber-500/20 border border-amber-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">TRUNG TÂM NẠP TIỀN CHÍNH THỨC</span>
                <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.2 rounded font-black border border-red-500/30">
                  LQMARKET
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tài khoản: <strong className="text-slate-200">{currentUser.name || 'CRxRum'}</strong> • Số dư ví: <strong className="text-amber-400">{currentUser.balance.toLocaleString('vi-VN')}đ</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWalletModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* TOP TABS NAVIGATION */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab('deposit');
                setDepositStep('select');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'deposit' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Nạp Tiền
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'withdraw' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Rút Tiền
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              Lịch Sử
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'guide' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'text-slate-400 hover:text-white bg-slate-900'
                }`}
              >
                Cổng PayOS
              </button>
            )}
          </div>

          <div className="text-[11px] text-emerald-400 font-bold hidden sm:flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PayOS Napas 24/7</span>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4">
          {activeTab === 'deposit' && (
            <>
              {/* ========================================================================= */}
              {/* BƯỚC 1: CHỌN SỐ TIỀN + PHƯƠNG THỨC THANH TOÁN (THEO HÌNH 1: IMG_5998.png) */}
              {/* ========================================================================= */}
              {depositStep === 'select' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Notice banner */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      Hiện đang hiển thị mệnh giá qua <strong className="text-red-400">QR Pay</strong>.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDepositAmount(50000);
                        setCustomAmount('');
                      }}
                      className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-900 rounded-lg border border-slate-700 text-[11px] font-bold cursor-pointer"
                    >
                      Đặt lại
                    </button>
                  </div>

                  {/* Denomination Grid */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {DENOMINATIONS.map(amount => {
                        const isSelected = depositAmount === amount && !customAmount;
                        return (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => {
                              setDepositAmount(amount);
                              setCustomAmount('');
                            }}
                            className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'bg-red-500/10 border-red-500 shadow-md shadow-red-500/20'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`text-xs font-black ${isSelected ? 'text-red-400' : 'text-white'}`}>
                              {amount.toLocaleString('vi-VN')} đ
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom input */}
                    <div className="pt-1">
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Hoặc nhập số tiền tùy ý (VD: 300000)..."
                          value={customAmount}
                          onChange={e => {
                            setCustomAmount(e.target.value);
                            const val = Number(e.target.value);
                            if (val > 0) setDepositAmount(val);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-red-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">VNĐ</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center">
                          3
                        </span>
                        <strong className="text-xs text-white">Phương thức thanh toán</strong>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        PayOS Napas 24/7
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Chọn mệnh giá tạo mã QR bên dưới, đăng nhập ứng dụng Ngân hàng chọn QR Pay quét mã QR hoàn tất thanh toán.
                    </p>

                    {/* Method List */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Method 1: QR Pay (VietQR PayOS) - Chỉ hiển thị QR Pay (PayOS) và mệnh giá tiền */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMethod('qr_pay');
                          setLockedMethodNotice(null);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-center min-h-[72px] ${
                          selectedMethod === 'qr_pay'
                            ? 'bg-red-500/10 border-red-500 shadow-md shadow-red-500/20 ring-1 ring-red-500/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                            <QrCode size={19} />
                          </div>
                          <div>
                            <strong className="text-xs text-white block">QR Pay (PayOS)</strong>
                            <span className="text-[11px] text-emerald-400 font-bold">
                              {depositAmount.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      </button>

                      {/* Method 2: Banking App - LOCKED */}
                      <button
                        type="button"
                        onClick={() => {
                          setLockedMethodNotice('Cổng "App Ngân Hàng" chưa được liên kết với đối tác bên ngoài, tạm thời bị khoá để phát triển thêm!');
                        }}
                        className="p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[72px] bg-slate-950/50 border-slate-800/60 opacity-60 hover:opacity-80 cursor-not-allowed"
                      >
                        <span className="absolute top-2 right-2 bg-slate-800 text-slate-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-slate-700/60 flex items-center gap-1">
                          <Lock size={9} /> Khóa
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <strong className="text-xs text-slate-400 block line-through">App Ngân Hàng</strong>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Sắp ra mắt
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 block">Chưa liên kết</span>
                      </button>

                      {/* Method 3: E-Wallet - LOCKED */}
                      <button
                        type="button"
                        onClick={() => {
                          setLockedMethodNotice('Cổng "Ví Điện Tử" chưa được liên kết với đối tác bên ngoài, tạm thời bị khoá để phát triển thêm!');
                        }}
                        className="p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[72px] col-span-2 bg-slate-950/50 border-slate-800/60 opacity-60 hover:opacity-80 cursor-not-allowed"
                      >
                        <span className="absolute top-2 right-2 bg-slate-800 text-slate-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-slate-700/60 flex items-center gap-1">
                          <Lock size={9} /> Đang phát triển
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                            <CreditCard size={18} />
                          </div>
                          <div>
                            <strong className="text-xs text-slate-400 block line-through">Ví Điện Tử (ShopeePay / MoMo / ZaloPay)</strong>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Tạm khóa để tích hợp đối tác sau
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 block">Chưa liên kết cổng ví điện tử</span>
                      </button>
                    </div>

                    {/* Locked Method Warning toast if clicked */}
                    {lockedMethodNotice && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-center gap-2 animate-in fade-in duration-150">
                        <AlertCircle size={14} className="text-amber-400 shrink-0" />
                        <span>{lockedMethodNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary & Nạp Ngay Button (Footer) */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Tổng cộng:</span>
                      <strong className="text-base sm:text-lg font-black text-red-400">
                        {depositAmount.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDepositStep('review')}
                      disabled={depositAmount < 2000}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      <span>Nạp ngay</span>
                    </button>
                  </div>

                  {/* PayOS Manual Order Recovery Box (For users who paid but need instant sync) */}
                  <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <RefreshCw size={13} className="text-amber-400" />
                        <span>Đã thanh toán PayOS nhưng chưa thấy cộng tiền?</span>
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã đơn PayOS (VD: 1740398...)"
                        value={manualSyncCode}
                        onChange={e => setManualSyncCode(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleSyncSpecificOrder()}
                        disabled={isSyncingOrder || !manualSyncCode.trim()}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                      >
                        <RefreshCw size={13} className={isSyncingOrder ? 'animate-spin' : ''} />
                        <span>Đồng bộ ngay</span>
                      </button>
                    </div>
                    {manualSyncFeedback && (
                      <div
                        className={`p-2 rounded-xl text-[11px] flex items-center gap-1.5 ${
                          manualSyncFeedback.type === 'success'
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : manualSyncFeedback.type === 'error'
                            ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                            : 'bg-blue-500/15 border border-blue-500/30 text-blue-300'
                        }`}
                      >
                        {manualSyncFeedback.type === 'success' ? (
                          <CheckCircle size={13} className="shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle size={13} className="shrink-0" />
                        )}
                        <span>{manualSyncFeedback.msg}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* BƯỚC 2: XỬ LÝ THANH TOÁN / REVIEW ĐƠN NẠP (THEO HÌNH 2: IMG_5999.png)     */}
              {/* ========================================================================= */}
              {depositStep === 'review' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Header with Back button */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDepositStep('select')}
                      className="px-3 py-1.5 text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Trang trước</span>
                    </button>
                    <span className="text-xs font-bold text-slate-400">Xác nhận thanh toán</span>
                  </div>

                  {/* Banner game logo */}
                  <div className="p-4 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
                    <img
                      src={LQMARKET_LOGO}
                      alt="LQMarket Logo"
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 min-w-[64px] min-h-[64px] aspect-square rounded-full object-cover mx-auto shadow-lg shadow-amber-500/25 border-2 border-amber-500/60 shrink-0"
                    />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      LQMARKET SHOP VIỆT NAM
                    </h3>
                  </div>

                  {/* Summary receipt table */}
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Tổng cộng:</span>
                      <strong className="text-red-400 font-black text-sm">
                        {depositAmount.toLocaleString('vi-VN')} đ
                      </strong>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Giá:</span>
                      <span className="text-slate-200 font-bold">{depositAmount.toLocaleString('vi-VN')} đ</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">Phương thức thanh toán:</span>
                      <span className="text-slate-200 font-bold">{getMethodName()}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Tên tài khoản nhận:</span>
                      <span className="text-amber-400 font-bold">{currentUser.name || 'CRxRum'}</span>
                    </div>
                  </div>

                  {/* Big Red Button: "Xử lý thanh toán" */}
                  <button
                    type="button"
                    onClick={initPaymentSession}
                    disabled={isCreatingPayOsLink}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingPayOsLink ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Đang khởi tạo mã thanh toán...</span>
                      </>
                    ) : (
                      <span>Xử lý thanh toán</span>
                    )}
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* BƯỚC 3: HIỂN THỊ MÃ QR + ĐẾM NGƯỢC 5P (THEO HÌNH 3: IMG_6001.png)         */}
              {/* ========================================================================= */}
              {depositStep === 'qr' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Header with Back button & 5-minute countdown */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setDepositStep('review')}
                      className="px-3 py-1.5 text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={14} />
                      <span>Trang trước</span>
                    </button>

                    {/* 5-minute timer */}
                    <div
                      className={`px-3 py-1 rounded-xl font-mono font-black text-xs border flex items-center gap-1.5 ${
                        timeLeft > 60
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                          : timeLeft > 0
                          ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      <Clock size={13} className={timeLeft <= 60 && timeLeft > 0 ? 'animate-spin' : ''} />
                      <span>{formatMinutes(timeLeft)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-1">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Quét mã bằng ngân hàng bạn chọn
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Thanh toán qua bất kỳ ngân hàng hoặc ví điện tử nào
                    </p>
                  </div>

                  {/* Expired State */}
                  {timeLeft === 0 ? (
                    <div className="p-6 text-center space-y-3 bg-red-500/10 border border-red-500/30 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <strong className="text-red-300 text-sm block">Mã thanh toán 5 phút đã hết hạn!</strong>
                        <p className="text-xs text-slate-400 mt-1">
                          Vui lòng bấm nút bên dưới để tạo mã QR mới.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={initPaymentSession}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer inline-flex items-center gap-2"
                      >
                        <RotateCcw size={14} />
                        <span>Tạo mã QR mới</span>
                      </button>
                    </div>
                  ) : (
                    /* Active QR View */
                    <div className="space-y-4">
                      {/* Crisp Centered QR Code */}
                      <div className="p-3 bg-white rounded-2xl shadow-xl max-w-[240px] mx-auto flex flex-col items-center justify-center border border-slate-200">
                        {isCreatingPayOsLink ? (
                          <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-700 gap-2">
                            <RefreshCw size={26} className="animate-spin text-red-600" />
                            <span className="text-[11px] font-bold">Đang tạo mã QR...</span>
                          </div>
                        ) : (
                          <img
                            src={getVietQrUrl()}
                            alt="VietQR PayOS"
                            className="w-48 h-48 object-contain rounded-lg"
                            loading="eager"
                          />
                        )}
                        <span className="text-[10px] font-bold text-slate-900 mt-1 bg-slate-100 px-2 py-0.5 rounded-full">
                          VietQR Napas 24/7
                        </span>
                      </div>

                      {/* Quick Transfer info with Copy */}
                      <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Ngân hàng:</span>
                          <span className="font-bold text-white flex items-center gap-1">
                            <Building2 size={13} className="text-amber-400" /> MB Bank (Quân Đội)
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Số tài khoản:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-400">{payOsAccountNo}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(payOsAccountNo, 'stk')}
                              className="p-1 px-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              {copiedField === 'stk' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Chủ tài khoản:</span>
                          <span className="font-bold text-slate-200 uppercase">{payOsAccountName}</span>
                        </div>

                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                          <span className="text-slate-400">Số tiền:</span>
                          <span className="font-black text-red-400">{depositAmount.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Nội dung chuyển:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                              {payOsOrderCode ? `NAP ${payOsOrderCode}` : `NAP ${transferCode}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(payOsOrderCode ? `NAP ${payOsOrderCode}` : `NAP ${transferCode}`, 'memo')}
                              className="p-1 px-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedField === 'memo' ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                              <span>{copiedField === 'memo' ? 'Đã chép' : 'Chép'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Optional PayOS Hosted Checkout Link Button */}
                      {payOsCheckoutUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            if (payOsOrderCode) localStorage.setItem('last_payos_order_code', String(payOsOrderCode));
                            if (transferCode) localStorage.setItem('last_payos_memo', transferCode);
                            localStorage.setItem('last_payos_amount', String(depositAmount));
                            window.location.href = payOsCheckoutUrl;
                          }}
                          className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={14} className="text-amber-400" />
                          <span>Mở trang thanh toán PayOS trực tiếp (Chuyển trang an toàn)</span>
                        </button>
                      )}

                      {/* Primary Button: "Thanh toán đã hoàn tất" (Removed "Tôi đã chuyển khoản") */}
                      <button
                        type="button"
                        onClick={handlePaymentCompleted}
                        className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                        <span>Thanh toán đã hoàn tất</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* BƯỚC 4: CHỜ XỬ LÝ & HOÀN TẤT (THEO HÌNH 4: IMG_6002.png)                  */}
              {/* ========================================================================= */}
              {depositStep === 'processing' && (
                <div className="p-5 sm:p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
                  {depositSuccess ? (
                    <div className="space-y-4 py-2">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
                        <CheckCircle size={36} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                          Thanh toán thành công!
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          +{depositAmount.toLocaleString('vi-VN')} đ
                        </h3>
                        <p className="text-xs text-slate-400">
                          Hệ thống đã xác nhận biến động số dư và cộng tiền vào ví. Đang chuyển về trang chủ...
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Loading Spinner Screen matching Image 4 with real polling */
                    <div className="space-y-4 py-2">
                      {/* Red circular ring spinner */}
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-red-600 animate-spin" />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-base font-black text-white">Đang tải...</h3>
                        <p className="text-xs text-slate-300 font-medium">
                          {checkPaymentMessage}
                        </p>
                        <span className="inline-block text-[11px] text-slate-500 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          Mã đơn PayOS: #{payOsOrderCode || transferCode}
                        </span>
                      </div>

                      {/* Action buttons inside processing view */}
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={handleManualRecheck}
                          disabled={isCheckingResult}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw size={14} className={isCheckingResult ? 'animate-spin' : ''} />
                          <span>Kiểm tra lại giao dịch ngay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDepositStep('qr')}
                          className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft size={13} />
                          <span>Quay lại xem mã QR</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Red Button: "Quay lại Trang chủ" */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsWalletModalOpen(false);
                      setCurrentView('home');
                    }}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-sm transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Home size={16} />
                    <span>Quay lại Trang chủ</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: RÚT TIỀN (LẤY TỰ ĐỘNG TỪ HỒ SƠ NGƯỜI BÁN) */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-4 animate-in fade-in duration-200">
              {withdrawError && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-sm text-emerald-200">Lệnh rút tiền đã được tạo!</strong>
                    <span>Hệ thống đang tiến hành giải ngân về tài khoản của bạn trong 5-15 phút.</span>
                  </div>
                </div>
              )}

              {/* Thông báo lấy thông tin từ hồ sơ */}
              {currentUser.bankAccount ? (
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl flex items-center justify-between text-[11px] text-blue-300">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-blue-400" />
                    <span>Thông tin ngân hàng được tự động lấy từ hồ sơ tài khoản</span>
                  </span>
                  <span className="font-bold text-blue-400 uppercase text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded">
                    {currentUser.bankName || 'ĐÃ LƯU'}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400" />
                  <span>Nhập thông tin tài khoản ngân hàng để nhận tiền giải ngân nhanh 24/7.</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ngân hàng / Ví nhận tiền:
                </label>
                <select
                  value={userWithdrawBank}
                  onChange={e => setUserWithdrawBank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-red-500"
                >
                  {POPULAR_BANKS.map(bank => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                  {userWithdrawBank && !POPULAR_BANKS.some(b => b.value === userWithdrawBank) && (
                    <option value={userWithdrawBank}>{userWithdrawBank}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Số tài khoản / SĐT MoMo:
                  </label>
                  <input
                    type="text"
                    required
                    value={userWithdrawAccount}
                    onChange={e => setUserWithdrawAccount(e.target.value)}
                    placeholder="VD: 0987654321..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Chủ tài khoản (Không dấu):
                  </label>
                  <input
                    type="text"
                    required
                    value={userWithdrawAccountName}
                    onChange={e => setUserWithdrawAccountName(e.target.value.toUpperCase())}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:border-red-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Số tiền muốn rút (VNĐ):
                </label>
                <input
                  type="number"
                  required
                  min={50000}
                  max={currentUser.balance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-bold text-sm rounded-xl p-2.5 focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Khả dụng: {currentUser.balance.toLocaleString('vi-VN')}đ • Phí giao dịch 0đ
                </span>
              </div>

              <button
                type="submit"
                disabled={currentUser.balance < 50000}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowUpRight size={16} />
                <span>RÚT {withdrawAmount.toLocaleString('vi-VN')}đ VỀ TÀI KHOẢN</span>
              </button>
            </form>
          )}

          {/* TAB 3: LỊCH SỬ GIAO DỊCH (RIÊNG BIỆT CHO TỪNG TÀI KHOẢN) */}
          {activeTab === 'history' && (
            <div className="space-y-2 divide-y divide-slate-800/80 animate-in fade-in duration-200">
              {(() => {
                const userTransactions = transactions.filter(t => t.userId === currentUser.id);
                if (userTransactions.length === 0) {
                  return (
                    <div className="text-center text-xs text-slate-500 py-10">
                      Chưa có lịch sử giao dịch nào cho tài khoản này ({currentUser.name || 'Bạn'}).
                    </div>
                  );
                }
                return userTransactions.map(t => (
                  <div key={t.id} className="pt-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {t.type === 'deposit' && <span className="text-emerald-400">+ Nạp tiền</span>}
                        {t.type === 'purchase' && <span className="text-rose-400">- Mua acc</span>}
                        {t.type === 'seller_payout' && <span className="text-amber-400">+ Tiền bán acc</span>}
                        {t.type === 'withdraw' && (
                          <span className="text-purple-400">
                            - Rút tiền {t.status === 'pending' && <span className="text-amber-400 text-[10px] font-normal">(Đang chờ duyệt)</span>}
                            {t.status === 'failed' && <span className="text-red-400 text-[10px] font-normal">(Bị từ chối)</span>}
                          </span>
                        )}
                        {t.type === 'refund' && <span className="text-cyan-400">+ Hoàn tiền</span>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.note}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(t.createdAt).toLocaleTimeString('vi-VN')} {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-black font-mono ${
                          t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.amount > 0 ? `+${t.amount.toLocaleString('vi-VN')}` : t.amount.toLocaleString('vi-VN')}đ
                      </span>
                      <span
                        className={`text-[10px] block font-semibold ${
                          t.status === 'pending'
                            ? 'text-amber-400'
                            : t.status === 'failed'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {t.status === 'pending' ? 'Đang xử lý' : t.status === 'failed' ? 'Thất bại/Hoàn tiền' : 'Thành công'}
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* TAB 4: TRẠNG THÁI CỔNG PAYOS (ADMIN ONLY) */}
          {activeTab === 'guide' && currentUser?.role === 'admin' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Zap size={18} />
                  <span>Trạng Thái Cổng PayOS Live</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Đang Hoạt Động (Active)
                </span>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">Webhook URL Máy Chủ:</span>
                    <button
                      onClick={() => copyToClipboard('https://ais-dev-bro63znmwqv774g6tfx3ta-512416293202.asia-southeast1.run.app/api/payos/webhook', 'wbUrl')}
                      className="p-1 px-2 text-amber-400 hover:text-white bg-slate-950 rounded border border-slate-800 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                    >
                      {copiedField === 'wbUrl' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedField === 'wbUrl' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-amber-300 break-all select-all">
                    https://ais-dev-bro63znmwqv774g6tfx3ta-512416293202.asia-southeast1.run.app/api/payos/webhook
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayOsWebhook}
                  disabled={webhookSyncStatus === 'syncing'}
                  className="w-full py-2.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {webhookSyncStatus === 'syncing' ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} className="text-emerald-400" />
                  )}
                  <span>Kích Hoạt & Kiểm Tra Webhook Với PayOS</span>
                </button>

                {webhookSyncMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-medium border ${
                      webhookSyncStatus === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {webhookSyncMsg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
