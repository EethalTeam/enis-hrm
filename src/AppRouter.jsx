import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Layout from '@/components/Layout';
import EmployeesPage from '@/pages/EmployeesPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import DesignationsPage from '@/pages/DesignationsPage';
import AttendancePage from '@/pages/AttendancePage';
import LeavesPage from '@/pages/LeavesPage';
import LeaveBalancesPage from '@/pages/LeaveBalancesPage';
import PermissionsPage from '@/pages/PermissionsPage';
import PayrollPage from '@/pages/PayrollPage';
import ProjectsPage from '@/pages/ProjectsPage';
import TasksPage from '@/pages/TasksPage';
import TimesheetsPage from '@/pages/TimesheetsPage';
import FinancePage from '@/pages/FinancePage';
import LeadsPage from '@/pages/LeadsPage';
import TicketsPage from '@/pages/TicketsPage';
import ChatPage from '@/pages/ChatPage';
import SettingsPage from '@/pages/SettingsPage';
import ShiftsPage from '@/pages/ShiftsPage';
import PayrollSettingsPage from '@/pages/PayrollSettingsPage';
import RolesPage from '@/pages/RolesPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">Loading application...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <DataProvider>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="employees" element={<EmployeesPage />} />
                  <Route path="departments" element={<DepartmentsPage />} />
                  <Route path="designations" element={<DesignationsPage />} />
                  <Route path="attendance" element={<AttendancePage />} />
                  <Route path="leaves" element={<LeavesPage />} />
                  <Route path="leaves/balances" element={<LeaveBalancesPage />} />
                  <Route path="leaves/permissions" element={<PermissionsPage />} />
                  <Route path="payroll" element={<PayrollPage />} />
                  <Route path="payroll/settings" element={<PayrollSettingsPage />} />
                  <Route path="shifts" element={<ShiftsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="timesheets" element={<TimesheetsPage />} />
                  <Route path="finance" element={<FinancePage />} />
                  <Route path="leads" element={<LeadsPage />} />
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="settings/roles" element={<RolesPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            </DataProvider>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}