import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderIcon, PlusIcon, TrashIcon, CheckCircleIcon, ExclamationCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
      // 檢查回應結構，正確提取專案資料
      const projectsData = response.data.data || response.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('獲取專案失敗:', error);
      setMessage({ type: 'error', text: '獲取專案列表失敗' });
      setProjects([]); // 確保 projects 是空陣列而不是 undefined
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
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <FolderIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">專案管理</h1>
          <p className="text-gray-600">管理您的專案和任務</p>
        </div>
      </div>
      
      {/* 訊息提示 */}
      {message && (
        <div className={`rounded-lg p-4 flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* 新增專案卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <PlusIcon className="w-5 h-5 mr-2 text-primary-600" />
            新增專案
          </h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleAddProject} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  專案名稱 *
                </label>
                <input
                  type="text"
                  id="projectName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="請輸入專案名稱"
                  required
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  專案描述
                </label>
                <textarea
                  id="projectDescription"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={1}
                  placeholder="請輸入專案描述（選填）"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all duration-200 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                } text-white`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    新增中...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    新增專案
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 專案列表卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FolderIcon className="w-5 h-5 mr-2 text-primary-600" />
            專案列表
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {projects.length}
            </span>
          </h2>
        </div>
        
        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">目前沒有專案</h3>
              <p className="mt-1 text-sm text-gray-500">請新增一個專案開始使用。</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      專案名稱
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      建立時間
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map(project => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {project.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(project.created_at).toLocaleDateString('zh-TW')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          onClick={() => handleDeleteProject(project.id, project.name)}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
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
    </div>
  );
};

export default ProjectManagement; 