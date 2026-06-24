-- ── Notifications table ──
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('new_wod', 'comment')),
  message text NOT NULL,
  recipient_name text NOT NULL,   -- displayName or 'all'
  record_id text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read notifications
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert notifications
CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow all authenticated users to update (mark as read)
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated USING (true);
