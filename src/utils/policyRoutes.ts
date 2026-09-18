export type AppView = 
  | 'home'
  | 'accounts'
  | 'mystery_box'
  | 'sell'
  | 'orders'
  | 'wishlist'
  | 'admin'
  | 'guide'
  | 'seller_center'
  | 'affiliate'
  | 'blog'
  | 'referral'
  | 'quy_che_hoat_dong'
  | 'chinh_sach_bao_mat'
  | 'chinh_sach_nguoi_mua'
  | 'chinh_sach_tai_khoan_game'
  | 'giai_quyet_tranh_chap'
  | 'bao_cao_vi_pham'
  | 'so_huu_tri_tue'
  | 'thong_tin_chu_quan'
  | 'dieu_khoan_su_dung';

export const POLICY_ROUTES: Record<string, AppView> = {
  '/quy-che-hoat-dong': 'quy_che_hoat_dong',
  '/chinh-sach-bao-mat': 'chinh_sach_bao_mat',
  '/chinh-sach-nguoi-mua': 'chinh_sach_nguoi_mua',
  '/chinh-sach-tai-khoan-game': 'chinh_sach_tai_khoan_game',
  '/giai-quyet-tranh-chap': 'giai_quyet_tranh_chap',
  '/bao-cao-vi-pham': 'bao_cao_vi_pham',
  '/so-huu-tri-tue': 'so_huu_tri_tue',
  '/thong-tin-chu-quan': 'thong_tin_chu_quan',
  '/dieu-khoan-su-dung': 'dieu_khoan_su_dung',
};

export const VIEW_TO_PATH: Partial<Record<AppView, string>> = {
  quy_che_hoat_dong: '/quy-che-hoat-dong',
  chinh_sach_bao_mat: '/chinh-sach-bao-mat',
  chinh_sach_nguoi_mua: '/chinh-sach-nguoi-mua',
  chinh_sach_tai_khoan_game: '/chinh-sach-tai-khoan-game',
  giai_quyet_tranh_chap: '/giai-quyet-tranh-chap',
  bao_cao_vi_pham: '/bao-cao-vi-pham',
  so_huu_tri_tue: '/so-huu-tri-tue',
  thong_tin_chu_quan: '/thong-tin-chu-quan',
  dieu_khoan_su_dung: '/dieu-khoan-su-dung',
};

export function getViewFromPath(pathname: string): AppView | null {
  const cleanPath = pathname.replace(/\/+$/, '');
  return POLICY_ROUTES[cleanPath] || null;
}
