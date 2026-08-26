import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { User } from '../models/User';

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

// Helper to parse arguments like --email=admin@lqmarket.vn or --email admin@lqmarket.vn
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

    // 1. Get inputs from CLI args, env, or interactive prompt
    let name = getArg('--name') || process.env.ADMIN_NAME || '';
    let email = getArg('--email') || process.env.ADMIN_EMAIL || '';
    let username = getArg('--username') || process.env.ADMIN_USERNAME || '';
    let password = getArg('--password') || process.env.ADMIN_PASSWORD || '';
    let phone = getArg('--phone') || process.env.ADMIN_PHONE || '0909999999';

    if (!email) {
      email = await askQuestion('📧 Nhập Email Quản trị viên (VD: admin@cholienquan.com): ');
    }
    if (!username) {
      const defaultUser = email.includes('@') ? email.split('@')[0].replace(/[^a-z0-9_]/g, '') : 'admin';
      const inputUsername = await askQuestion(`👤 Nhập Tên đăng nhập (mặc định: "${defaultUser}"): `);
      username = inputUsername || defaultUser;
    }
    if (!name) {
      const inputName = await askQuestion('🏷️  Nhập Họ và Tên (mặc định: "Quản Trị Viên LQMarket"): ');
      name = inputName || 'Quản Trị Viên LQMarket';
    }
    if (!password) {
      password = await askQuestion('🔑 Nhập Mật khẩu quản trị viên (tối thiểu 6 ký tự): ');
    }

    // 2. Validate inputs
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      console.error('❌ Lỗi: Email không hợp lệ.');
      await mongoose.disconnect();
      process.exit(1);
    }

    if (!cleanUsername) {
      console.error('❌ Lỗi: Tên đăng nhập không hợp lệ.');
      await mongoose.disconnect();
      process.exit(1);
    }

    if (!password || password.length < 6) {
      console.error('❌ Lỗi: Mật khẩu phải có tối thiểu 6 ký tự.');
      await mongoose.disconnect();
      process.exit(1);
    }

    // 3. Check for existing user
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existing) {
      console.log(`⚠️ Người dùng với email "${cleanEmail}" hoặc tên "${cleanUsername}" đã tồn tại!`);
      const updateRole = await askQuestion('❓ Bạn có muốn nâng cấp tài khoản này thành ADMIN và cập nhật mật khẩu mới không? (y/n): ');
      if (updateRole.toLowerCase() === 'y' || updateRole.toLowerCase() === 'yes') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        existing.role = 'admin';
        existing.status = 'active';
        existing.isVerifiedSeller = true;
        existing.sellerTier = 'VIP';
        existing.password = hashedPassword;
        if (name) existing.name = name;
        await existing.save();
        console.log(`\n🎉 CẬP NHẬT ADMIN THÀNH CÔNG!`);
        console.log(`- Tài khoản: ${existing.username}`);
        console.log(`- Email: ${existing.email}`);
        console.log(`- Quyền hạn: Quản trị viên (admin)`);
      } else {
        console.log('⛔ Hủy thao tác tạo Admin.');
      }
      await mongoose.disconnect();
      process.exit(0);
    }

    // 4. Create new Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const adminId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newAdmin = await User.create({
      id: adminId,
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      role: 'admin',
      balance: 0,
      pendingBalance: 0,
      rating: 5.0,
      completedSales: 0,
      isVerifiedSeller: true,
      sellerTier: 'VIP',
      status: 'active',
      bio: 'Quản trị viên hệ thống sàn giao dịch LQMarket'
    });

    console.log('\n==================================================');
    console.log('🎉 TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
    console.log(`- ID: ${newAdmin.id}`);
    console.log(`- Họ tên: ${newAdmin.name}`);
    console.log(`- Username: ${newAdmin.username}`);
    console.log(`- Email: ${newAdmin.email}`);
    console.log(`- Vai trò: ${newAdmin.role}`);
    console.log('==================================================');
    console.log('💡 Bạn có thể đăng nhập vào trang Quản trị viên ngay bây giờ.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Lỗi tạo tài khoản Admin:', error.message || error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  }
}

createAdmin();
