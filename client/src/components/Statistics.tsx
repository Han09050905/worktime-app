import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
      setStatistics(response.data);
    } catch (error) {
      console.error('獲取統計資料失敗:', error);
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
    return <div>載入統計資料中...</div>;
  }

  if (!statistics) {
    return <div>請選擇日期範圍來查看統計資料</div>;
  }

  return (
    <div>
      <h2>統計分析</h2>

      <div className="card">
        <h3>日期範圍篩選</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="startDate">開始日期</label>
            <input
              type="date"
              id="startDate"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">結束日期</label>
            <input
              type="date"
              id="endDate"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>總覽</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h4>總工時</h4>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>
              {statistics.total_hours.toFixed(1)} 小時
            </div>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h4>專案數量</h4>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
              {statistics.project_statistics.length}
            </div>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <h4>記錄筆數</h4>
            <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#ffc107' }}>
              {statistics.daily_statistics.reduce((sum, day) => sum + day.record_count, 0)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3>專案工時分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.project_statistics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_hours"
              >
                {statistics.project_statistics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} 小時`, '工時']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>專案工時排行</h3>
          <table className="table">
            <thead>
              <tr>
                <th>專案</th>
                <th>工時</th>
                <th>記錄數</th>
              </tr>
            </thead>
            <tbody>
              {statistics.project_statistics.map((project, index) => (
                <tr key={index}>
                  <td>{project.name}</td>
                  <td>{project.total_hours.toFixed(1)} 小時</td>
                  <td>{project.record_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>每日工時趨勢</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={statistics.daily_statistics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value) => [`${value} 小時`, '工時']}
            />
            <Legend />
            <Bar dataKey="daily_hours" fill="#8884d8" name="每日工時" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistics; 