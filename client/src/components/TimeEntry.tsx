import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
  description?: string;
}

const TimeEntry: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | ''>('');
  const [hours, setHours] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('獲取專案失敗:', error);
      setMessage({ type: 'error', text: '獲取專案列表失敗' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !hours || !date) {
      setMessage({ type: 'error', text: '請填寫所有必填欄位' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/work-records', {
        project_id: selectedProject,
        hours: parseFloat(hours),
        date,
        description
      });

      setMessage({ type: 'success', text: '工時記錄已成功新增！' });
      setSelectedProject('');
      setHours('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    } catch (error: any) {
      console.error('新增工時記錄失敗:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || '新增工時記錄失敗' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>新增工時記錄</h2>
      
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="project">專案 *</label>
            <select
              id="project"
              className="form-control"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">請選擇專案</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hours">工時 (小時) *</label>
            <input
              type="number"
              id="hours"
              className="form-control"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              step="0.5"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">日期 *</label>
            <input
              type="date"
              id="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">工作描述</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="請描述您完成的工作內容..."
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '新增中...' : '新增工時記錄'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TimeEntry; 