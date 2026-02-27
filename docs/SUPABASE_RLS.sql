-- GoGoHockey Supabase RLS 策略
-- 在 Supabase Dashboard → SQL Editor 中执行
-- 执行前请确认表名与字段名与当前 schema 一致
-- 本脚本可重复执行：每条 CREATE POLICY 前有 DROP POLICY IF EXISTS

-- ============================================
-- 1. 启用 RLS
-- ============================================
ALTER TABLE IF EXISTS game_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. game_invitations
-- ============================================
DROP POLICY IF EXISTS "Anyone can view open games" ON game_invitations;
CREATE POLICY "Anyone can view open games"
  ON game_invitations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create games" ON game_invitations;
CREATE POLICY "Authenticated users can create games"
  ON game_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own games" ON game_invitations;
CREATE POLICY "Users can update own games"
  ON game_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete own games" ON game_invitations;
CREATE POLICY "Users can delete own games"
  ON game_invitations FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================
-- 3. game_interests
-- ============================================
DROP POLICY IF EXISTS "Users can view own interests" ON game_interests;
CREATE POLICY "Users can view own interests"
  ON game_interests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view interests for own games" ON game_interests;
CREATE POLICY "Users can view interests for own games"
  ON game_interests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM game_invitations
      WHERE game_invitations.id = game_interests.game_id
      AND game_invitations.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create interest" ON game_interests;
CREATE POLICY "Authenticated users can create interest"
  ON game_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interests" ON game_interests;
CREATE POLICY "Users can update own interests"
  ON game_interests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interests" ON game_interests;
CREATE POLICY "Users can delete own interests"
  ON game_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. bookings
-- ============================================
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;
CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. bookings 防并发超卖 + Stripe webhook 幂等
-- ============================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'no_overlapping_bookings'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT no_overlapping_bookings
      EXCLUDE USING GIST (
        rink_id WITH =,
        tsrange(
          (booking_date::timestamp + start_time::time),
          (booking_date::timestamp + end_time::time),
          '[)'
        ) WITH &&
      )
      WHERE (status <> 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  processed_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id
  ON stripe_webhook_events(stripe_event_id);

-- ============================================
-- 6. notifications
-- ============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 7. profiles
-- ============================================
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'player';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('player', 'parent', 'club_admin', 'rink_manager', 'super_admin'))
      NOT VALID;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 8. rinks（公开只读）
-- ============================================
ALTER TABLE IF EXISTS rinks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view rinks" ON rinks;
CREATE POLICY "Anyone can view rinks"
  ON rinks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Rink managers can update own rinks" ON rinks;
CREATE POLICY "Rink managers can update own rinks"
  ON rinks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM rink_managers
      WHERE rink_id = rinks.id AND verified = true
    )
  );

-- ============================================
-- 9. payments（支付记录，需解决 UNRESTRICTED）
-- ============================================
-- 若表不存在可跳过；若字段名不同请按实际 schema 调整（如 user_id / booking_id）
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 插入通常由后端/Stripe Webhook 用 service role 完成；若前端也创建记录，可加：
-- CREATE POLICY "Users can insert own payments"
--   ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 10. rink_updates_log（冰场更新日志，需解决 UNRESTRICTED）
-- ============================================
ALTER TABLE IF EXISTS rink_updates_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view rink updates log" ON rink_updates_log;
CREATE POLICY "Authenticated can view rink updates log"
  ON rink_updates_log FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own rink update log" ON rink_updates_log;
CREATE POLICY "Users can insert own rink update log"
  ON rink_updates_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = updated_by);

-- 日志表一般不更新/删除，如需可再加策略

-- ============================================
-- 注意
-- ============================================
-- 1. 若表名或字段不同，请根据实际 schema 调整（如 payments 无 user_id 则改对应列名）
-- 2. game_invitations 的 created_by 需存在
-- 3. 执行后建议测试：未登录/登录状态下 CRUD 行为
-- 4. Service Role Key 绕过 RLS，后端写入不受限
-- 5. 执行后在 Supabase Dashboard 中确认 payments、rink_updates_log 已无 UNRESTRICTED

-- ============================================
-- 可选：bookings 表增加 Stripe 支付相关列（支付流程使用）
-- ============================================
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
