import { Router, Response } from 'express';
import { Conversation, IConversation, IMessage } from '../models/Conversation';
import { User } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Helper to create deterministic conversation ID between two users
function getConversationId(user1: string, user2: string): string {
  const sorted = [user1, user2].sort();
  return `conv_${sorted[0]}_${sorted[1]}`;
}

// GET /api/conversations or /api/chat (Get user conversations)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const conversations = await Conversation.find({
      participants: userId
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: conversations,
      conversations
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách hội thoại' });
  }
});

// GET /api/conversations/messages or /api/chat/messages or /api/messages (Get ALL messages for user)
router.get('/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const conversations = await Conversation.find({
      participants: userId
    }).lean();

    const allMessages: IMessage[] = [];
    for (const conv of conversations) {
      if (Array.isArray(conv.messages)) {
        allMessages.push(...conv.messages);
      }
    }

    // Sort chronologically
    allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return res.json({
      success: true,
      data: allMessages,
      messages: allMessages
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải danh sách tin nhắn' });
  }
});

// GET /api/conversations/:id/messages (Get messages for specific conversation or partner)
router.get('/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    // Find either by conversation ID or deterministic partner ID
    const deterministId = getConversationId(userId, id);
    const conversation = await Conversation.findOne({
      $or: [
        { id },
        { id: deterministId },
        { participants: { $all: [userId, id] } }
      ]
    });

    if (!conversation) {
      return res.json({ success: true, messages: [], data: [] });
    }

    // Security Check: User must be participant
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập hội thoại này.'
      });
    }

    return res.json({
      success: true,
      messages: conversation.messages || [],
      data: conversation.messages || []
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải tin nhắn' });
  }
});

// POST /api/conversations/messages or /api/chat/messages or /api/conversations/send (Send message)
const handleSendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = req.user?.userId;
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để nhắn tin.' });
    }

    const {
      recipientId,
      receiverId,
      text,
      content,
      orderId,
      senderId,
      senderName,
      senderAvatar
    } = req.body;

    const targetRecipient = recipientId || receiverId || req.params.id;
    const messageText = text || content;

    if (!targetRecipient) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin người nhận (recipientId).' });
    }

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
    }

    // Determine actual sender
    const effectiveSenderId = senderId || currentUserId;
    const senderUser = await User.findOne({ id: effectiveSenderId });
    const effectiveSenderName = senderName || senderUser?.name || 'Thành viên LQMarket';
    const effectiveSenderAvatar = senderAvatar || senderUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';

    const convId = getConversationId(currentUserId, targetRecipient);

    let conversation = await Conversation.findOne({
      $or: [
        { id: convId },
        { participants: { $all: [currentUserId, targetRecipient] } }
      ]
    });

    if (!conversation) {
      conversation = new Conversation({
        id: convId,
        participants: [currentUserId, targetRecipient],
        lastMessage: messageText.trim(),
        lastMessageAt: new Date().toISOString(),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const newMessage: IMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      senderId: effectiveSenderId,
      senderName: effectiveSenderName,
      senderAvatar: effectiveSenderAvatar,
      recipientId: targetRecipient,
      text: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = messageText.trim();
    conversation.lastMessageAt = newMessage.timestamp;
    conversation.updatedAt = new Date().toISOString();
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: newMessage,
      data: newMessage
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi gửi tin nhắn', error: error.message });
  }
};

router.post('/messages', authenticateToken, handleSendMessage);
router.post('/send', authenticateToken, handleSendMessage);
router.post('/:id/messages', authenticateToken, handleSendMessage);

export default router;
