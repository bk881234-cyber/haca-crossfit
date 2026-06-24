-- wods 테이블에 workout1 필드 추가
ALTER TABLE public.wods 
ADD COLUMN IF NOT EXISTS workout1_title text,
ADD COLUMN IF NOT EXISTS workout1_description text;

-- members 테이블에 level 필드 추가
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Beginner';

-- workout_records 테이블 생성 (이미 있으시면 무시하셔도 됩니다)
CREATE TABLE IF NOT EXISTS public.workout_records (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_name text NOT NULL,
    member_level text NOT NULL,
    workout_type text NOT NULL,
    wod_date date NOT NULL,
    record_type text NOT NULL,
    record_value text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- record_feedback 테이블 생성 (이미 있으시면 무시하셔도 됩니다)
CREATE TABLE IF NOT EXISTS public.record_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    record_id uuid REFERENCES public.workout_records(id) ON DELETE CASCADE,
    author text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
