import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/AppRouter';

function App() {
  return (
    <>
      <Helmet>
        <title>ENIS HRMS - Complete HR Management Solution</title>
        <meta name="description" content="Comprehensive HR Management System with employee management, payroll, attendance tracking, project management, and advanced analytics." />
        <meta property="og:title" content="ENIS-HRMS - Complete HR Management Solution" />
        <meta property="og:description" content="Streamline your HR processes with our enterprise-grade HRMS featuring advanced analytics, automated workflows, and comprehensive employee management." />
      </Helmet>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <AppRouter />
          <Toaster />
        </div>
      </AuthProvider>
    </>
  );
}

export default App;