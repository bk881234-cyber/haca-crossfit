-- 1. wods 테이블에 class_type 컬럼 추가
ALTER TABLE wods ADD COLUMN IF NOT EXISTS class_type text DEFAULT 'crossfit'
  CHECK (class_type IN ('crossfit', 'hyrox', 'hybrid'));

-- 2. date 단독 unique 제거 후 (date, class_type) composite unique 생성
ALTER TABLE wods DROP CONSTRAINT IF EXISTS wods_date_key;
ALTER TABLE wods ADD CONSTRAINT IF NOT EXISTS wods_date_class_type_key UNIQUE (date, class_type);

-- 3. workout_records 테이블에 class_type 컬럼 추가
ALTER TABLE workout_records ADD COLUMN IF NOT EXISTS class_type text DEFAULT 'crossfit';
