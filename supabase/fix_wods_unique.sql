-- wods.date 에 UNIQUE 제약 추가 (UPSERT onConflict:'date' 동작에 필수)
ALTER TABLE public.wods ADD CONSTRAINT wods_date_unique UNIQUE (date);
