#!/usr/bin/env node
/**
 * Standalone Script: Create Admin User for LQMarket on Termius / VPS
 * Usage:
 *   node scripts/createAdmin.js
 *   node scripts/createAdmin.js --username admin --email admin@cholienquan.com --password AdminPassword123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌ [ERROR] MONGODB_URI is not defined in .env file!');
  console.error('👉 Please make sure backend/.env has: MONGODB_URI=mongodb+srv://...\n');
  process.exit(1);
}

function askQuestion(query) {
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

function getArg(flag) {
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

// Minimal User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'admin' },
    balance: { type: Number, default: 99999999 },
    pendingBalance: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    completedSales: { type: Number, default: 999 },
    isVerifiedSeller: { type: Boolean, default: true },
    sellerTier: { type: String, default: 'VIP' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  console.log('\n========================================================');
  console.log('🛡️   LQMARKET - CÔNG CỤ TẠO TÀI KHOẢN ADMIN (TERMIUS / VPS)');
  console.log('========================================================\n');

  try {
    console.log('⏳ Đang kết nối tới MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Đã kết nối cơ sở dữ liệu MongoDB Atlas thành công!\n');

    let username = getArg('--username') || '';
    let email = getArg('--email') || '';
    let password = getArg('--password') || '';
    let name = getArg('--name') || '';

    if (!username) {
      username = await askQuestion('👉 1. Nhập Tên đăng nhập (username, mặc định "admin"): ') || 'admin';
    }
    username = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (!email) {
      email = await askQuestion(`👉 2. Nhập Email (mặc định "${username}@cholienquan.com"): `) || `${username}@cholienquan.com`;
    }
    email = email.toLowerCase().trim();

    if (!name) {
      name = await askQuestion('👉 3. Nhập Họ và Tên hiển thị (mặc định "Admin LQMarket"): ') || 'Admin LQMarket';
    }

    if (!password) {
      password = await askQuestion('👉 4. Nhập Mật khẩu (tối thiểu 6 ký tự, mặc định "Admin@123456"): ') || 'Admin@123456';
    }

    if (password.length < 6) {
      console.error('\n❌ Mật khẩu phải có ít nhất 6 ký tự!');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ username }, { email }]
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      console.log(`\n⚠️ Tài khoản với username/email này đã tồn tại trong MongoDB.`);
      const confirm = await askQuestion('❓ Bạn có muốn nâng cấp tài khoản này lên ADMIN và cập nhật mật khẩu mới? (y/n): ');
      if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
        existing.role = 'admin';
        existing.password = hashedPassword;
        existing.name = name || existing.name;
        existing.isVerifiedSeller = true;
        await existing.save();
        console.log('\n🎉 [THÀNH CÔNG] Đã cập nhật tài khoản thành ADMIN!');
        console.log(`- Username: ${existing.username}`);
        console.log(`- Email:    ${existing.email}`);
        console.log(`- Role:     ${existing.role}`);
      } else {
        console.log('\n❌ Đã huỷ thao tác.');
      }
    } else {
      const newAdmin = new User({
        name,
        username,
        email,
        password: hashedPassword,
        role: 'admin',
        phone: '0909999999',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        balance: 99999999,
        isVerifiedSeller: true,
        sellerTier: 'VIP'
      });

      await newAdmin.save();

      console.log('\n========================================================');
      console.log('🎉 TẠO TÀI KHOẢN ADMIN THÀNH CÔNG VÀO MONGODB ATLAS!');
      console.log('========================================================');
      console.log(`👤 Tên hiển thị : ${newAdmin.name}`);
      console.log(`🆔 Username     : ${newAdmin.username}`);
      console.log(`📧 Email        : ${newAdmin.email}`);
      console.log(`🔑 Mật khẩu     : ${password}`);
      console.log(`👑 Quyền hạn    : admin`);
      console.log('========================================================\n');
      console.log('👉 Bây giờ bạn có thể đăng nhập trên web bằng username hoặc email này!\n');
    }
  } catch (error) {
    console.error('\n❌ Lỗi khi tạo Admin:', error.message || error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
