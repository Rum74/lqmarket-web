import { Router, Request, Response } from 'express';
import { getSellerStats } from '../services/sellerService';
import { User } from '../models/User';
import { Account } from '../models/Account';
import { Order } from '../models/Order';
import { Review } from '../models/Review';

const router = Router();

/**
 * GET /api/seller/:sellerId or /api/sellers/:sellerId
 * Public endpoint to fetch comprehensive seller profile, stats, reviews, and accounts.
 * DOES NOT require authentication.
 */
router.get('/:sellerId', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);

    if (!sellerData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ người bán'
      });
    }

    return res.json({
      success: true,
      seller: sellerData,
      user: sellerData,
      reviews: sellerData.reviews,
      accounts: sellerData.accounts,
      stats: {
        soldCount: sellerData.soldCount,
        reviewCount: sellerData.reviewCount,
        averageRating: sellerData.averageRating,
        totalSoldAmount: sellerData.totalSoldAmount,
        totalSales: sellerData.soldCount,
        completedSales: sellerData.soldCount,
        totalSold: sellerData.soldCount,
        rating: sellerData.rating,
        reviewsCount: sellerData.reviewsCount,
        activeListings: sellerData.activeListings,
        totalListings: sellerData.totalListings
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/seller/:sellerId:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tải hồ sơ người bán',
      error: error.message
    });
  }
});

/**
 * GET /api/seller/:sellerId/reviews
 * Public endpoint to fetch real reviews from MongoDB Review collection.
 */
router.get('/:sellerId/reviews', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);
    if (!sellerData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
    }
    return res.json({
      success: true,
      data: sellerData.reviews,
      reviews: sellerData.reviews,
      count: sellerData.reviewsCount,
      reviewsCount: sellerData.reviewsCount,
      rating: sellerData.rating,
      averageRating: sellerData.averageRating
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải đánh giá người bán' });
  }
});

/**
 * GET /api/seller/:sellerId/stats
 * Public endpoint for standalone seller statistics.
 */
router.get('/:sellerId/stats', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);
    if (!sellerData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
    }
    return res.json({
      success: true,
      stats: {
        totalSales: sellerData.totalSold,
        completedSales: sellerData.completedSales,
        totalSold: sellerData.totalSold,
        rating: sellerData.rating,
        averageRating: sellerData.averageRating,
        reviewsCount: sellerData.reviewsCount,
        reviewCount: sellerData.reviewCount,
        activeListings: sellerData.activeListings,
        totalListings: sellerData.totalListings
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải thống kê người bán' });
  }
});

/**
 * GET /api/seller/:sellerId/accounts or /products
 * Public endpoint to fetch approved accounts listed by this seller.
 */
router.get('/:sellerId/accounts', async (req: Request, res: Response) => {
  try {
    const { sellerId } = req.params;
    const sellerData = await getSellerStats(sellerId);
    if (!sellerData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người bán' });
    }
    return res.json({
      success: true,
      data: sellerData.accounts,
      accounts: sellerData.accounts
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi khi tải danh sách tài khoản của người bán' });
  }
});

export default router;
