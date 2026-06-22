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

-- Classes (daily schedule)
create table if not exists classes (
  id text primary key,
  time text not null,
  coach text,
  max_capacity int default 15,
  created_at timestamptz default now()
);

-- Members
create table if not exists members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text,
  attendance_count int default 0,
  remaining_sessions int default 0,
  status text default 'Active',
  created_at timestamptz default now()
);

-- Reservations (class ↔ member many-to-many)
create table if not exists reservations (
  id text primary key default gen_random_uuid()::text,
  class_id text references classes(id) on delete cascade,
  member_name text not null,
  created_at timestamptz default now(),
  unique(class_id, member_name)
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

-- ── Row Level Security (auth 추가 전 임시 전체 허용) ──
alter table wods enable row level security;
alter table classes enable row level security;
alter table members enable row level security;
alter table reservations enable row level security;
alter table leaderboard enable row level security;
alter table feed_posts enable row level security;
alter table feed_comments enable row level security;
alter table feed_likes enable row level security;
alter table notices enable row level security;

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

insert into classes (id, time, coach, max_capacity) values
('class-0700', '07:00', 'David Coach', 15),
('class-0930', '09:30', 'Sarah Coach', 15),
('class-1200', '12:00', 'David Coach', 12),
('class-1830', '18:30', 'Alex Coach', 20),
('class-2000', '20:00', 'Alex Coach', 20)
on conflict (id) do nothing;

insert into members (id, name, phone, attendance_count, remaining_sessions, status) values
('m-1', '홍길동', '010-1234-5678', 24, 12, 'Active'),
('m-2', '김철수', '010-2345-6789', 8, 4, 'Active'),
('m-3', '이영희', '010-3456-7890', 6, 0, 'Inactive'),
('m-4', '박민준', '010-4567-8901', 42, 20, 'Active')
on conflict (id) do nothing;

insert into reservations (class_id, member_name) values
('class-0700', '김철수'), ('class-0700', '이영희'),
('class-0930', '박민준'), ('class-0930', '최수지'), ('class-0930', '정우성'),
('class-1830', '황정민'), ('class-1830', '한효주'), ('class-1830', '류준열'),
('class-2000', '공유'), ('class-2000', '이동욱'), ('class-2000', '김고은')
on conflict do nothing;

insert into leaderboard (id, name, type, record, rank) values
('lb-1', '박민준', 'rxd', '12:35', 1),
('lb-2', '황정민', 'rxd', '13:12', 2),
('lb-3', '김철수', 'scaled', '16:48', 3)
on conflict (id) do nothing;

insert into feed_posts (id, author, avatar, content) values
('feed-1', '홍길동',
 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
 '오늘 벤치마크 와드 완료!! 오운완 하세요!')
on conflict (id) do nothing;

insert into notices (id, title, content, is_popup, is_active) values
('notice-1', '🔥 이번 주 금요일 오픈짐 안내',
 '회원 여러분! 이번 주 금요일 저녁 8시부터는 코치 없는 자율 오픈짐으로 운영됩니다. 이용에 참고 부탁드립니다.',
 true, true)
on conflict (id) do nothing;
