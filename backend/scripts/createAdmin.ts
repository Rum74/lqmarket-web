import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { User } from '../src/models/User';

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

function getArg(flag: string): string | null {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && args[i + 1] && !args[i + 1].startsWith('--')) {
      return args[i + 1];
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].split('=')[1];
    }
  }
  return null;
}

async function createAdmin() {
  console.log('==================================================');
  console.log('🛡️  LQMarket - Create Administrator Account CLI');
  console.log('==================================================');

  const MONGODB_URI = process.env.MONGODB_URI || '';
  if (!MONGODB_URI) {
    console.error('❌ Lỗi: MONGODB_URI chưa được thiết lập trong file .env');
    console.error('👉 Vui lòng thêm MONGODB_URI=mongodb+srv://... vào .env rồi thử lại.');
    process.exit(1);
  }

  try {
    console.log('🔄 Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Đã kết nối MongoDB Atlas thành công!\n');

    let name = getArg('--name') || process.env.ADMIN_NAME || '';
    let email = getArg('--email') || process.env.ADMIN_EMAIL || '';
    let username = getArg('--username') || process.env.ADMIN_USERNAME || '';
    let password = getArg('--password') || process.env.ADMIN_PASSWORD || '';
    let phone = getArg('--phone') || process.env.ADMIN_PHONE || '0909999999';

    if (!email) {
      email = await askQuestion('📧 Nhập Email Quản trị viên (VD: admin@cholienquan.com): ');
    }
    if (!email) {
      email = 'admin@lqmarket.vn';
      console.log(`ℹ️ Sử dụng email mặc định: ${email}`);
    }

    if (!username) {
      const suggestedUsername = email.split('@')[0];
      const ans = await askQuestion(`👤 Tên đăng nhập [mặc định: ${suggestedUsername}]: `);
      username = ans || suggestedUsername;
    }

    if (!name) {
      const ans = await askQuestion('🏷️ Họ và tên hiển thị [mặc định: Ban Quản Trị LQMarket]: ');
      name = ans || 'Ban Quản Trị LQMarket';
    }

    if (!password) {
      password = await askQuestion('🔑 Mật khẩu quản trị viên (tối thiểu 6 ký tự) [mặc định: admin123]: ');
      if (!password) {
        password = 'admin123';
      }
    }

    if (password.length < 6) {
      console.error('❌ Mật khẩu phải có tối thiểu 6 ký tự!');
      process.exit(1);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      console.log(`\n⚠️ Phát hiện tài khoản đã tồn tại: ${user.email} (${user.username})`);
      user.role = 'admin';
      user.name = name || user.name;
      user.password = hashedPassword;
      user.isVerified = true;
      user.phone = phone || user.phone;
      await user.save();
      console.log('✅ ĐÃ NÂNG CẤP TÀI KHOẢN LÊN QUYỀN ADMIN THÀNH CÔNG!');
    } else {
      user = await User.create({
        name,
        email: cleanEmail,
        username: cleanUsername,
        password: hashedPassword,
        phone,
        role: 'admin',
        balance: 10000000,
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      });
      console.log('🎉 ĐÃ TẠO TÀI KHOẢN QUẢN TRỊ VIÊN MỚI THÀNH CÔNG!');
    }

    console.log('\n==================================================');
    console.log('📌 THÔNG TIN ĐĂNG NHẬP TRANG QUẢN TRỊ (ADMIN):');
    console.log('--------------------------------------------------');
    console.log(`🌐 URL Đăng nhập: /login`);
    console.log(`👤 Tên đăng nhập: ${user.username}`);
    console.log(`📧 Email:        ${user.email}`);
    console.log(`🔑 Mật khẩu:     ${password}`);
    console.log(`🛡️ Vai trò:      ${user.role.toUpperCase()}`);
    console.log('==================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Lỗi khi tạo tài khoản Admin:', err.message || err);
    process.exit(1);
  }
}

createAdmin();
