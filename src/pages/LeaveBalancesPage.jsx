import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users, PieChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

const LeaveBalancesPage = () => {
  const { employees, leaves } = useData();

  const leaveTypes = [
    { name: 'Casual Leave', total: 12 },
    { name: 'Sick Leave', total: 10 },
    { name: 'Annual Leave', total: 20 },
  ];

  const employeeLeaveBalances = employees.map(employee => {
    const employeeLeaves = leaves.filter(l => l.employeeId === employee.id && l.status === 'Approved');
    const balances = leaveTypes.map(type => {
      const used = employeeLeaves
        .filter(l => l.type === type.name)
        .reduce((acc, l) => acc + l.days, 0);
      return { type: type.name, used, total: type.total, remaining: type.total - used };
    });
    return { ...employee, balances };
  });

  return (
    <>
      <Helmet>
        <title>Leave Balances - ENIS-HRMS</title>
        <meta name="description" content="View and manage employee leave balances." />
      </Helmet>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white">Leave Balances</h1>
          <p className="text-gray-400">Overview of employee leave balances for the year.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Employee Leave Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      {leaveTypes.map(type => <th key={type.name}>{type.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {employeeLeaveBalances.map(employee => (
                      <tr key={employee.id}>
                        <td>{employee.name}</td>
                        {employee.balances.map(balance => (
                          <td key={balance.type}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{balance.remaining}</span>
                              <span className="text-xs text-gray-400">/ {balance.total}</span>
                            </div>
                          </td>
                        ))}
                      </tr>
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

export default LeaveBalancesPage;
