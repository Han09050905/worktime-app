import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectDescription, setNewProjectDescription] = useState<string>('');
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProjectName.trim()) {
      setMessage({ type: 'error', text: '請輸入專案名稱' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/projects', {
        name: newProjectName.trim(),
        description: newProjectDescription.trim()
      });

      setMessage({ type: 'success', text: '專案已成功新增！' });
      setNewProjectName('');
      setNewProjectDescription('');
      fetchProjects();
    } catch (error: any) {
      console.error('新增專案失敗:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || '新增專案失敗' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    if (!window.confirm(`確定要刪除專案「${projectName}」嗎？`)) {
      return;
    }

    try {
      await axios.delete(`/api/projects/${projectId}`);
      setMessage({ type: 'success', text: '專案已成功刪除！' });
      fetchProjects();
    } catch (error: any) {
      console.error('刪除專案失敗:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || '刪除專案失敗' 
      });
    }
  };

  return (
    <div>
      <h2>專案管理</h2>
      
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h3>新增專案</h3>
        <form onSubmit={handleAddProject}>
          <div className="form-group">
            <label htmlFor="projectName">專案名稱 *</label>
            <input
              type="text"
              id="projectName"
              className="form-control"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="請輸入專案名稱"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectDescription">專案描述</label>
            <textarea
              id="projectDescription"
              className="form-control"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              rows={3}
              placeholder="請輸入專案描述（選填）"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '新增中...' : '新增專案'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>專案列表</h3>
        {projects.length === 0 ? (
          <p>目前沒有專案，請新增一個專案。</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>專案名稱</th>
                <th>描述</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.description || '-'}</td>
                  <td>{new Date(project.created_at).toLocaleDateString('zh-TW')}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement; 