import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  X,
  Send,
  ShieldCheck,
  Star,
  ExternalLink,
  Bot,
  Zap,
  CheckCheck,
  Sparkles
} from 'lucide-react';

const QUICK_CHIPS = [
  'Acc này còn không shop?',
  'Acc có trắng thông tin 100% không?',
  'Shop hỗ trợ đổi pass Garena không?',
  'Có fix nhẹ giá cho học sinh không ạ?'
];

export const ChatModal: React.FC = () => {
  const {
    activeChatPartner,
    chatRecipient,
    closeChat,
    setIsChatOpen,
    isChatOpen,
    chatMessages,
    sendMessage,
    sendDirectMessage,
    currentUser,
    allUsers,
    accounts,
    openSellerProfile,
    openLoginModal,
    isLoggedIn
  } = useApp();

  const recipient = chatRecipient || activeChatPartner;
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOpen = isChatOpen && recipient !== null;

  // Real-time lookup of seller details from database
  const sellerUser = recipient ? allUsers.find(u => u.id === recipient.id) : null;
  const sellerSalesCount = sellerUser?.completedSales ?? (recipient ? accounts.filter(a => a.sellerId === recipient.id && a.status === 'sold').length : 0);
  const sellerRating = sellerUser?.rating ?? 5.0;
  const isVerified = sellerUser?.isVerifiedSeller ?? (recipient?.role === 'seller' || recipient?.id?.includes('seller'));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, recipient, isTyping]);

  if (!isOpen || !recipient) return null;

  // Filter messages between currentUser and recipient
  const conversation = chatMessages.filter(
    m =>
      (m.senderId === currentUser.id && m.recipientId === recipient.id) ||
      (m.senderId === recipient.id && m.recipientId === currentUser.id)
  );

  const handleClose = () => {
    if (closeChat) closeChat();
    if (setIsChatOpen) setIsChatOpen(false);
  };

  const handleSendText = (textToSend: string) => {
    if (!textToSend.trim()) return;
    if (!isLoggedIn || !currentUser.id) {
      openLoginModal();
      return;
    }

    sendMessage(recipient.id, textToSend.trim());
    setInputText('');

    // Trigger realistic automated Seller response if communicating with a Seller
    if (recipient.role === 'seller' || recipient.id.includes('seller')) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let reply = 'Dạ vâng! Shop đang online đây ạ. Bạn cần tư vấn thêm về acc hay cách đổi pass Garena thì cứ nhắn shop hỗ trợ ngay nhé!';
        const lower = textToSend.toLowerCase();

        if (lower.includes('còn không') || lower.includes('con khong') || lower.includes('acc này')) {
          reply = 'Dạ acc này vẫn còn và đang có sẵn trên sàn bạn nhé! Bạn bấm [MUA NGAY] là hệ thống sàn LQMarket sẽ bàn giao mật khẩu tự động sau 5 giây ngay lập tức ạ.';
        } else if (lower.includes('trắng thông tin') || lower.includes('trang thong tin') || lower.includes('bảo hành') || lower.includes('sđt') || lower.includes('email')) {
          reply = 'Dạ acc cam kết 100% trắng thông tin (chưa cài SĐT, chưa cài Email). Bạn nhận acc có thể đổi pass và liên kết bảo mật chính chủ ngay lập tức. Sàn giữ tiền bảo hiểm nên bạn hoàn toàn an tâm nhé!';
        } else if (lower.includes('đổi pass') || lower.includes('doi pass') || lower.includes('hướng dẫn')) {
          reply = 'Dạ shop hỗ trợ hướng dẫn đổi pass và bật mã xác thực 2 lớp Garena từ A-Z luôn ạ. Sau khi mua acc bạn cứ nhắn shop nếu cần hỗ trợ nhé!';
        } else if (lower.includes('fix') || lower.includes('giảm') || lower.includes('bớt') || lower.includes('giare') || lower.includes('học sinh')) {
          reply = 'Dạ giá niêm yết trên sàn là giá tốt nhất đã được giảm kịch sàn rồi bạn ơi! Nếu bạn nạp mua ngay shop sẽ hỗ trợ bảo hiểm giao dịch trọn đời nhé!';
        } else if (lower.includes('ngọc') || lower.includes('skin') || lower.includes('tướng')) {
          reply = 'Dạ bảng ngọc 90 full cấp 3 chuẩn thi đấu 100%, số lượng tướng và skin quý SSS đúng y hệt hình ảnh và mô tả trên sàn ạ!';
        }

        // Send direct message with recipient as sender and currentUser as recipient
        sendDirectMessage({
          senderId: recipient.id,
          senderName: recipient.name,
          senderAvatar: recipient.avatar,
          recipientId: currentUser.id,
          text: reply
        });
      }, 1200);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendText(inputText);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5 duration-200">
      {/* Chat Header */}
      <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="relative cursor-pointer group"
            onClick={() => {
              if (openSellerProfile) openSellerProfile(recipient.id);
            }}
            title="Bấm để xem hồ sơ shop"
          >
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500/40 group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h4
                onClick={() => {
                  if (openSellerProfile) openSellerProfile(recipient.id);
                }}
                className="text-xs sm:text-sm font-bold text-white leading-tight hover:text-amber-400 cursor-pointer flex items-center gap-1"
              >
                <span>{recipient.name}</span>
              </h4>
              {isVerified && (
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  Đã Xác Thực
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                <Star size={11} className="fill-amber-400" /> {sellerRating.toFixed(1)}
              </span>
              <span>• Đã bán: {sellerSalesCount} acc</span>
              <span className="text-emerald-400">• Đang Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (openSellerProfile) openSellerProfile(recipient.id);
            }}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Xem hồ sơ & đánh giá shop"
          >
            <span>Hồ Sơ</span>
            <ExternalLink size={12} />
          </button>

          <button
            id="close-chat-modal-btn"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
        <ShieldCheck size={14} className="shrink-0 text-amber-400" />
        <span>Giao dịch qua sàn để được Escrow giữ tiền & bảo hiểm 100%.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-900/60 text-xs">
        {conversation.length === 0 ? (
          <div className="text-center text-slate-400 py-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <p className="font-semibold text-slate-300">Trò chuyện trực tiếp với {recipient.name}</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Hỏi đáp tình trạng acc, tư vấn bảng ngọc, hướng dẫn đổi mật khẩu và bảo mật Garena.
            </p>
          </div>
        ) : (
          conversation.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium rounded-br-xs'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-1 px-1">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {isMe && <CheckCheck size={11} className="text-emerald-400" />}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <img
              src={recipient.avatar}
              alt="avatar"
              className="w-5 h-5 rounded-full object-cover"
            />
            <div className="bg-slate-800 px-3 py-1.5 rounded-2xl rounded-bl-xs border border-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-[10px] text-slate-500">Shop đang soạn...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Chips */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto">
        {QUICK_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendText(chip)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-amber-300 rounded-xl whitespace-nowrap border border-slate-800 hover:border-amber-500/30 shrink-0 transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Send Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          id="chat-input-text"
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Nhập câu hỏi cho người bán..."
          className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 placeholder-slate-500"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
