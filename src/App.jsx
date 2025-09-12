import React ,{useEffect} from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRouter from '@/AppRouter';
import socket from '@/socket/Socket';

function App() {
  //  useEffect(() => {
  //   const tabId = Date.now().toString();
  //   sessionStorage.setItem("tabId", tabId);

  //   const handleBeforeUnload = (e) => {
  //     // Check if this is the last tab (no other tab has the same sessionStorage)
  //     const otherTabsExist = Object.keys(sessionStorage).some(
  //       key => key !== "tabId"
  //     );

  //     if (!otherTabsExist) {
  //       // Only clear localStorage when the tab is really closing
  //       localStorage.clear();
  //       console.log("LocalStorage cleared because tab closed.");
  //     }

  //     // Optional: standard beforeunload handling
  //     e.preventDefault();
  //     e.returnValue = "";
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, []);
  window.addEventListener('load', () => {
    const entries = performance.getEntriesByType('navigation');
    const navigationType = entries.length > 0 ? entries[0].type : performance.navigation.type;
    if(navigationType !== 'reload'){
      socket.emit('tabClosing', { employeeId: user._id });
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('attendanceElapsed')
      localStorage.setItem('hrms_attendance_status',{ status: 'out', break: false })
    }
  });
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