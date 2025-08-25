
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, CalendarCheck, Wallet, Briefcase, ClipboardList, Timer, PiggyBank, Target, Ticket, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: CalendarCheck, label: 'Attendance', path: '/attendance' },
  { icon: Briefcase, label: 'Leaves', path: '/leaves' },
  { icon: Wallet, label: 'Payroll', path: '/payroll' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
  { icon: Timer, label: 'Timesheets', path: '/timesheets' },
  { icon: PiggyBank, label: 'Finance', path: '/finance' },
  { icon: Target, label: 'Leads', path: '/leads' },
  { icon: Ticket, label: 'Tickets', path: '/tickets' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
];

const Sidebar = () => {
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Log Out",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };
  
  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700 flex flex-col justify-between p-4"
    >
      <div>
        <div className="flex items-center gap-3 p-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <img  class="h-10 w-10" alt="HRMS Logo" src="https://images.unsplash.com/photo-1579424471975-46ac8089543b" />
          </motion.div>
          <span className="text-xl font-bold text-white">HRMS Corp</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item, index) => (
            <motion.div key={item.path} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/80 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-2">
         <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * navItems.length }}>
            <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/80 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`
                }
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
            </NavLink>
         </motion.div>
         <motion.button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-500/80 hover:text-white transition-all duration-200">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
  