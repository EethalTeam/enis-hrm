import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const TimesheetEntries = ({ entries }) => {
  return (
    <Card className="glass-effect border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Timesheet Entries</CardTitle>
        <CardDescription className="text-gray-400">
          Your logged hours for this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Task</th>
                <th>Hours</th>
                <th>Billable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="text-gray-300">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="text-white font-medium">{entry.project}</td>
                  <td className="text-gray-300">{entry.task}</td>
                  <td className="text-white font-semibold">{entry.hours}h</td>
                  <td>
                    <span className={`status-badge ${entry.billable ? 'status-active' : 'status-inactive'}`}>
                      {entry.billable ? 'Billable' : 'Non-billable'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      entry.status === 'Approved' ? 'status-active' : 'status-pending'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimesheetEntries;