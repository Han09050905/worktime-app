import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DocumentTextIcon, FunnelIcon, TrashIcon, CalendarIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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
      // 檢查回應結構，正確提取專案資料
      const projectsData = response.data.data || response.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('獲取專案失敗:', error);
      setProjects([]); // 確保 projects 是空陣列而不是 undefined
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
      // 檢查回應結構，正確提取記錄資料
      const recordsData = response.data.data || response.data;
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (error) {
      console.error('獲取工時記錄失敗:', error);
      setMessage({ type: 'error', text: '獲取工時記錄失敗' });
      setRecords([]); // 確保 records 是空陣列而不是 undefined
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
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <DocumentTextIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工時記錄</h1>
          <p className="text-gray-600">查看和管理您的工作時間記錄</p>
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

      {/* 篩選卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="w-5 h-5 mr-2 text-primary-600" />
            篩選條件
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="filterProject" className="block text-sm font-medium text-gray-700 mb-2">
                專案
              </label>
              <select
                id="filterProject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
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

            <div>
              <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                開始日期
              </label>
              <input
                type="date"
                id="filterStartDate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                結束日期
              </label>
              <input
                type="date"
                id="filterEndDate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              onClick={handleFilter}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              篩選
            </button>
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              onClick={clearFilters}
            >
              清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* 記錄列表卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-primary-600" />
              工時記錄列表
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {records.length}
              </span>
            </h2>
            <div className="flex items-center space-x-2 text-lg font-bold text-primary-600">
              <ClockIcon className="w-5 h-5" />
              <span>總工時: {totalHours.toFixed(1)} 小時</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">載入中...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到工時記錄</h3>
              <p className="mt-1 text-sm text-gray-500">請新增一些工時記錄或調整篩選條件。</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      專案
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map(record => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(record.date).toLocaleDateString('zh-TW')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.project_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <ClockIcon className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="font-medium">{record.hours}</span>
                          <span className="text-gray-500 ml-1">小時</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {record.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          onClick={() => handleDeleteRecord(record.id)}
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

export default WorkRecords; 