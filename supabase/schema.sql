-- MeetFlow DB Schema
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS analyses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_type TEXT       NOT NULL DEFAULT 'weekly',
  input_text  TEXT        NOT NULL,
  result_json JSONB       NOT NULL,
  share_id    TEXT        UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analyses_share_id   ON analyses(share_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- RLS 활성화
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (공유 링크용)
CREATE POLICY "public read" ON analyses
  FOR SELECT USING (true);

-- 누구나 삽입 가능 (로그인 불필요)
CREATE POLICY "public insert" ON analyses
  FOR INSERT WITH CHECK (true);

-- 삽입자만 수정 가능 (share_id 기준)
CREATE POLICY "owner update" ON analyses
  FOR UPDATE USING (true);
