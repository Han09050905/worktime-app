import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ClockIcon, FolderIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import TimeEntry from './components/TimeEntry';
import ProjectManagement from './components/ProjectManagement';
import Statistics from './components/Statistics';
import WorkRecords from './components/WorkRecords';
import './App.css';

// 導航項目配置
const navItems = [
  { path: '/', label: '工時記錄', icon: ClockIcon, key: 'time-entry' },
  { path: '/projects', label: '專案管理', icon: FolderIcon, key: 'projects' },
  { path: '/records', label: '記錄查看', icon: DocumentTextIcon, key: 'records' },
  { path: '/statistics', label: '統計分析', icon: ChartBarIcon, key: 'statistics' },
];

// 導航元件
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="flex space-x-1 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5 mr-2" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* 頂部導航欄 */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="ml-3 text-xl font-bold text-gray-900">
                      工時管理系統
                    </h1>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">歡迎使用</span>
                </div>
              </div>
            </div>
            
            <Navigation />
          </div>
        </header>

        {/* 主要內容區域 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<TimeEntry />} />
              <Route path="/projects" element={<ProjectManagement />} />
              <Route path="/records" element={<WorkRecords />} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </div>
        </main>

        {/* 頁腳 */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              <p>© 2024 工時管理系統. 讓工作時間管理變得簡單高效.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 