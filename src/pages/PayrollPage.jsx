import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { IndianRupee, Calendar, Users, TrendingUp, Download, Play, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import jsPDF from 'jspdf';

const PayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const { employees, shifts, earnings, deductions } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [processedPayroll, setProcessedPayroll] = useState([]);

  const payrollData = useMemo(() => {
    if (processedPayroll.length > 0) return processedPayroll;

    return employees.map(employee => {
      const shift = shifts.find(s => s.id === employee.shiftId);
      const baseSalary = employee.salary / 12; // Monthly base

      const totalEarnings = earnings.reduce((acc, earn) => {
        let amount = 0;
        if (earn.type === 'percentage') {
          amount = baseSalary * (earn.value / 100);
        } else {
          amount = earn.value;
        }
        return acc + amount;
      }, 0);

      const totalDeductions = deductions.reduce((acc, deduct) => {
        let amount = 0;
        if (deduct.type === 'percentage') {
          amount = totalEarnings * (deduct.value / 100);
        } else {
          amount = deduct.value;
        }
        return acc + amount;
      }, 0);

      const netSalary = totalEarnings - totalDeductions;

      return {
        id: employee.id,
        employee: employee.name,
        avatar: employee.avatar,
        designation: employee.designation,
        shift: shift ? shift.name : 'N/A',
        grossSalary: totalEarnings,
        deductions: totalDeductions,
        netSalary,
        status: 'Pending'
      };
    });
  }, [employees, shifts, earnings, deductions, processedPayroll]);

  const payrollStats = useMemo(() => {
    const totalPayroll = payrollData.reduce((acc, curr) => acc + curr.netSalary, 0);
    const employeesPaid = payrollData.filter(p => p.status === 'Paid').length;
    const pendingPayments = payrollData.filter(p => p.status === 'Pending').length;
    const avgSalary = payrollData.length > 0 ? totalPayroll / payrollData.length : 0;

    return [
      {
        title: 'Total Net Payroll',
        value: `$${(totalPayroll / 1000).toFixed(1)}K`,
        change: '+3.2%',
        color: 'from-green-500 to-emerald-500',
        icon: IndianRupee
      },
      {
        title: 'Employees Paid',
        value: employeesPaid,
        change: `${payrollData.length} total`,
        color: 'from-blue-500 to-cyan-500',
        icon: Users
      },
      {
        title: 'Pending Payments',
        value: pendingPayments,
        change: 'Ready to process',
        color: 'from-yellow-500 to-orange-500',
        icon: Calendar
      },
      {
        title: 'Avg. Net Salary',
        value: `$${(avgSalary / 1000).toFixed(1)}K`,
        change: '+2.1%',
        color: 'from-purple-500 to-pink-500',
        icon: TrendingUp
      }
    ];
  }, [payrollData]);

  const handleProcessPayroll = () => {
    setProcessing(true);
    toast({
      title: "Processing Payroll...",
      description: "Calculating salaries and generating records.",
    });
    setTimeout(() => {
      const processedData = payrollData.map(p => ({ ...p, status: 'Paid' }));
      setProcessedPayroll(processedData);
      setProcessing(false);
      toast({
        title: "Payroll Processed Successfully!",
        description: "All employee salaries for the selected month have been processed.",
        variant: "default",
        className: "bg-green-500 text-white"
      });
    }, 2000);
  };

  const generatePayslip = (record) => {
    const doc = new jsPDF();
    const monthYear = new Date(selectedMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    doc.setFontSize(22);
    doc.text('Payslip', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`For ${monthYear}`, 105, 28, { align: 'center' });

    doc.setFontSize(14);
    doc.text('ENIS-HRMS', 20, 40);
    doc.setFontSize(10);
    doc.text('123 Corporate Ave, Business City', 20, 46);

    doc.setFontSize(12);
    doc.text(`Employee: ${record.employee}`, 20, 60);
    doc.text(`Designation: ${record.designation}`, 20, 66);
    doc.text(`Payslip ID: PAY-${record.id.slice(4)}-${selectedMonth.replace('-', '')}`, 20, 72);

    let y = 90;
    doc.setFontSize(14);
    doc.text('Earnings', 20, y);
    doc.text('Amount', 100, y);
    y += 8;
    doc.setLineWidth(0.5);
    doc.line(20, y-4, 190, y-4);
    
    doc.setFontSize(12);
    
    const employeeDetails = employees.find(e => e.id === record.id);
    const baseSalary = employeeDetails.salary / 12;
    earnings.forEach(earn => {
      const amount = earn.type === 'percentage' ? baseSalary * (earn.value / 100) : earn.value;
      doc.text(earn.name, 20, y);
      doc.text(`$${amount.toFixed(2)}`, 100, y);
      y+= 7;
    });

    y += 5;
    doc.setFontSize(14);
    doc.text('Deductions', 20, y);
    doc.text('Amount', 100, y);
    y += 8;
    doc.setLineWidth(0.5);
    doc.line(20, y-4, 190, y-4);
    
    doc.setFontSize(12);
    deductions.forEach(deduct => {
      const amount = deduct.type === 'percentage' ? record.grossSalary * (deduct.value / 100) : deduct.value;
      doc.text(deduct.name, 20, y);
      doc.text(`$${amount.toFixed(2)}`, 100, y);
      y+= 7;
    });

    y += 5;
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 7;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Gross Salary:', 20, y);
    doc.text(`$${record.grossSalary.toFixed(2)}`, 100, y);
    y += 7;
    doc.text('Total Deductions:', 20, y);
    doc.text(`$${record.deductions.toFixed(2)}`, 100, y);
    y += 10;
    
    doc.setFontSize(16);
    doc.text('Net Salary:', 20, y);
    doc.text(`$${record.netSalary.toFixed(2)}`, 100, y);
    
    doc.save(`Payslip-${record.employee.replace(' ', '_')}-${selectedMonth}.pdf`);

    toast({
      title: "Payslip Generated",
      description: `Downloading payslip for ${record.employee}.`,
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "🚧 Feature Coming Soon!",
      description: "A comprehensive payroll report isn't implemented yet—but individual payslips work! 🚀",
    });
  };

  return (
    <>
      <Helmet>
        <title>Payroll Management - ENIS-HRMS</title>
        <meta name="description" content="Comprehensive payroll management system with automated calculations, tax compliance, and detailed reporting capabilities." />
        <meta property="og:title" content="Payroll Management - ENIS-HRMS" />
        <meta property="og:description" content="Streamline payroll processing with automated calculations, compliance management, and comprehensive financial reporting." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payroll Management</h1>
            <p className="text-gray-400">Manage employee compensation based on defined payroll masters</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleProcessPayroll}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={processing || payrollData.every(p => p.status === 'Paid')}
            >
              <Play className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : payrollData.every(p => p.status === 'Paid') ? 'Payroll Paid' : 'Process Payroll'}
            </Button>
            <Button 
              onClick={() => navigate('/payroll/settings')}
              variant="outline" 
              className="border-white/10 hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Payroll Period</h3>
                    <p className="text-gray-400">Select month to view payroll details</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setProcessedPayroll([]); // Reset on month change
                    }}
                    className="px-4 py-2 glass-effect border border-white/10 rounded-md text-white bg-transparent"
                  />
                  <Button onClick={handleDownloadReport} variant="outline" className="border-white/10 hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {payrollStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="metric-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {stat.change}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Master-Based Payroll Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Employee compensation for {new Date(selectedMonth + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Gross Salary</th>
                      <th>Deductions</th>
                      <th>Net Salary</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <img src={record.avatar} alt={record.employee} className="w-8 h-8 rounded-full object-cover" />
                            <div>
                              <span className="font-medium text-white">{record.employee}</span>
                              <p className="text-xs text-gray-400">{record.designation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-green-400">${record.grossSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="text-red-400">${record.deductions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="text-white font-semibold">${record.netSalary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td>
                          <span className={`status-badge ${
                            record.status === 'Paid' ? 'status-active' : 'status-pending'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            onClick={() => generatePayslip(record)}
                            variant="outline"
                            className="border-white/10 hover:bg-white/10"
                            disabled={record.status !== 'Paid'}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Payslip
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default PayrollPage;