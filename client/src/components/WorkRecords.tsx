import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface WorkRecord {
  id: number;
  project_id: number;
  project_name: string;
  hours: number;
  date: string;
  description?: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
}

const WorkRecords: React.FC = () => {
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('獲取專案失敗:', error);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProject) params.append('project_id', filterProject);
      if (filterStartDate) params.append('start_date', filterStartDate);
      if (filterEndDate) params.append('end_date', filterEndDate);

      const response = await axios.get(`/api/work-records?${params.toString()}`);
      setRecords(response.data);
    } catch (error) {
      console.error('獲取工時記錄失敗:', error);
      setMessage({ type: 'error', text: '獲取工時記錄失敗' });
    } finally {
      setLoading(false);
    }
  }, [filterProject, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchProjects();
    fetchRecords();
  }, [fetchProjects, fetchRecords]);

  const handleDeleteRecord = async (recordId: number) => {
    if (!window.confirm('確定要刪除這筆工時記錄嗎？')) {
      return;
    }

    try {
      await axios.delete(`/api/work-records/${recordId}`);
      setMessage({ type: 'success', text: '工時記錄已成功刪除！' });
      fetchRecords();
    } catch (error: any) {
      console.error('刪除工時記錄失敗:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || '刪除工時記錄失敗' 
      });
    }
  };

  const handleFilter = () => {
    fetchRecords();
  };

  const clearFilters = () => {
    setFilterProject('');
    setFilterStartDate('');
    setFilterEndDate('');
    fetchRecords();
  };

  const totalHours = records.reduce((sum, record) => sum + record.hours, 0);

  return (
    <div>
      <h2>工時記錄</h2>
      
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h3>篩選條件</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="filterProject">專案</label>
            <select
              id="filterProject"
              className="form-control"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">所有專案</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filterStartDate">開始日期</label>
            <input
              type="date"
              id="filterStartDate"
              className="form-control"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="filterEndDate">結束日期</label>
            <input
              type="date"
              id="filterEndDate"
              className="form-control"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={handleFilter}>
            篩選
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            清除篩選
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>工時記錄列表</h3>
          <div style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#007bff' }}>
            總工時: {totalHours.toFixed(1)} 小時
          </div>
        </div>

        {loading ? (
          <div>載入中...</div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            沒有找到工時記錄
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>專案</th>
                  <th>工時</th>
                  <th>描述</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>{new Date(record.date).toLocaleDateString('zh-TW')}</td>
                    <td>{record.project_name}</td>
                    <td>{record.hours} 小時</td>
                    <td>{record.description || '-'}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkRecords; 