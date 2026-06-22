-- ============================================================
-- HACA CrossFit — Auth Schema (전화번호 기반 회원관리)
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
-- ============================================================

-- ⚠️ 중요: 실행 전 먼저 이메일 확인 비활성화
-- Authentication > Providers > Email > "Confirm email" 토글 OFF

-- Profiles 테이블 (Supabase Auth 연동)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  nickname text,
  phone text,
  birthdate text,
  gender text,          -- 'male' | 'female'
  role text not null default 'member',  -- 'member' | 'admin'
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "본인 프로필 조회" on profiles for select using (auth.uid() = id);
create policy "본인 프로필 수정" on profiles for update using (auth.uid() = id);

-- 신규 가입 시 자동으로 profiles 생성 (raw_user_meta_data 에서 읽어옴)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, nickname, phone, birthdate, gender)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'nickname',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'birthdate',
    new.raw_user_meta_data->>'gender'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 관리자 설정 방법 ──
-- 앱에서 회원가입 후 아래 쿼리 실행 (전화번호로 조회):
-- update profiles set role = 'admin' where phone = '01012345678';
