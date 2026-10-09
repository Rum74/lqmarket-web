import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PromotionItem } from '../../types';
import { api } from '../../lib/apiClient';
import {
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Gift,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';

interface PromotionPopupModalProps {
  previewPromotion?: PromotionItem | null;
  onClosePreview?: () => void;
}

export const PromotionPopupModal: React.FC<PromotionPopupModalProps> = ({
  previewPromotion,
  onClosePreview
}) => {
  const {
    currentUser,
    isLoggedIn,
    setCurrentView,
    setIsWalletOpen,
    setIsWalletModalOpen
  } = useApp();

  const [activePromo, setActivePromo] = useState<PromotionItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  // Prevention of multiple triggers per mount / navigation
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  // If in Preview Mode: show immediately with preview data
  useEffect(() => {
    if (previewPromotion) {
      setActivePromo(previewPromotion);
      setIsOpen(true);
      setBannerError(false);
      return;
    }
  }, [previewPromotion]);

  // Normal Customer Mode: Evaluate active popup promotion
  useEffect(() => {
    if (previewPromotion) return; // Don't run auto-popup if in preview mode
    if (hasTriggeredRef.current) return;

    let isMounted = true;

    const checkAndSchedulePopup = async () => {
      try {
        // 1. Fetch qualified active promotion from backend
        const res: any = await api.get(
          `/api/promotions/active-popup?isLoggedIn=${isLoggedIn}&userId=${currentUser?.id || ''}`
        );

        if (!isMounted || !res || !res.success || !res.promotion) {
          return;
        }

        const promo: PromotionItem = res.promotion;

        // 2. Client-side storage check based on frequency and hide rules
        const storagePrefix = `lq_promo_${promo.id}`;
        const userPrefix = currentUser ? `_u_${currentUser.id}` : '_guest';

        // Check "Don't show today" / hide hours timestamp
        const dismissedUntil = localStorage.getItem(`${storagePrefix}${userPrefix}_dismissed_until`);
        if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
          return;
        }

        // Check frequency
        if (promo.popupFrequency === 'once_per_session') {
          const sessionSeen = sessionStorage.getItem(`${storagePrefix}${userPrefix}_seen`);
          if (sessionSeen) {
            return;
          }
        } else if (promo.popupFrequency === 'once_per_day') {
          const daySeen = localStorage.getItem(`${storagePrefix}${userPrefix}_day_seen`);
          const todayStr = new Date().toISOString().slice(0, 10);
          if (daySeen === todayStr) {
            return;
          }
        }

        // 3. Configure delay (between 3 and 5 seconds as specified, or configured delay)
        const delayMs = Math.max(2000, (promo.popupDelaySeconds || 3) * 1000);

        hasTriggeredRef.current = true;

        timerRef.current = setTimeout(() => {
          if (!isMounted) return;
          setActivePromo(promo);
          setIsOpen(true);

          // Record impression in backend analytics
          api.post(`/api/promotions/${promo.id}/impression`, {}).catch(() => {});

          // Mark session seen
          sessionStorage.setItem(`${storagePrefix}${userPrefix}_seen`, 'true');
        }, delayMs);
      } catch (err) {
        console.warn('[PROMO POPUP] Check notice:', err);
      }
    };

    checkAndSchedulePopup();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoggedIn, currentUser?.id, previewPromotion]);

  // Handle Close
  const handleClose = () => {
    setIsOpen(false);

    if (previewPromotion && onClosePreview) {
      onClosePreview();
      return;
    }

    if (activePromo) {
      const storagePrefix = `lq_promo_${activePromo.id}`;
      const userPrefix = currentUser ? `_u_${currentUser.id}` : '_guest';

      if (dontShowToday) {
        // Hide for 24 hours
        const until = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(`${storagePrefix}${userPrefix}_dismissed_until`, String(until));
      } else if (activePromo.hideHoursAfterClose && activePromo.hideHoursAfterClose > 0) {
        const until = Date.now() + activePromo.hideHoursAfterClose * 60 * 60 * 1000;
        localStorage.setItem(`${storagePrefix}${userPrefix}_dismissed_until`, String(until));
      }

      if (activePromo.popupFrequency === 'once_per_day') {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem(`${storagePrefix}${userPrefix}_day_seen`, todayStr);
      }
    }
  };

  // Handle CTA Click
  const handleCtaClick = () => {
    if (!activePromo) return;

    // Record click analytics
    if (!previewPromotion) {
      api.post(`/api/promotions/${activePromo.id}/click`, {}).catch(() => {});
    }

    handleClose();

    if (activePromo.ctaAction === 'open_deposit') {
      setIsWalletOpen(true);
      setIsWalletModalOpen(true);
    } else if (activePromo.ctaAction === 'copy_code') {
      if (activePromo.code) {
        navigator.clipboard?.writeText(activePromo.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      }
    } else {
      // Navigate to destination
      const targetUrl = activePromo.ctaUrl || '/';
      if (targetUrl.includes('wallet') || targetUrl.includes('nap-tien')) {
        setIsWalletOpen(true);
        setIsWalletModalOpen(true);
      } else if (targetUrl.includes('account') || targetUrl.includes('tai-khoan')) {
        setCurrentView('accounts');
      } else if (targetUrl.startsWith('http')) {
        window.open(targetUrl, '_blank');
      } else {
        setCurrentView('accounts');
      }
    }
  };

  if (!isOpen || !activePromo) return null;

  const isPreview = Boolean(previewPromotion);
  const displayBanner = bannerError || !activePromo.bannerUrl ? FALLBACK_BANNER : activePromo.bannerUrl;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#040711] border-2 border-red-600/50 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* PREVIEW BADGE IF IN ADMIN PREVIEW */}
        {isPreview && (
          <div className="bg-amber-400 text-slate-950 text-xs font-black px-4 py-1.5 flex items-center justify-between tracking-wide uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} /> Chế Độ Xem Trước Popup (Admin Live Preview)
            </span>
            <button
              onClick={handleClose}
              className="text-slate-900 hover:text-red-700 font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        )}

        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          aria-label="Đóng popup khuyến mãi"
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-red-600 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm"
        >
          <X size={18} />
        </button>

        {/* TOP BANNER WITH OVERLAY & FALLBACK */}
        <div className="relative w-full h-44 sm:h-52 bg-slate-900 overflow-hidden shrink-0">
          <img
            src={displayBanner}
            alt={activePromo.title}
            onError={() => setBannerError(true)}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-slate-950/40 to-transparent" />

          {/* FLOATING PROMO TYPE TAG */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="bg-red-600 text-white font-black text-[11px] tracking-wider uppercase px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
              <Zap size={12} className="fill-white" />
              {activePromo.type === 'deposit_bonus'
                ? 'Thưởng Nạp Ví'
                : activePromo.type === 'account_discount'
                ? 'Mã Giảm Giá'
                : 'Sự Kiện Hot'}
            </span>

            {activePromo.code && (
              <span className="bg-amber-400 text-slate-950 font-black text-[11px] font-mono px-2 py-0.5 rounded shadow">
                {activePromo.code}
              </span>
            )}
          </div>

          {/* VALUE HIGHLIGHT CALLOUT */}
          {(activePromo.bonusPercent || activePromo.discountPercent || activePromo.bonusAmount || activePromo.discountAmount) && (
            <div className="absolute bottom-3 right-3 z-10 bg-slate-950/90 border border-amber-400/40 text-amber-400 font-black text-sm px-3 py-1 rounded-xl shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
              <Gift size={15} />
              <span>
                {activePromo.bonusPercent
                  ? `+${activePromo.bonusPercent}% Thưởng`
                  : activePromo.discountPercent
                  ? `Giảm ${activePromo.discountPercent}%`
                  : activePromo.bonusAmount
                  ? `+${activePromo.bonusAmount.toLocaleString('vi-VN')}đ`
                  : `${activePromo.discountAmount?.toLocaleString('vi-VN')}đ`}
              </span>
            </div>
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TITLE & HEADLINE */}
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-tight bg-gradient-to-r from-white via-amber-200 to-amber-400 bg-clip-text text-transparent">
              {activePromo.title}
            </h3>
            {activePromo.description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                {activePromo.description}
              </p>
            )}
          </div>

          {/* CODE VOUCHER COPY BOX (IF COUPON) */}
          {activePromo.code && (
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Mã ưu đãi:</span>
                <span className="font-mono font-black text-amber-400 tracking-wider text-sm sm:text-base">
                  {activePromo.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(activePromo.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 transition-all"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 size={13} /> Đã Chép
                  </>
                ) : (
                  <>
                    <Copy size={13} /> Sao Chép
                  </>
                )}
              </button>
            </div>
          )}

          {/* HIGHLIGHT HIGHLIGHTS SPEC */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {activePromo.minDeposit ? (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Nạp tối thiểu:</span>
                <span className="font-bold text-white">
                  {activePromo.minDeposit.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ) : null}

            {activePromo.maxBonusPerTx ? (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Thưởng tối đa / GD:</span>
                <span className="font-bold text-amber-400">
                  {activePromo.maxBonusPerTx.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ) : null}

            {activePromo.minOrder ? (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Đơn tối thiểu:</span>
                <span className="font-bold text-white">
                  {activePromo.minOrder.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ) : null}

            {activePromo.maxDiscount ? (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Giảm tối đa:</span>
                <span className="font-bold text-amber-400">
                  {activePromo.maxDiscount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            ) : null}

            {activePromo.endDate && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Clock size={13} className="text-rose-400" /> Hạn áp dụng:
                </span>
                <span className="font-bold text-slate-200">
                  {new Date(activePromo.endDate).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* TERMS COLLAPSIBLE */}
          {activePromo.terms && (
            <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="w-full px-3 py-2 text-left text-xs font-bold text-slate-300 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck size={14} className="text-amber-400" />
                  Thể lệ & Điều kiện tham gia
                </span>
                {showTerms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showTerms && (
                <div className="px-3 pb-3 pt-1 text-[11px] text-slate-400 whitespace-pre-line leading-relaxed border-t border-slate-800/60">
                  {activePromo.terms}
                </div>
              )}
            </div>
          )}

          {/* CTA PRIMARY BUTTON */}
          <button
            type="button"
            onClick={handleCtaClick}
            className="w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm sm:text-base shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer uppercase tracking-wider"
          >
            <span>{activePromo.ctaText || 'Nhận Ưu Đãi Ngay'}</span>
            <ArrowRight size={18} />
          </button>

          {/* FOOTER CONTROLS */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-200">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={e => setDontShowToday(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0 cursor-pointer"
              />
              <span>Không nhắc lại trong hôm nay</span>
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
