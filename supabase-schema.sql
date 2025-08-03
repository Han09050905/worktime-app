-- 工時管理APP Supabase資料庫結構 (簡化版)

-- 建立projects表格
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

-- 建立work_records表格
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

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_work_records_project_id ON work_records(project_id);
CREATE INDEX IF NOT EXISTS idx_work_records_date ON work_records(date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- 插入範例資料
INSERT INTO projects (name, description, status, priority, start_date, end_date, estimated_hours, budget, client_name, tags) VALUES 
  ('網站開發', '公司官網重新設計專案', 'active', 'high', '2024-01-01', '2024-03-31', 120.0, 150000, '內部專案', ARRAY['web', 'design', 'frontend']),
  ('APP開發', 'iOS和Android應用程式開發', 'active', 'medium', '2024-02-01', '2024-06-30', 200.0, 300000, '客戶A', ARRAY['mobile', 'app', 'ios', 'android']),
  ('資料分析', '客戶資料分析和報表製作', 'completed', 'low', '2024-01-15', '2024-02-15', 40.0, 50000, '客戶B', ARRAY['data', 'analysis', 'report'])
ON CONFLICT (name) DO NOTHING;

-- 插入範例工時記錄
INSERT INTO work_records (project_id, hours, date, start_time, end_time, description, task_type, billable, hourly_rate, notes) VALUES 
  (1, 8.0, '2024-01-15', '09:00', '18:00', '首頁設計和開發', 'development', true, 600, '完成首頁基本布局'),
  (1, 6.0, '2024-01-16', '10:00', '17:00', '響應式設計調整', 'design', true, 500, '優化手機版顯示'),
  (2, 7.5, '2024-01-15', '09:30', '18:00', 'APP架構設計', 'development', true, 600, '設計APP基本架構'),
  (3, 4.0, '2024-01-15', '14:00', '18:00', '資料清理和預處理', 'research', true, 600, '清理客戶資料')
ON CONFLICT DO NOTHING; 