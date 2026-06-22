-- ============================================================
-- HACA CrossFit — Auth Schema
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
-- (기존 schema.sql 실행 후 실행)
-- ============================================================

-- Profiles (Supabase Auth 연동)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  email text,
  role text not null default 'member', -- 'member' | 'admin'
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "본인 프로필 조회" on profiles for select using (auth.uid() = id);
create policy "본인 프로필 수정" on profiles for update using (auth.uid() = id);
-- 관리자는 Supabase 대시보드에서 직접 role = 'admin' 으로 수정

-- 신규 가입 시 자동으로 profiles 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 첫 번째 관리자 계정 설정 방법 ──
-- 1. 앱에서 회원가입
-- 2. 아래 쿼리 실행 (이메일을 실제 이메일로 변경):
-- update profiles set role = 'admin' where email = 'bkbk881234@gmail.com';
