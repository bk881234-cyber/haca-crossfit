-- ============================================================
-- HACA CrossFit — Supabase Schema
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 실행하세요
-- ============================================================

-- WODs
create table if not exists wods (
  id text primary key default gen_random_uuid()::text,
  date text not null,
  title text not null,
  type text not null default 'For Time',
  time_limit text,
  rxd text,
  scaled text,
  description text,
  created_at timestamptz default now()
);

-- Classes (weekly schedule with day_of_week)
create table if not exists classes (
  id text primary key default gen_random_uuid()::text,
  time text not null,
  class_name text default 'CrossFit',
  coach text,
  max_capacity int default 15,
  day_of_week int,  -- 0=일,1=월,2=화,3=수,4=목,5=금,6=토 / null=매일
  created_at timestamptz default now()
);

-- Members
create table if not exists members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text,
  attendance_count int default 0,
  membership_expiry date,
  status text default 'Active',
  created_at timestamptz default now()
);

-- Reservations (date-based: class + member + date unique)
create table if not exists reservations (
  id text primary key default gen_random_uuid()::text,
  class_id text references classes(id) on delete cascade,
  member_name text not null,
  reservation_date date,
  created_at timestamptz default now(),
  unique(class_id, member_name, reservation_date)
);

-- Leaderboard
create table if not exists leaderboard (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text default 'rxd',
  record text not null,
  rank int default 0,
  created_at timestamptz default now()
);

-- Feed posts
create table if not exists feed_posts (
  id text primary key default gen_random_uuid()::text,
  author text not null,
  avatar text,
  content text not null,
  image text,
  created_at timestamptz default now()
);

-- Feed comments
create table if not exists feed_comments (
  id text primary key default gen_random_uuid()::text,
  post_id text references feed_posts(id) on delete cascade,
  author text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Feed likes
create table if not exists feed_likes (
  post_id text references feed_posts(id) on delete cascade,
  member_name text not null,
  primary key (post_id, member_name)
);

-- Notices
create table if not exists notices (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  content text not null,
  is_popup boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Row Level Security ──
alter table wods enable row level security;
alter table classes enable row level security;
alter table members enable row level security;
alter table reservations enable row level security;
alter table leaderboard enable row level security;
alter table feed_posts enable row level security;
alter table feed_comments enable row level security;
alter table feed_likes enable row level security;
alter table notices enable row level security;

drop policy if exists "public_all" on wods;
drop policy if exists "public_all" on classes;
drop policy if exists "public_all" on members;
drop policy if exists "public_all" on reservations;
drop policy if exists "public_all" on leaderboard;
drop policy if exists "public_all" on feed_posts;
drop policy if exists "public_all" on feed_comments;
drop policy if exists "public_all" on feed_likes;
drop policy if exists "public_all" on notices;

create policy "public_all" on wods for all using (true) with check (true);
create policy "public_all" on classes for all using (true) with check (true);
create policy "public_all" on members for all using (true) with check (true);
create policy "public_all" on reservations for all using (true) with check (true);
create policy "public_all" on leaderboard for all using (true) with check (true);
create policy "public_all" on feed_posts for all using (true) with check (true);
create policy "public_all" on feed_comments for all using (true) with check (true);
create policy "public_all" on feed_likes for all using (true) with check (true);
create policy "public_all" on notices for all using (true) with check (true);

-- ── 초기 데이터 시드 ──
insert into wods (id, date, title, type, time_limit, rxd, scaled, description) values
('wod-1', '2026-06-23', 'DT (Benchmark WOD)', 'For Time', '20 Min',
 '5 Rounds for time of:
12 Deadlifts (155/105 lb)
9 Hang Power Cleans (155/105 lb)
6 Push Jerks (155/105 lb)',
 '5 Rounds for time of:
12 Deadlifts (95/65 lb)
9 Hang Power Cleans (95/65 lb)
6 Push Jerks (95/65 lb)',
 '그립 강도와 어깨 근지구력을 테스트하는 유명한 벤치마크 와드입니다.')
on conflict (id) do nothing;

-- HACA 실제 시간표 (SchedulePage 기준)
insert into classes (time, class_name, coach, max_capacity, day_of_week) values
-- 월요일 (1)
('06:30', 'HYROX',           '코치', 15, 1),
('10:00', 'CrossFit',        '코치', 15, 1),
('11:30', 'HYROX',           '코치', 15, 1),
('18:30', 'CrossFit',        '코치', 15, 1),
('19:30', 'HYROX',           '코치', 15, 1),
('20:30', 'CrossFit',        '코치', 15, 1),
-- 화요일 (2)
('06:30', 'CrossFit',        '코치', 15, 2),
('10:00', 'HYROX',           '코치', 15, 2),
('11:30', 'CrossFit',        '코치', 15, 2),
('18:30', 'HYROX',           '코치', 15, 2),
('19:30', 'CrossFit',        '코치', 15, 2),
('20:30', 'HYROX',           '코치', 15, 2),
-- 수요일 (3)
('06:30', 'HYROX',           '코치', 15, 3),
('10:00', 'CrossFit',        '코치', 15, 3),
('11:30', 'HYROX',           '코치', 15, 3),
('18:30', 'CrossFit',        '코치', 15, 3),
('19:30', 'HYROX',           '코치', 15, 3),
('20:30', 'CrossFit',        '코치', 15, 3),
-- 목요일 (4)
('06:30', 'CrossFit',        '코치', 15, 4),
('10:00', 'HYROX',           '코치', 15, 4),
('11:30', 'CrossFit',        '코치', 15, 4),
('18:30', 'HYROX',           '코치', 15, 4),
('19:30', 'CrossFit',        '코치', 15, 4),
('20:30', 'HYROX',           '코치', 15, 4),
-- 금요일 (5)
('06:30', 'HYROX',           '코치', 15, 5),
('10:00', 'CrossFit',        '코치', 15, 5),
('11:30', 'HYROX',           '코치', 15, 5),
('18:30', 'CrossFit',        '코치', 15, 5),
('19:30', 'HYROX',           '코치', 15, 5),
('20:30', 'CrossFit',        '코치', 15, 5),
-- 토요일 (6)
('10:00', 'HYBRID TRAINING', '코치', 15, 6),
('11:30', 'HYBRID TRAINING', '코치', 15, 6);

insert into notices (id, title, content, is_popup, is_active) values
('notice-1', '🔥 이번 주 금요일 오픈짐 안내',
 '회원 여러분! 이번 주 금요일 저녁 8시부터는 코치 없는 자율 오픈짐으로 운영됩니다. 이용에 참고 부탁드립니다.',
 true, true)
on conflict (id) do nothing;

-- ── 관리자 설정 ──
-- 앱에서 회원가입 후 아래 쿼리 실행:
-- update profiles set role = 'admin' where phone = '01055352285';
