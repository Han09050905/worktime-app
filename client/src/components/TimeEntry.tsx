import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClockIcon, PlusIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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
      // 檢查回應結構，正確提取專案資料
      const projectsData = response.data.data || response.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('獲取專案失敗:', error);
      setMessage({ type: 'error', text: '獲取專案列表失敗' });
      setProjects([]); // 確保 projects 是空陣列而不是 undefined
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
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <PlusIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增工時記錄</h1>
          <p className="text-gray-600">記錄您的工作時間和專案進度</p>
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

      {/* 主要表單卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-primary-600" />
            工時記錄表單
          </h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 專案選擇 */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                專案 *
              </label>
              <select
                id="project"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">請選擇專案</option>
                {projects && projects.length > 0 ? (
                  projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>載入專案中...</option>
                )}
              </select>
            </div>

            {/* 工時和日期 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
                  工時 (小時) *
                </label>
                <input
                  type="number"
                  id="hours"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="例如：8.5"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  日期 *
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 工作描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                工作描述
              </label>
              <textarea
                id="description"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="請描述您完成的工作內容..."
              />
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-end pt-4">
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
                    新增工時記錄
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 快速提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">提示</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• 工時可以輸入小數點，例如：7.5 小時</p>
              <p>• 詳細的工作描述有助於後續的專案追蹤</p>
              <p>• 系統會自動記錄新增時間</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeEntry; 