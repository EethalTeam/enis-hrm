import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { LayoutDashboard, Users, Target, ClipboardCheck, PhoneForwarded, CalendarCheck2, UserCheck, UserX } from 'lucide-react'; // Added UserX
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest';
import { Link } from 'react-router-dom';

// A small component for individual metric cards, matching your existing style.
const MetricCard = ({ title, value, icon: Icon, color }) => (
    <Card className="metric-card">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-gray-400">{title}</p>
                <h3 className="text-3xl font-bold">{value}</h3>
            </div>
            <div className={`p-3 rounded-full bg-${color}-500/20`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>
        </CardContent>
    </Card>
);

// =================== CARD COMPONENT ===================
const LateLoginsCard = ({ lateLogins }) => (
    <Card className="glass-effect border-white/10">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-400" />
                Today's Late Logins
            </CardTitle>
        </CardHeader>
        <CardContent>
            {lateLogins.length > 0 ? (
                <ul className="space-y-4">
                    {lateLogins.map(employee => (
                        <li key={employee._id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-white">{employee.name}</p>
                                <p className="text-sm text-gray-400">
                                    Login: {employee.loginTime} (Shift: {employee.shiftStartTime})
                                </p>
                            </div>
                            <span className="font-semibold text-orange-400">{employee.lateBy}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400">No employees were late today. Great!</p>
            )}
            <Link to="/dailyLog" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View full attendance log →</Link>
        </CardContent>
    </Card>
);

// =================== CARD COMPONENT ===================
const AbsenteesCard = ({ absentees }) => (
    <Card className="glass-effect border-white/10">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-400" />
                Not Logged Ins
            </CardTitle>
        </CardHeader>
        <CardContent>
            {absentees.length > 0 ? (
                <ul className="space-y-4">
                    {absentees.map(employee => (
                        <li key={employee._id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-white">{employee.name}</p>
                                <p className="text-sm text-gray-400">
                                    {/* Login: {employee.loginTime} (Shift: {employee.shiftStartTime}) */}
                                </p>
                            </div>
                            <span className="font-semibold text-orange-400">{employee.lateBy}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400">No employees were late today. Great!</p>
            )}
            <Link to="/dailyLog" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View full attendance log →</Link>
        </CardContent>
    </Card>
);

// =================== NEW CARD COMPONENT ===================
const TodayPermissionsCard = ({ permissions }) => (
    <Card className="glass-effect border-white/10">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-400" />
                On Permission Today
            </CardTitle>
        </CardHeader>
        <CardContent>
            {permissions.length > 0 ? (
                <ul className="space-y-4">
                    {permissions.map(perm => (
                        <li key={perm._id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-white">{perm.employeeId?.name}</p>
                                <p className="text-sm text-gray-400">
                                    {perm.fromTime} - {perm.toTime}
                                </p>
                            </div>
                            <span className="text-sm font-semibold text-blue-300">{perm.totalHours}h</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400">No employees are on permission today.</p>
            )}
            <Link to="/leaves/permissions" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View all permissions →</Link>
        </CardContent>
    </Card>
);

// =================== NEW CARD COMPONENT ===================
const TodayLeavesCard = ({ leaves }) => (
    <Card className="glass-effect border-white/10">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-400" />
                On Leave Today
            </CardTitle>
        </CardHeader>
        <CardContent>
            {leaves.length > 0 ? (
                <ul className="space-y-4">
                    {leaves.map(leave => (
                        <li key={leave._id} className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-white">{leave.employeeId?.name}</p>
                                <p className="text-sm text-gray-400">
                                    {leave.leaveTypeId?.name}
                                </p>
                            </div>
                            <span className="text-xs text-gray-300">
                                {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                 - 
                                {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400">No employees are on leave today.</p>
            )}
            <Link to="/leaveRequest" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View all leaves →</Link>
        </CardContent>
    </Card>
);

// A helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// ############################################
// ##     ADMIN & SUPER ADMIN VIEW (MODIFIED) ##
// ############################################
const AdminDashboard = ({ stats }) => (
    <div className="space-y-8">
        {/* Top row of metric cards */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            <MetricCard title="Today's Follow-ups" value={stats.todaysLeads.length} icon={PhoneForwarded} color="blue" />
            <MetricCard title="Tasks Due Today" value={stats.todaysTasks.length} icon={CalendarCheck2} color="purple" />
            <MetricCard title="Total Active Leads" value={stats.allLeads.length} icon={Target} color="green" />
            <MetricCard title="Total Active Tasks" value={stats.allTasks.filter(val => val.taskStatusId.name !== "Completed").length} icon={ClipboardCheck} color="orange" />
        </motion.div>

        {/* Today's Activity Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* Today's Follow-up Leads Card */}
            <Card className="glass-effect border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Today's Follow-up Leads</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.todaysLeads.length > 0 ? (
                        <ul className="space-y-4">
                            {stats.todaysLeads.slice(0, 5).map(lead => (
                                <li key={lead._id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-white">{lead.companyName}</p>
                                        <p className="text-sm text-gray-400">{lead.contactPerson}</p>
                                    </div>
                                    <span className={`status-badge text-xs bg-gray-500/20 text-gray-300`}>{lead.statusId?.statusName}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No lead follow-ups scheduled for today.</p>
                    )}
                    <Link to="/allLeads" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View all leads →</Link>
                </CardContent>
            </Card>

            {/* Tasks Due Today Card */}
            <Card className="glass-effect border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Tasks Due Today</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.todaysTasks.length > 0 ? (
                        <ul className="space-y-4">
                            {stats.todaysTasks.slice(0, 5).map(task => (
                                <li key={task._id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-white">{task.taskName}</p>
                                        <p className="text-sm text-gray-400">Assigned to: {task.assignedTo[0]?.name || 'N/A'}</p>
                                    </div>
                                    <span className={`text-xs font-semibold`}>{task.taskPriorityId?.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400">No tasks are due today.</p>
                    )}
                    <Link to="/tasks" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View all tasks →</Link>
                </CardContent>
            </Card>
        </motion.div>

        {/* =================== NEW SECTION =================== */}
        {/* Today's Leave & Permission Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            <TodayLeavesCard leaves={stats.todayLeaves} />
            <TodayPermissionsCard permissions={stats.todayPermissions} />
        </motion.div>
        {/* =================================================== */}


        {/* Late Logins Section (Delay updated) */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }} // <-- Updated delay
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            <LateLoginsCard lateLogins={stats.lateLogins} />
            <AbsenteesCard absentees={stats.absentees}/>
        </motion.div>
    </div>
);


// ############################################
// ##         EMPLOYEE VIEW                ##
// ############################################
const EmployeeDashboard = ({ stats }) => (
    // ... no changes here
    <div className="space-y-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            <MetricCard title="My Follow-ups Today" value={stats.todaysLeads.length} icon={PhoneForwarded} color="blue" />
            <MetricCard title="My Tasks Due Today" value={stats.todaysTasks.length} icon={CalendarCheck2} color="purple" />
            <MetricCard title="My Total Leads" value={stats.allLeads.length} icon={Target} color="green" />
            <MetricCard title="My Total Tasks" value={stats.allTasks.length} icon={ClipboardCheck} color="orange" />
        </motion.div>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            <Card className="glass-effect border-white/10">
                <CardHeader><CardTitle className="text-white">My Follow-ups for Today</CardTitle></CardHeader>
                <CardContent>
                    {stats.todaysLeads.length > 0 ? (
                        <ul className="space-y-4">{stats.todaysLeads.slice(0, 5).map(lead => (<li key={lead._id} className="flex justify-between items-center"><div><p className="font-medium text-white">{lead.companyName}</p><p className="text-sm text-gray-400">{lead.contactPerson}</p></div><span className={`status-badge text-xs bg-gray-500/20 text-gray-300`}>{lead.statusId?.statusName}</span></li>))}</ul>
                    ) : (<p className="text-gray-400">You have no follow-ups scheduled for today.</p>)}
                    <Link to="/leads" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View all my leads →</Link>
                </CardContent>
            </Card>
            <Card className="glass-effect border-white/10">
                <CardHeader><CardTitle className="text-white">My Tasks Due Today</CardTitle></CardHeader>
                <CardContent>
                    {stats.todaysTasks.length > 0 ? (
                        <ul className="space-y-4">{stats.todaysTasks.slice(0, 5).map(task => (<li key={task._id} className="flex justify-between items-center"><div><p className="font-medium text-white">{task.taskName}</p><p className="text-sm text-gray-400">Project: {task.projectId?.projectName}</p></div><span className={`text-xs font-semibold`}>{task.taskPriorityId?.name}</span></li>))}</ul>
                    ) : (<p className="text-gray-400">You have no tasks due today. Great job!</p>)}
                    <Link to="/tasks" className="text-blue-400 hover:text-blue-300 mt-4 block text-sm">View all my tasks →</Link>
                </CardContent>
            </Card>
        </motion.div>
    </div>
);


// ############################################
// ##   MAIN DASHBOARD COMPONENT (MODIFIED)   ##
// ############################################
const DashboardPage = () => {
    const { user } = useAuth();
    const [allLeads, setAllLeads] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [lateLogins, setLateLogins] = useState([]);
    const [absentees,setAbsentees] = useState([])
    const [todayPermissions, setTodayPermissions] = useState([]); // <-- New state
    const [todayLeaves, setTodayLeaves] = useState([]); // <-- New state
    const [loading, setLoading] = useState(true);

    const isAdmin = user.role === 'Super Admin' || user.role === 'Admin';

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;
            
            try {
                setLoading(true);
                const commonPayload = {
                    method: 'POST',
                    body: JSON.stringify({ _id: user._id, role: user.role }),
                };

                const apiCalls = [
                    apiRequest("Lead/getAllLeads/", commonPayload),
                    apiRequest("Task/getAllTasks/", commonPayload)
                ];
                
                // Only add admin-specific calls
                if (isAdmin) {
                    apiCalls.push(apiRequest("DashBoard/getLateLogins", commonPayload));
                    apiCalls.push(apiRequest("DashBoard/getTodayPermissions", commonPayload)); 
                    apiCalls.push(apiRequest("DashBoard/getTodayLeaves", commonPayload)); 
                    apiCalls.push(apiRequest("DashBoard/getAllAbsentees", commonPayload)); // <-- New call
                }

                const responses = await Promise.all(apiCalls);

                setAllLeads(responses[0].leads || []);
                setAllTasks(responses[1] || []);

                // Set admin-specific states
                if (isAdmin) {
                    setLateLogins(responses[2].data || []);
                    setTodayPermissions(responses[3].permissions || []); 
                    setTodayLeaves(responses[4].leaves || []); 
                    setAbsentees(responses[5].absentees || [])
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, isAdmin]);

    const todaysLeads = useMemo(() => {
        const today = getTodayDateString();
        return allLeads.filter(lead => lead.nextFollowUp?.split('T')[0] === today);
    }, [allLeads]);

    const todaysTasks = useMemo(() => {
        const today = getTodayDateString();
        return allTasks.filter(task => task.dueDate?.split('T')[0] === today);
    }, [allTasks]);

    // Pass all stats to the relevant dashboard
    const stats = { 
        allLeads, 
        allTasks, 
        todaysLeads, 
        todaysTasks, 
        lateLogins, 
        todayPermissions, 
        todayLeaves,
        absentees
    };

    return (
        <>
            <Helmet>
                <title>Dashboard - ENIS-HRMS</title>
                <meta name="description" content="Dashboard overview of key metrics, leads, and tasks." />
            </Helmet>

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center">
                            <LayoutDashboard className="w-8 h-8 mr-3 text-purple-400" />
                            {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                        </h1>
                        <p className="text-gray-400">
                            Welcome back, {user.name || 'User'}! Here's your focus for today.
                        </p>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="text-center text-gray-400 pt-10">Loading dashboard data...</div>
                ) : (
                    isAdmin ? <AdminDashboard stats={stats} /> : <EmployeeDashboard stats={stats} />
                )}
            </div>
        </>
    );
};

export default DashboardPage;