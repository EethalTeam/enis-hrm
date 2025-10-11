import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/components/CustomComponents/apiRequest';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to format duration from hours
const formatDuration = (hours) => {
  const numericHours = parseFloat(hours) || 0;
  const h = Math.floor(numericHours);
  const m = Math.round((numericHours - h) * 60);
  return `${h}h ${m}m`;
};

const AttendanceReportsPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("Attendance/report", {
          method: 'POST',
          body: JSON.stringify({
            month: selectedMonth + 1,
            year: selectedYear,
            _id: user._id,
            role: user.role,
          }),
        });
        
        if (response && response.success && Array.isArray(response.report)) {
          setReportData(response.report);
        } else {
          setReportData([]);
        }
      } catch (error) {
        console.error("Error fetching attendance report:", error);
        setReportData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?._id) {
        fetchReportData();
    }
  }, [selectedMonth, selectedYear, user]);

  const summaryStats = useMemo(() => {
    if (!reportData || reportData.length === 0) {
      return { totalHours: 0, totalWorkingDays: 0, avgHours: 0, totalEmployees: 0 };
    }
    const totalHours = reportData.reduce((sum, emp) => sum + (emp.totalHoursWorked || 0), 0);
    const totalWorkingDays = reportData.reduce((sum, emp) => sum + (emp.totalWorkingDays || 0), 0);
    const totalAvgSum = reportData.reduce((sum, emp) => sum + parseFloat(emp.averageHoursPerDay || 0), 0);
    const avgHours = reportData.length > 0 ? totalAvgSum / reportData.length : 0;
    return { totalHours, totalWorkingDays, avgHours, totalEmployees: reportData.length };
  }, [reportData]);

  // =================== THIS IS THE NEW FUNCTION ===================
  const handleDownload = () => {
    if (reportData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = [
      "Employee Name", "Employee Code", "Days Present", "Total Work (hrs)", "Total Break (hrs)", "Avg. Daily Work (hrs)"
    ];

    const csvRows = reportData.map(row => {
      const rowData = [
        `"${row.employeeName}"`,
        row.employeeCode || 'N/A',
        row.totalWorkingDays,
        parseFloat(row.totalHoursWorked).toFixed(2),
        parseFloat(row.totalBreakHours).toFixed(2),
        parseFloat(row.averageHoursPerDay).toFixed(2)
      ];
      return rowData.join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const monthName = monthNames[selectedMonth];
    link.setAttribute("download", `Attendance Report - ${monthName} ${selectedYear}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // =================================================================

  return (
    <>
      <Helmet>
        <title>Attendance Reports - ENIS-HRMS</title>
      </Helmet>
      <div className="space-y-8">
        {/* --- Header & Controls --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Attendance Reports</h1>
            <p className="text-gray-400">Generate and view monthly attendance summaries.</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="glass-effect w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent className="glass-effect">
                {monthNames.map((month, i) => <SelectItem key={i} value={i}>{month}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="glass-effect w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent className="glass-effect">
                {[2023, 2024, 2025].map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleDownload} className="bg-gradient-to-r from-green-500 to-teal-600">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </motion.div>
        
        {/* --- Summary Cards --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Total Employees</p><h3 className="text-3xl font-bold">{summaryStats.totalEmployees}</h3></CardContent></Card>
            <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Total Work Hours</p><h3 className="text-3xl font-bold">{formatDuration(summaryStats.totalHours)}</h3></CardContent></Card>
            <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Total Present Days</p><h3 className="text-3xl font-bold">{summaryStats.totalWorkingDays}</h3></CardContent></Card>
            <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Avg. Daily Hours</p><h3 className="text-3xl font-bold">{formatDuration(summaryStats.avgHours)}</h3></CardContent></Card>
        </motion.div>

        {/* --- Main Report Table --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Monthly Report - {monthNames[selectedMonth]} {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-16 text-gray-400">Loading report data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Days Present</th>
                        <th>Total Work</th>
                        <th>Total Break</th>
                        <th>Avg. Daily Work</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.length > 0 ? reportData.map(emp => (
                        <tr key={emp.employeeId}>
                          <td>
                            <div className="font-medium text-white">{emp.employeeName}</div>
                            <div className="text-xs text-gray-400">{emp.employeeCode || 'N/A'}</div>
                          </td>
                          <td className="text-center">{emp.totalWorkingDays || 0}</td>
                          <td className="text-green-400">{formatDuration(emp.totalHoursWorked)}</td>
                          <td className="text-yellow-400">{formatDuration(emp.totalBreakHours)}</td>
                          <td className="text-blue-400">{formatDuration(emp.averageHoursPerDay)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-10 text-gray-400">No attendance data found for the selected period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AttendanceReportsPage;