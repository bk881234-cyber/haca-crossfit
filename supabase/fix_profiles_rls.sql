-- profiles 테이블에 전체 읽기 허용 (레벨 뱃지 표시용)
-- 이 앱은 소규모 헬스장이라 이름/닉네임 공개는 문제없음
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select" ON public.profiles;
CREATE POLICY "public_select" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "self_update" ON public.profiles;
CREATE POLICY "self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
