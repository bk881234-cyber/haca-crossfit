-- ① profiles 테이블에 phone 컬럼 추가 (없으면)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- ② 기존 회원 profiles.phone을 auth 이메일에서 추출해서 채우기
--    (이메일 형식: 01051219285@haca.local → phone = 01051219285)
UPDATE public.profiles p
SET phone = split_part(u.email, '@', 1)
FROM auth.users u
WHERE p.id = u.id
  AND u.email LIKE '%@haca.local'
  AND (p.phone IS NULL OR p.phone = '');

-- ③ wods 테이블 RLS 정책 확보 (INSERT 포함 모든 권한)
ALTER TABLE public.wods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all" ON public.wods;
CREATE POLICY "public_all" ON public.wods FOR ALL USING (true) WITH CHECK (true);
