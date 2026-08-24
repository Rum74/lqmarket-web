-- ============================================================
-- LQMARKET - SUPABASE POSTGRESQL COMPLETE DATABASE SCHEMA
-- Generated for full migration from Cloud Firestore
-- ============================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS / PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    pending_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (pending_balance >= 0),
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    completed_sales INTEGER NOT NULL DEFAULT 0,
    is_verified_seller BOOLEAN NOT NULL DEFAULT false,
    seller_tier TEXT NOT NULL DEFAULT 'FREE' CHECK (seller_tier IN ('FREE', 'SILVER', 'GOLD', 'DIAMOND')),
    bank_name TEXT,
    bank_account TEXT,
    bank_account_name TEXT,
    wishlist_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ACCOUNTS / PRODUCTS TABLE (Liên Quân Mobile Accounts)
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(15, 2),
    rank TEXT NOT NULL,
    heroes_count INTEGER NOT NULL DEFAULT 0,
    skins_count INTEGER NOT NULL DEFAULT 0,
    server TEXT NOT NULL DEFAULT 'Mặt Trời (VN)',
    login_type TEXT NOT NULL DEFAULT 'Garena Trắng TT',
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    rare_skins TEXT[] DEFAULT ARRAY[]::TEXT[],
    badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold')),
    security_info JSONB, -- Encrypted or protected login credentials
    views INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_hot_deal BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDERS TABLE (Escrow purchase system)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_code TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    account_id TEXT NOT NULL REFERENCES public.accounts(id),
    account_title TEXT NOT NULL,
    account_price NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'escrow_hold', 'account_delivered', 'completed', 'disputed', 'refunded', 'cancelled')),
    payment_method TEXT NOT NULL,
    delivered_account JSONB,
    escrow_release_at TIMESTAMPTZ,
    dispute_reason TEXT,
    buyer_feedback JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TRANSACTIONS TABLE (Wallet & Payment history)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'seller_payout', 'fee', 'refund', 'withdraw')),
    amount NUMERIC(15, 2) NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MESSAGES / CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    receiver_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    image_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    order_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. MYSTERY BOXES TABLE
CREATE TABLE IF NOT EXISTS public.mystery_boxes (
    id TEXT PRIMARY KEY,
    tier TEXT UNIQUE NOT NULL CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'DIAMOND', 'SPECIAL')),
    name TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    original_price NUMERIC(15, 2),
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MYSTERY REWARDS TABLE
CREATE TABLE IF NOT EXISTS public.mystery_rewards (
    id TEXT PRIMARY KEY,
    box_tier_id TEXT NOT NULL REFERENCES public.mystery_boxes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    image TEXT NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC')),
    drop_weight INTEGER NOT NULL DEFAULT 10,
    account_data JSONB,
    voucher_code TEXT,
    coins_reward NUMERIC(15, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. MYSTERY HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.mystery_history (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    box_tier TEXT NOT NULL,
    reward_name TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    reward_rarity TEXT NOT NULL,
    reward_image TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. USER INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.user_inventory (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_id TEXT NOT NULL,
    reward_name TEXT NOT NULL,
    reward_type TEXT NOT NULL,
    reward_image TEXT NOT NULL,
    reward_rarity TEXT NOT NULL,
    account_credentials JSONB,
    voucher_code TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'used')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    banner_message TEXT,
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    deposit_bonus_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    contact_zalo TEXT,
    contact_facebook TEXT,
    contact_hotline TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_accounts_seller ON public.accounts(seller_id);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON public.accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON public.messages(sender_id, receiver_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all user-facing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Accounts / Products Policies
CREATE POLICY "Approved accounts readable by all" ON public.accounts
    FOR SELECT USING (status = 'approved' OR status = 'sold' OR auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own accounts" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own accounts" ON public.accounts
    FOR UPDATE USING (auth.uid() = seller_id);

-- Orders Policies
CREATE POLICY "Buyers and sellers can view their orders" ON public.orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Transactions Policies (Financial security - Read only for owner)
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Participants can view conversation messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Mystery Boxes & Rewards (Public read)
CREATE POLICY "Anyone can view active mystery boxes" ON public.mystery_boxes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view mystery rewards" ON public.mystery_rewards
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view mystery open history" ON public.mystery_history
    FOR SELECT USING (true);

-- User Inventory Policies
CREATE POLICY "Users can view own inventory" ON public.user_inventory
    FOR SELECT USING (auth.uid() = user_id);

-- Site Settings Policies
CREATE POLICY "Anyone can view site settings" ON public.site_settings
    FOR SELECT USING (true);

-- ============================================================
-- SECURE POSTGRESQL FINANCIAL & BLIND BAG RPCs
-- ============================================================

-- Secure RPC to Open Mystery Box on Server
CREATE OR REPLACE FUNCTION public.open_mystery_box_secure(
    p_user_id UUID,
    p_box_tier_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_balance NUMERIC;
    v_box_price NUMERIC;
    v_box_tier TEXT;
    v_reward RECORD;
    v_history_id TEXT;
    v_inventory_id TEXT;
    v_tx_id TEXT;
    v_user_name TEXT;
    v_user_avatar TEXT;
BEGIN
    -- 1. Check user exists and get balance
    SELECT balance, name, avatar INTO v_user_balance, v_user_name, v_user_avatar
    FROM public.profiles WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Người dùng không tồn tại';
    END IF;

    -- 2. Check mystery box price
    SELECT price, tier INTO v_box_price, v_box_tier
    FROM public.mystery_boxes WHERE id = p_box_tier_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Gói Túi Mù không tồn tại';
    END IF;

    -- 3. Check sufficient balance
    IF v_user_balance < v_box_price THEN
        RAISE EXCEPTION 'Số dư ví không đủ để mở Túi Mù';
    END IF;

    -- 4. Random weighted selection on server
    SELECT * INTO v_reward
    FROM public.mystery_rewards
    WHERE box_tier_id = p_box_tier_id
    ORDER BY (RANDOM() / drop_weight) ASC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy phần thưởng khả dụng';
    END IF;

    -- 5. Deduct balance atomically
    UPDATE public.profiles
    SET balance = balance - v_box_price
    WHERE id = p_user_id;

    -- 6. Record financial transaction
    v_tx_id := 'tx_' || floor(extract(epoch from now())) || '_' || substring(md5(random()::text) from 1 for 6);
    INSERT INTO public.transactions (id, user_id, type, amount, balance_after, status, description)
    VALUES (v_tx_id, p_user_id, 'purchase', v_box_price, v_user_balance - v_box_price, 'completed', 'Mở Túi Mù: ' || v_box_tier);

    -- 7. Add reward to inventory if applicable
    v_inventory_id := 'inv_' || floor(extract(epoch from now())) || '_' || substring(md5(random()::text) from 1 for 6);
    INSERT INTO public.user_inventory (id, user_id, reward_id, reward_name, reward_type, reward_image, reward_rarity, account_credentials, voucher_code)
    VALUES (v_inventory_id, p_user_id, v_reward.id, v_reward.name, v_reward.type, v_reward.image, v_reward.rarity, v_reward.account_data, v_reward.voucher_code);

    -- 8. Record public history
    v_history_id := 'hist_' || floor(extract(epoch from now())) || '_' || substring(md5(random()::text) from 1 for 6);
    INSERT INTO public.mystery_history (id, user_id, user_name, user_avatar, box_tier, reward_name, reward_type, reward_rarity, reward_image)
    VALUES (v_history_id, p_user_id, v_user_name, v_user_avatar, v_box_tier, v_reward.name, v_reward.type, v_reward.rarity, v_reward.image);

    -- 9. Return structured reward result
    RETURN jsonb_build_object(
        'success', true,
        'reward', row_to_json(v_reward),
        'new_balance', v_user_balance - v_box_price
    );
END;
$$;
