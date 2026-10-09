import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

export interface MediaLibraryItem {
  id: string;
  title: string;
  category: 'banner' | 'deposit' | 'sale' | 'event' | 'uploaded';
  url: string;
  thumbnailUrl?: string;
  recommendedTag?: string;
  uploadedAt: string;
}

// Curated high-resolution gaming & promotional banners for LQMarket
const PRESET_BANNER_LIBRARY: MediaLibraryItem[] = [
  {
    id: 'banner_vietqr_deposit',
    title: 'Đại Tiệc Nạp Ví VietQR (Thần Thoại Vàng Kim)',
    category: 'deposit',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Thưởng nạp ví',
    uploadedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'banner_vip_sale_red',
    title: 'Siêu Sale Acc VIP SSS (Đỏ Lửa Chiến Binh)',
    category: 'sale',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Mã giảm giá mua acc',
    uploadedAt: '2026-01-02T00:00:00.000Z'
  },
  {
    id: 'banner_lucky_mystery',
    title: 'Vòng Quay May Mắn / Hộp Bí Ẩn (Huyền Bí Tím Tinh Vân)',
    category: 'event',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Sự kiện may mắn',
    uploadedAt: '2026-01-03T00:00:00.000Z'
  },
  {
    id: 'banner_gold_weekend',
    title: 'Mã Giảm Giá Cuối Tuần (Hoàng Kim Ánh Kim)',
    category: 'sale',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Khuyến mãi cuối tuần',
    uploadedAt: '2026-01-04T00:00:00.000Z'
  },
  {
    id: 'banner_cyber_welcome',
    title: 'Chào Mừng Tân Thủ / Thành Viên Mới (Xanh Lôi Đình Cyber)',
    category: 'event',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Thành viên mới',
    uploadedAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'banner_dark_champion',
    title: 'Tướng Mới Ra Mắt - Skin Hạn Giờ (Chiến Thần Đỏ Đen)',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Thông báo sự kiện',
    uploadedAt: '2026-01-06T00:00:00.000Z'
  },
  {
    id: 'banner_neon_flash_sale',
    title: 'Flash Sale Giờ Vàng LQMarket (Neon Cyberpunk)',
    category: 'sale',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Flash Sale',
    uploadedAt: '2026-01-07T00:00:00.000Z'
  },
  {
    id: 'banner_arena_battle',
    title: 'Đấu Trường Đỉnh Cao (Liên Quân Huyền Thoại)',
    category: 'banner',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    recommendedTag: 'Sự kiện giải đấu',
    uploadedAt: '2026-01-08T00:00:00.000Z'
  }
];

// In-memory store for recently uploaded banners
const uploadedMediaItems: MediaLibraryItem[] = [];

/**
 * GET /api/upload/library
 * Fetch available media items for banner selector
 */
router.get('/library', optionalAuth, (req: Request, res: Response) => {
  const allItems = [...uploadedMediaItems, ...PRESET_BANNER_LIBRARY];
  return res.json({
    success: true,
    items: allItems,
    total: allItems.length
  });
});

/**
 * POST /api/upload
 * Secure image upload with size limit, mime verification, and media library registration
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image, base64, filename, title, category } = req.body;
    const dataToUpload = image || base64;

    if (!dataToUpload || typeof dataToUpload !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy dữ liệu hình ảnh hợp lệ để tải lên.'
      });
    }

    // Security check: Block oversized payloads (> 5MB)
    if (dataToUpload.length > 5 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: 'Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 5MB). Vui lòng chọn ảnh nhỏ hơn.'
      });
    }

    // Security check: Verify image header or URL structure
    const isHttpUrl = dataToUpload.startsWith('http://') || dataToUpload.startsWith('https://');
    const isDataImage = dataToUpload.startsWith('data:image/');

    if (!isHttpUrl && !isDataImage && !dataToUpload.startsWith('/')) {
      // Must be raw base64 or valid image string
      const sanitizedBase64 = dataToUpload.replace(/\s/g, '');
      if (!sanitizedBase64.match(/^[A-Za-z0-9+/=]+$/)) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng hình ảnh không an toàn hoặc không hợp lệ.'
        });
      }
    }

    // Standardize URL
    const url = isHttpUrl || isDataImage
      ? dataToUpload
      : `data:image/jpeg;base64,${dataToUpload}`;

    // Register into media library for reuse in promotions
    const cleanTitle = (title || filename || 'Banner tải lên').slice(0, 80);
    const newItem: MediaLibraryItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: cleanTitle,
      category: category === 'banner' || category === 'sale' || category === 'deposit' ? category : 'uploaded',
      url,
      thumbnailUrl: url,
      recommendedTag: 'Đã tải lên',
      uploadedAt: new Date().toISOString()
    };

    // Keep up to 50 recent uploaded items
    uploadedMediaItems.unshift(newItem);
    if (uploadedMediaItems.length > 50) {
      uploadedMediaItems.pop();
    }

    return res.json({
      success: true,
      url,
      imageUrl: url,
      mediaItem: newItem,
      message: 'Tải ảnh lên thành công!'
    });
  } catch (error: any) {
    console.error('[UPLOAD] Error handling image upload:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải ảnh lên: ' + (error?.message || 'Không xác định') });
  }
});

export default router;
