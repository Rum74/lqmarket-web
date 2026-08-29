# LQMarket Backend API (Standalone Server)

Máy chủ Backend API Node.js Express + TypeScript + MongoDB Atlas dành cho sàn giao dịch tài khoản Liên Quân Mobile (LQMarket).

---

## 🛠️ Yêu cầu môi trường
- **Node.js**: Phiên bản 18.x hoặc 20.x+
- **NPM** hoặc **Yarn** / **PNPM**
- **MongoDB Atlas Connection URI** (hoặc MongoDB server cục bộ)

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy trên VPS

### 1. Cài đặt thư viện
```bash
cd backend
npm install
```

### 2. Cấu hình biến môi trường `.env`
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
nano .env
```

Điền các thông số:
```env
PORT=5000
CLIENT_URL=https://cholienquan.com
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/cholienquan?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

# PayOS (Cổng thanh toán tự động)
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
```

### 3. Tạo tài khoản Quản trị viên (Admin)
Chạy script tạo tài khoản Admin nhanh:
```bash
npm run create-admin
```
*(Mặc định: email `admin@lqmarket.vn` | mật khẩu `admin123`)*

---

### 4. Khởi chạy máy chủ

#### Cách A: Chạy trong môi trường Development
```bash
npm run dev
```

#### Cách B: Build & Chạy Production với PM2 (Khuyên dùng trên VPS)
```bash
# Cài đặt PM2 toàn cục (nếu chưa có)
npm install -g pm2 tsx

# Chạy với PM2
pm2 start "npx tsx src/index.ts" --name "cholienquan-api"

# Lưu trạng thái để tự khởi động cùng VPS
pm2 save
pm2 startup
```

---

## 🌐 Cấu hình Nginx Reverse Proxy (cho api.cholienquan.com)

Tạo file cấu hình: `/etc/nginx/sites-available/api.cholienquan.com.conf`
```nginx
server {
    listen 80;
    server_name api.cholienquan.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Kích hoạt và cài SSL:
```bash
sudo ln -s /etc/nginx/sites-available/api.cholienquan.com.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.cholienquan.com
```

---

## 📋 Danh sách API Endpoints chính
- `GET /api/health` - Trạng thái API server
- `GET /api/health/db` - Kiểm tra kết nối MongoDB
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập JWT
- `GET /api/accounts` - Lấy danh sách acc bán
- `POST /api/orders` - Mua acc trung gian (Escrow)
- `POST /api/payments/create-payment-link` - Tạo mã nạp tiền PayOS
- `POST /api/payments/payos-webhook` - Nhận tiền tự động
- `POST /api/mystery-boxes/unbox` - Mở túi mù may mắn
- `GET /api/admin/*` - Quản trị hệ thống (Duyệt acc, nạp rút, thành viên)
