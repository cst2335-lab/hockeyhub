-- GoGoHockey Supabase RLS 策略
-- 在 Supabase Dashboard → SQL Editor 中执行
-- 执行前请确认表名与字段名与当前 schema 一致

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
-- 所有人可读（开放比赛列表）
CREATE POLICY "Anyone can view open games"
  ON game_invitations FOR SELECT
  USING (true);

-- 登录用户可创建
CREATE POLICY "Authenticated users can create games"
  ON game_invitations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- 仅创建者可更新/删除
CREATE POLICY "Users can update own games"
  ON game_invitations FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own games"
  ON game_invitations FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- ============================================
-- 3. game_interests
-- ============================================
CREATE POLICY "Users can view own interests"
  ON game_interests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

CREATE POLICY "Authenticated users can create interest"
  ON game_interests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interests"
  ON game_interests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interests"
  ON game_interests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. bookings
-- ============================================
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. notifications
-- ============================================
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 插入由 service role 或后端完成，无需 policy
-- 用户可更新（标记已读）、删除自己的通知
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. profiles
-- ============================================
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 7. rinks（公开只读）
-- ============================================
ALTER TABLE IF EXISTS rinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rinks"
  ON rinks FOR SELECT
  USING (true);

-- 修改 rinks 需 rink_manager 等角色（如有 profiles.role）
-- 此处简化：仅 service role 可写
-- CREATE POLICY "Rink managers can update rinks" ...

-- ============================================
-- 注意
-- ============================================
-- 1. 若表名或字段不同，请根据实际 schema 调整
-- 2. game_invitations 的 created_by 需存在
-- 3. 执行后建议测试：未登录/登录状态下 CRUD 行为
-- 4. Service Role Key 绕过 RLS，后端写入不受限
