import { Router, Request, Response } from 'express';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/upload
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image, base64, file, filename } = req.body;
    const dataToUpload = image || base64 || file;

    if (!dataToUpload) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy dữ liệu hình ảnh để tải lên.'
      });
    }

    // Return the base64 or hosted data url directly
    const url = typeof dataToUpload === 'string' && (dataToUpload.startsWith('http') || dataToUpload.startsWith('data:'))
      ? dataToUpload
      : `data:image/jpeg;base64,${dataToUpload}`;

    return res.json({
      success: true,
      url,
      imageUrl: url,
      message: 'Tải ảnh lên thành công!'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tải ảnh lên: ' + error.message });
  }
});

export default router;
