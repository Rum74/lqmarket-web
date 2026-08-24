import { Router, Response } from 'express';
import { Conversation, IConversation, IMessage } from '../models/Conversation';
import { User } from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/conversations
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
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

// GET /api/conversations/:id/messages
router.get('/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const conversation = await Conversation.findOne({ id });
    if (!conversation) {
      return res.json({ success: true, messages: [], data: [] });
    }

    // Security Check: User must be participant
    if (!conversation.participants.includes(userId || '')) {
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

// POST /api/conversations/:id/messages
router.post('/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const { text, recipientId, orderId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
    }

    const sender = await User.findOne({ id: userId });
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người gửi.' });
    }

    let conversation = await Conversation.findOne({ id });
    if (!conversation) {
      const participants = [userId!, recipientId || 'admin'].filter(Boolean);
      conversation = new Conversation({
        id,
        participants,
        lastMessageText: text.trim(),
        lastMessageTime: new Date().toISOString(),
        messages: []
      });
    }

    const newMessage: IMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      recipientId: recipientId || 'admin',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = newMessage.timestamp;
    conversation.updatedAt = new Date().toISOString();
    await conversation.save();

    return res.status(201).json({
      success: true,
      message: newMessage,
      data: newMessage
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi gửi tin nhắn' });
  }
});

export default router;
