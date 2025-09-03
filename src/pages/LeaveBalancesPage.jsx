import React ,{useState, useEffect}from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Users, PieChart, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { config } from '@/components/CustomComponents/config';

const LeaveBalancesPage = () => {
  const { employees, leaves } = useData();
  const [LeaveBalance,setLeaveBalance]=useState([])

  useEffect(()=>{
getAllLeaveBalances()
  },[])
  const leaveTypes = [
    { name: 'Casual Leave', total: 12 },
    { name: 'Sick Leave', total: 10 },
    { name: 'Annual Leave', total: 20 },
  ];
      const getAllLeaveBalances = async () => {
        try {
          let url = config.Api + "LeaveBalance/getAllLeaveBalances/";
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });
    
          if (!response.ok) {
            throw new Error('Failed to get State');
          }
    
          const result = await response.json();
          setLeaveBalance(result)
          // setState(result)
          // setFilteredData(result)
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      }

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
                      {LeaveBalance.length > 0 && LeaveBalance[0].leaveBalances.map(type => <th key={type.leaveTypeId?.LeaveTypeName}>{type.leaveTypeId?.LeaveTypeName}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {LeaveBalance.map(employee => (
                      <tr key={employee.employeeId._id}>
                        <td>{employee.employeeId.name}</td>
                        {employee.leaveBalances.map(balance => (
                          <td key={balance.leaveTypeId.LeaveTypeName}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{balance.remaining}</span>
                              <span className="text-xs text-gray-400">/ {balance.totalAllocated}</span>
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
