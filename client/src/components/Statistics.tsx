import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartBarIcon, CalendarIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface StatisticsData {
  total_hours: number;
  project_statistics: Array<{
    name: string;
    total_hours: number;
    record_count: number;
  }>;
  daily_statistics: Array<{
    date: string;
    daily_hours: number;
    record_count: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const Statistics: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 設定預設日期範圍為本月
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/statistics?start_date=${startDate}&end_date=${endDate}`);
      // 檢查回應結構，正確提取統計資料
      const statisticsData = response.data.data || response.data;
      
      // 處理資料結構，確保與前端期望的格式一致
      const processedData = {
        total_hours: statisticsData.summary?.total_hours || 0,
        project_statistics: statisticsData.project_statistics || [],
        daily_statistics: statisticsData.daily_statistics || []
      };
      
      setStatistics(processedData);
    } catch (error) {
      console.error('獲取統計資料失敗:', error);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchStatistics();
    }
  }, [startDate, endDate, fetchStatistics]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">載入統計資料中...</span>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">請選擇日期範圍</h3>
        <p className="mt-1 text-sm text-gray-500">來查看統計資料。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <ChartBarIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">統計分析</h1>
          <p className="text-gray-600">查看您的工作時間統計和趨勢分析</p>
        </div>
      </div>

      {/* 日期範圍篩選卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" />
            日期範圍篩選
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                開始日期
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                結束日期
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 總覽卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">總覽</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-blue-900">總工時</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {(statistics.total_hours || 0).toFixed(1)}
              </p>
              <p className="text-sm text-blue-700 mt-1">小時</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mx-auto mb-4">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-green-900">專案數量</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {statistics.project_statistics?.length || 0}
              </p>
              <p className="text-sm text-green-700 mt-1">個專案</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mx-auto mb-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-purple-900">記錄筆數</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {statistics.daily_statistics?.reduce((sum, day) => sum + (day.record_count || 0), 0) || 0}
              </p>
              <p className="text-sm text-purple-700 mt-1">筆記錄</p>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 專案工時分布 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">專案工時分布</h3>
          </div>
          
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.project_statistics || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_hours"
                >
                  {(statistics.project_statistics || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value || 0} 小時`, '工時']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 專案工時排行 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">專案工時排行</h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {(statistics.project_statistics || []).map((project, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.record_count || 0} 筆記錄</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{(project.total_hours || 0).toFixed(1)} 小時</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 每日工時趨勢 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">每日工時趨勢</h3>
        </div>
        
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statistics.daily_statistics || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value) => [`${value || 0} 小時`, '工時']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="daily_hours" fill="#3B82F6" name="每日工時" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 