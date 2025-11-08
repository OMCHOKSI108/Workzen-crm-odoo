import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeProfile from './pages/EmployeeProfile';
import Attendance from './pages/Attendance';
import LeaveRequest from './pages/LeaveRequest';
import PayrollSimulator from './pages/PayrollSimulator';
import Payslip from './pages/Payslip';
import Profile from './pages/Profile';
import Employees from './pages/Employees';
import PayrollConfig from './pages/PayrollConfig';
import Settings from './pages/Settings';
import SignUp from './pages/SignUp';
import Reports from './pages/Reports';
import './App.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-shell">
      <Sidebar className={sidebarOpen ? 'sidebar-open' : ''} />
      <div className="main-content">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <Layout><EmployeeList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employee/:id" element={
            <ProtectedRoute>
              <Layout><EmployeeProfile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute>
              <Layout><Attendance /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/leaves" element={
            <ProtectedRoute>
              <Layout><LeaveRequest /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/payroll" element={
            <ProtectedRoute roles={['admin', 'payroll']}>
              <Layout><PayrollSimulator /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/payslip" element={
            <ProtectedRoute>
              <Layout><Payslip /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/employees-list" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <Layout><Employees /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/payroll-config" element={
            <ProtectedRoute roles={['admin', 'payroll']}>
              <Layout><PayrollConfig /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute roles={['admin']}>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute roles={['admin', 'hr', 'payroll']}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
