import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TimeEntry from './components/TimeEntry';
import ProjectManagement from './components/ProjectManagement';
import Statistics from './components/Statistics';
import WorkRecords from './components/WorkRecords';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('time-entry');

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="container">
            <h1>工時管理系統</h1>
            <nav className="nav-tabs">
              <Link 
                to="/" 
                className={`nav-tab ${activeTab === 'time-entry' ? 'active' : ''}`}
                onClick={() => setActiveTab('time-entry')}
              >
                工時記錄
              </Link>
              <Link 
                to="/projects" 
                className={`nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                專案管理
              </Link>
              <Link 
                to="/records" 
                className={`nav-tab ${activeTab === 'records' ? 'active' : ''}`}
                onClick={() => setActiveTab('records')}
              >
                記錄查看
              </Link>
              <Link 
                to="/statistics" 
                className={`nav-tab ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
              >
                統計分析
              </Link>
            </nav>
          </div>
        </header>

        <main className="container">
          <Routes>
            <Route path="/" element={<TimeEntry />} />
            <Route path="/projects" element={<ProjectManagement />} />
            <Route path="/records" element={<WorkRecords />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 