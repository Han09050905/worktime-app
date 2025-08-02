-- 工時管理APP Supabase資料庫結構

-- 建立projects表格
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立work_records表格
CREATE TABLE IF NOT EXISTS work_records (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_work_records_project_id ON work_records(project_id);
CREATE INDEX IF NOT EXISTS idx_work_records_date ON work_records(date);
CREATE INDEX IF NOT EXISTS idx_work_records_created_at ON work_records(created_at);

-- 啟用Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;

-- 建立RLS政策（允許所有操作，您可以根據需要修改）
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on work_records" ON work_records
  FOR ALL USING (true);

-- 建立統計函數
CREATE OR REPLACE FUNCTION get_total_hours(date_filter TEXT DEFAULT '')
RETURNS TABLE(total_hours DECIMAL) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT COALESCE(SUM(hours), 0) as total_hours 
    FROM work_records 
    %s
  ', date_filter);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_project_statistics(date_filter TEXT DEFAULT '')
RETURNS TABLE(name TEXT, total_hours DECIMAL, record_count BIGINT) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      p.name,
      COALESCE(SUM(wr.hours), 0) as total_hours,
      COUNT(wr.id) as record_count
    FROM projects p
    LEFT JOIN work_records wr ON p.id = wr.project_id
    %s
    GROUP BY p.id, p.name
    ORDER BY total_hours DESC
  ', 
  CASE 
    WHEN date_filter != '' THEN 'WHERE ' || substring(date_filter from 7)
    ELSE ''
  END
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_statistics(date_filter TEXT DEFAULT '')
RETURNS TABLE(date DATE, daily_hours DECIMAL, record_count BIGINT) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      date,
      COALESCE(SUM(hours), 0) as daily_hours,
      COUNT(id) as record_count
    FROM work_records
    %s
    GROUP BY date
    ORDER BY date DESC
  ', date_filter);
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器來更新created_at
CREATE OR REPLACE FUNCTION update_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_created_at
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_created_at();

CREATE TRIGGER update_work_records_created_at
  BEFORE INSERT ON work_records
  FOR EACH ROW
  EXECUTE FUNCTION update_created_at();

-- 插入範例資料（可選）
INSERT INTO projects (name, description) VALUES 
  ('網站開發', '公司官網重新設計專案'),
  ('APP開發', 'iOS和Android應用程式開發'),
  ('資料分析', '客戶資料分析和報表製作')
ON CONFLICT (name) DO NOTHING; 