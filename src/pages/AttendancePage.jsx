import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Clock, User, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/components/CustomComponents/apiRequest';
import { useAuth } from '@/contexts/AuthContext';

// Helper function to handle timezone conversions
const istTimeZone = 'Asia/Kolkata';

const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: istTimeZone }) : '--:--';

const formatDuration = (hours) => {
  const h = Math.floor(hours || 0);
  const m = Math.floor(((hours || 0) - h) * 60);
  return `${h}h ${m}m`;
};

// Helper function to calculate total hours from sessions
const calculateTotalHours = (sessions) => {
  if (!sessions || !Array.isArray(sessions)) return 0;
  return sessions.reduce((total, session) => total + (session.workedHours || 0), 0);
};

// Helper function to calculate total break hours from sessions
const calculateTotalBreakHours = (sessions) => {
  if (!sessions || !Array.isArray(sessions)) return 0;
  return sessions.reduce((total, session) => total + (session.totalBreakHours || 0), 0);
};

// Helper function to process attendance record and ensure calculated fields exist
const processAttendanceRecord = (record) => {
  const totalWorkedHours = record.totalWorkedHours ?? calculateTotalHours(record.sessions);
  const totalBreakHours = record.totalBreakHours ?? calculateTotalBreakHours(record.sessions);
  
  return {
    ...record,
    totalWorkedHours,
    totalBreakHours,
  };
};

// ===================================================================================
// ATTENDANCE DETAIL DIALOG COMPONENT
// ===================================================================================
const AttendanceDetailDialog = ({ open, setOpen, employee, attendanceRecords }) => {
    const [hoveredDay, setHoveredDay] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  
    const getAttendanceForDate = (day) => {
      const dayDateIST = new Date(selectedYear, selectedMonth, day).toLocaleDateString('en-IN', { timeZone: istTimeZone });
      return attendanceRecords.find((record) => {
        const recordDateIST = new Date(record.date).toLocaleDateString('en-IN', { timeZone: istTimeZone });
        return recordDateIST === dayDateIST;
      });
    };
  
    const getStatusColor = (attendance) => {
      if (!attendance || !attendance.sessions.length) return 'bg-gray-600';
      const hasActiveSession = attendance.sessions.some((s) => !s.checkOut);
      const totalHours = attendance.totalWorkedHours || 0;
      if (hasActiveSession) return 'bg-yellow-500';
      if (totalHours >= 8) return 'bg-green-500';
      if (totalHours > 0) return 'bg-orange-500';
      return 'bg-red-500';
    };
  
    const SessionLog = ({ session, index }) => (
      <div className="bg-slate-700/50 rounded-lg p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white">Session {index + 1}</span>
          <span className="text-xs text-gray-400">{formatDuration(session.workedHours)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Check In:</span>
            <div className="text-white font-medium">{formatTime(session.checkIn)}</div>
          </div>
          <div>
            <span className="text-gray-400">Check Out:</span>
            <div className="text-white font-medium">{formatTime(session.checkOut)}</div>
          </div>
        </div>
        {session.breaks && session.breaks.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-gray-400">Breaks:</span>
            {session.breaks.map((b, i) => (
              <div key={i} className="flex justify-between text-xs bg-slate-600/50 rounded p-2">
                <span className="text-gray-300">{formatTime(b.breakStart)} - {formatTime(b.breakEnd)}</span>
                <span className="text-yellow-400">{formatDuration(b.breakDuration)}</span>
              </div>
            ))}
            <div className="text-xs text-right text-yellow-400">Total Break: {formatDuration(session.totalBreakHours)}</div>
          </div>
        )}
      </div>
    );
  
    const days = getDaysInMonth(selectedMonth, selectedYear);
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-effect border-white/10 text-white max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              Attendance Log - {employee?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">{employee?.department} • Click on any day to see detailed session information</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-6 h-[70vh] md:h-auto overflow-y-auto">
            <div className="flex-1 space-y-4">
              <div className="flex gap-4">
                <Select value={selectedMonth} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="glass-effect border-white/10 w-48"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {monthNames.map((month, i) => <SelectItem key={i} value={i} className="hover:bg-white/10">{month}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="glass-effect border-white/10 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-effect border-white/10 text-white">
                    {[2023,2024,2025].map((year)=> <SelectItem key={year} value={year} className="hover:bg-white/10">{year}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => ( <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">{day}</div> ))}
                {Array.from({ length: days }, (_, i) => i + 1).map(day => {
                  const attendance = getAttendanceForDate(day);
                  const todayIST = new Date().toLocaleDateString('en-IN', { timeZone: istTimeZone });
                  const isToday = new Date(selectedYear, selectedMonth, day).toLocaleDateString('en-IN', { timeZone: istTimeZone }) === todayIST;
                  return (
                    <motion.div key={day} className={`p-3 rounded-lg cursor-pointer relative ${isToday ? 'ring-2 ring-blue-500' : ''}`} whileHover={{ scale: 1.05 }} onClick={() => setHoveredDay(attendance ? { day, attendance } : null)} >
                      <div className={`w-full h-8 rounded flex items-center justify-center text-sm font-medium ${attendance ? getStatusColor(attendance) : 'bg-slate-700'} ${isToday ? 'ring-1 ring-white/50' : ''}`}> {day} </div>
                      {attendance && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="w-96 space-y-4">
              <AnimatePresence mode="wait">
                {hoveredDay ? (
                  <motion.div key={hoveredDay.day} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="glass-effect border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-white">{monthNames[selectedMonth]} {hoveredDay.day}, {selectedYear}</CardTitle>
                        <div className="flex justify-between text-sm"> <span className="text-gray-400">Total Hours:</span> <span className="text-green-400 font-medium">{formatDuration(hoveredDay.attendance.totalWorkedHours)}</span> </div>
                        <div className="flex justify-between text-sm"> <span className="text-gray-400">Break Time:</span> <span className="text-yellow-400 font-medium">{formatDuration(hoveredDay.attendance.totalBreakHours)}</span> </div>
                      </CardHeader>
                      <CardContent className="space-y-3 overflow-y-auto">
                        {hoveredDay.attendance.sessions.map((s,i)=> <SessionLog key={i} session={s} index={i} />)}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center"> <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" /> <p>Click on a day to see session details</p> </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
};

// ===================================================================================
// MAIN ATTENDANCE PAGE COMPONENT (MAIN FIXES HERE)
// ===================================================================================
const AttendancePage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { getAllEmployees(); }, []);
  useEffect(() => { if (employees.length > 0) getAttendanceForDate(); }, [selectedDate, employees]);

  const getAllEmployees = async () => {
    try { 
      setIsLoading(true); 
      const response = await apiRequest("Employee/getAllEmployees/", { 
        method: 'POST', 
        body: JSON.stringify({ _id: user._id, role: user.role }) 
      }); 
      if (response && Array.isArray(response)) {
        setEmployees(response);
      } else {
        setEmployees([]);
      }
    } catch (e) { 
      setEmployees([]); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const getAttendanceForDate = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("Attendance/getAllAttendanceByDate/", {
        method: 'POST',
        body: JSON.stringify({ date: selectedDate, _id: user._id, role: user.role }),
      });
      
      if (response && response.success && response.attendance) {
        
        // Process all attendance records to ensure calculated fields exist
        const processedAttendance = response.attendance.map(record => {
          
          // Force recalculation of totals from sessions
          const totalWorkedHours = calculateTotalHours(record.sessions);
          const totalBreakHours = calculateTotalBreakHours(record.sessions);
          
          
          return {
            ...record,
            totalWorkedHours,
            totalBreakHours,
          };
        });
        
        
        // Group by employee ID
        const attendanceByEmployee = {};
        processedAttendance.forEach(record => {
          const id = record.employeeId._id || record.employeeId;
          if (!attendanceByEmployee[id]) {
            attendanceByEmployee[id] = [];
          }
          attendanceByEmployee[id].push(record);
        });
        
        setAttendanceData(attendanceByEmployee);
      } else {
        setAttendanceData({});
      }
    } catch (e) { 
      console.error("Error fetching attendance:", e);
      setAttendanceData({}); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const getEmployeeAttendanceHistory = async (employeeId) => {
    try { 
      const response = await apiRequest("Attendance/getEmployeeAttendanceHistory/", { 
        method: 'POST', 
        body: JSON.stringify({ employeeId, _id: user._id, role: user.role }), 
      }); 
      
      if (response?.success && response.attendance) {
        // Process all historical records to ensure calculated fields exist
        return response.attendance.map(processAttendanceRecord);
      }
      
      return [];
    } catch (e) { 
      console.error("Error fetching employee history:", e);
      return []; 
    }
  };

  const handleViewAttendance = async (employee) => {
    setSelectedEmployee(employee);
    const history = await getEmployeeAttendanceHistory(employee._id);
    
    // Update attendance data with full history for the selected employee
    setAttendanceData(prev => ({ 
      ...prev, 
      [employee._id]: history 
    }));
    
    setIsDetailDialogOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  const getEmployeeAttendanceForDate = (employeeId) => {
    const records = attendanceData[employeeId] || [];
    const selectedDateIST = new Date(selectedDate).toLocaleDateString('en-IN', { timeZone: istTimeZone });
    
    const foundRecord = records.find(record => {
      const recordDateIST = new Date(record.date).toLocaleDateString('en-IN', { timeZone: istTimeZone });
      return recordDateIST === selectedDateIST;
    });
    
    if (foundRecord) {
      
      // Double-check calculations
      const totalWorkedHours = foundRecord.totalWorkedHours ?? calculateTotalHours(foundRecord.sessions);
      const totalBreakHours = foundRecord.totalBreakHours ?? calculateTotalBreakHours(foundRecord.sessions);
      
      const result = {
        ...foundRecord,
        totalWorkedHours,
        totalBreakHours,
      };
      
      return result;
    }
    
    return null;
  };

  const getStatusColor = (attendance) => {
    if (!attendance?.sessions?.length) return 'text-gray-400';
    if (attendance.sessions.some(s => !s.checkOut)) return 'text-green-400';
    if ((attendance.totalWorkedHours || 0) >= 8) return 'text-green-400';
    if ((attendance.totalWorkedHours || 0) > 0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusText = (attendance) => {
    if (!attendance?.sessions?.length) return 'Offline';
    if (attendance.sessions.some(s => s.breaks?.some(b => !b.breakEnd))) return 'On Break';
    if (attendance.sessions.some(s => !s.checkOut)) return 'Online';
    return 'Checked Out';
  };

  return (
    <>
      <Helmet><title>Attendance Daily Log - ENIS-HRMS</title></Helmet>
      <AnimatePresence>
        {isDetailDialogOpen && (
          <AttendanceDetailDialog 
            open={isDetailDialogOpen} 
            setOpen={setIsDetailDialogOpen} 
            employee={selectedEmployee} 
            attendanceRecords={attendanceData[selectedEmployee?._id] || []} 
          />
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div> 
            <h1 className="text-3xl font-bold text-white">Attendance Daily Log</h1> 
            <p className="text-gray-400">Monitor employee attendance and work sessions.</p> 
          </div>
          <div className="flex items-center gap-4"> 
            <Input 
              placeholder="Search employees..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="bg-white/5 border-white/10 w-64" 
            /> 
            <Input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="bg-white/5 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert" 
            /> 
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader> 
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> 
                Employee Attendance - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle> 
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-white">Loading attendance data...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Employee</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Total Hours</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Break Time</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee, index) => {
                        const attendance = getEmployeeAttendanceForDate(employee._id);
                        
                        return (
                          <tr key={employee._id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
                            <td className="py-4 px-4 text-white">
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-400">{employee.department}</div>
                              </div>
                            </td>
                            <td className={`py-4 px-4 font-medium ${getStatusColor(attendance)}`}>
                              {getStatusText(attendance)}
                            </td>
                            <td className="py-4 px-4 text-green-400 font-medium">
                              {attendance ? formatDuration(attendance.totalWorkedHours || 0) : '0h 0m'}
                              {attendance && (
                                <div className="text-xs text-gray-400">
                                  {attendance.sessions?.length || 0} session(s)
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-yellow-400 font-medium">
                              {attendance ? formatDuration(attendance.totalBreakHours || 0) : '0h 0m'}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewAttendance(employee)} 
                                className="text-blue-400 hover:bg-blue-400/10"
                              > 
                                <Eye className="w-4 h-4 mr-2" /> 
                                View Log 
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
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

export default AttendancePage;