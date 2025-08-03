-- 工時管理APP Supabase資料庫結構 (重構版)

-- 建立projects表格 (重構)
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  start_date DATE,
  end_date DATE,
  estimated_hours DECIMAL(8,2),
  budget DECIMAL(10,2),
  client_name TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立work_records表格 (重構)
CREATE TABLE IF NOT EXISTS work_records (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hours DECIMAL(5,2) NOT NULL CHECK (hours > 0 AND hours <= 24),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  description TEXT,
  task_type TEXT DEFAULT 'development' CHECK (task_type IN ('development', 'design', 'testing', 'meeting', 'research', 'documentation', 'maintenance', 'other')),
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立users表格 (新增)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  hourly_rate DECIMAL(8,2) DEFAULT 0,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立project_members表格 (新增)
CREATE TABLE IF NOT EXISTS project_members (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_work_records_project_id ON work_records(project_id);
CREATE INDEX IF NOT EXISTS idx_work_records_date ON work_records(date);
CREATE INDEX IF NOT EXISTS idx_work_records_created_at ON work_records(created_at);
CREATE INDEX IF NOT EXISTS idx_work_records_task_type ON work_records(task_type);
CREATE INDEX IF NOT EXISTS idx_work_records_billable ON work_records(billable);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_client_name ON projects(client_name);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 啟用Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- 建立RLS政策（允許所有操作，您可以根據需要修改）
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on work_records" ON work_records
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on project_members" ON project_members
  FOR ALL USING (true);

-- 建立統計函數 (重構)
CREATE OR REPLACE FUNCTION get_total_hours(date_filter TEXT DEFAULT '')
RETURNS TABLE(total_hours DECIMAL, billable_hours DECIMAL, non_billable_hours DECIMAL) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      COALESCE(SUM(hours), 0) as total_hours,
      COALESCE(SUM(CASE WHEN billable THEN hours ELSE 0 END), 0) as billable_hours,
      COALESCE(SUM(CASE WHEN NOT billable THEN hours ELSE 0 END), 0) as non_billable_hours
    FROM work_records 
    %s
  ', date_filter);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_project_statistics(date_filter TEXT DEFAULT '')
RETURNS TABLE(
  name TEXT, 
  total_hours DECIMAL, 
  billable_hours DECIMAL,
  record_count BIGINT,
  status TEXT,
  priority TEXT,
  progress_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      p.name,
      COALESCE(SUM(wr.hours), 0) as total_hours,
      COALESCE(SUM(CASE WHEN wr.billable THEN wr.hours ELSE 0 END), 0) as billable_hours,
      COUNT(wr.id) as record_count,
      p.status,
      p.priority,
      CASE 
        WHEN p.estimated_hours > 0 THEN 
          LEAST((COALESCE(SUM(wr.hours), 0) / p.estimated_hours) * 100, 100)
        ELSE 0 
      END as progress_percentage
    FROM projects p
    LEFT JOIN work_records wr ON p.id = wr.project_id
    %s
    GROUP BY p.id, p.name, p.status, p.priority, p.estimated_hours
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
RETURNS TABLE(
  date DATE, 
  daily_hours DECIMAL, 
  billable_hours DECIMAL,
  record_count BIGINT,
  task_types JSON
) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      date,
      COALESCE(SUM(hours), 0) as daily_hours,
      COALESCE(SUM(CASE WHEN billable THEN hours ELSE 0 END), 0) as billable_hours,
      COUNT(id) as record_count,
      json_object_agg(task_type, hours) FILTER (WHERE task_type IS NOT NULL) as task_types
    FROM work_records
    %s
    GROUP BY date
    ORDER BY date DESC
  ', date_filter);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_statistics(date_filter TEXT DEFAULT '')
RETURNS TABLE(
  user_name TEXT,
  total_hours DECIMAL,
  billable_hours DECIMAL,
  record_count BIGINT,
  projects_worked INTEGER
) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT 
      u.name as user_name,
      COALESCE(SUM(wr.hours), 0) as total_hours,
      COALESCE(SUM(CASE WHEN wr.billable THEN wr.hours ELSE 0 END), 0) as billable_hours,
      COUNT(wr.id) as record_count,
      COUNT(DISTINCT wr.project_id) as projects_worked
    FROM users u
    LEFT JOIN work_records wr ON u.id = wr.user_id
    %s
    GROUP BY u.id, u.name
    ORDER BY total_hours DESC
  ', 
  CASE 
    WHEN date_filter != '' THEN 'WHERE ' || substring(date_filter from 7)
    ELSE ''
  END
  );
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器來更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_work_records_updated_at
  BEFORE UPDATE ON work_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 插入範例資料
INSERT INTO users (email, name, role, hourly_rate, department) VALUES 
  ('admin@company.com', '系統管理員', 'admin', 0, 'IT'),
  ('manager@company.com', '專案經理', 'manager', 800, '管理部'),
  ('developer@company.com', '開發工程師', 'user', 600, '開發部'),
  ('designer@company.com', 'UI設計師', 'user', 500, '設計部')
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (name, description, status, priority, start_date, end_date, estimated_hours, budget, client_name, tags) VALUES 
  ('網站開發', '公司官網重新設計專案', 'active', 'high', '2024-01-01', '2024-03-31', 120.0, 150000, '內部專案', ARRAY['web', 'design', 'frontend']),
  ('APP開發', 'iOS和Android應用程式開發', 'active', 'medium', '2024-02-01', '2024-06-30', 200.0, 300000, '客戶A', ARRAY['mobile', 'app', 'ios', 'android']),
  ('資料分析', '客戶資料分析和報表製作', 'completed', 'low', '2024-01-15', '2024-02-15', 40.0, 50000, '客戶B', ARRAY['data', 'analysis', 'report']),
  ('系統維護', '現有系統維護和優化', 'active', 'medium', '2024-01-01', NULL, NULL, NULL, '內部專案', ARRAY['maintenance', 'optimization'])
ON CONFLICT (name) DO NOTHING;

-- 插入範例工時記錄
INSERT INTO work_records (project_id, hours, date, start_time, end_time, description, task_type, billable, hourly_rate, notes) VALUES 
  (1, 8.0, '2024-01-15', '09:00', '18:00', '首頁設計和開發', 'development', true, 600, '完成首頁基本布局'),
  (1, 6.0, '2024-01-16', '10:00', '17:00', '響應式設計調整', 'design', true, 500, '優化手機版顯示'),
  (2, 7.5, '2024-01-15', '09:30', '18:00', 'APP架構設計', 'development', true, 600, '設計APP基本架構'),
  (3, 4.0, '2024-01-15', '14:00', '18:00', '資料清理和預處理', 'research', true, 600, '清理客戶資料'),
  (4, 3.0, '2024-01-15', '16:00', '19:00', '系統性能優化', 'maintenance', false, 0, '修復系統緩慢問題')
ON CONFLICT DO NOTHING; 