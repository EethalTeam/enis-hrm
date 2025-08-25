import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, LogOut, User, Check, X, LogIn, Coffee, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const AttendanceActions = () => {
  const { attendanceStatus, setAttendanceStatus } = useData();
  const { toast } = useToast();

  const handleDayIn = () => {
    setAttendanceStatus({ status: 'in', break: false });
    toast({ title: "Day In", description: "You've successfully clocked in for the day." });
  };

  const handleDayOut = () => {
    setAttendanceStatus({ status: 'out', break: false });
    toast({ title: "Day Out", description: "You've successfully clocked out. Have a great day!" });
  };

  const handleBreak = () => {
    setAttendanceStatus(prev => ({ ...prev, break: !prev.break }));
    toast({ title: attendanceStatus.break ? "Back to Work" : "Break Time", description: attendanceStatus.break ? "Your break is over." : "Enjoy your break!" });
  };

  if (attendanceStatus.status === 'out') {
    return (
      <Button onClick={handleDayIn} className="bg-green-600 hover:bg-green-700">
        <LogIn className="w-4 h-4 mr-2" /> Day In
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleBreak} variant="outline" className={`border-white/10 ${attendanceStatus.break ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}>
        {attendanceStatus.break ? <Briefcase className="w-4 h-4 mr-2" /> : <Coffee className="w-4 h-4 mr-2" />}
        {attendanceStatus.break ? 'End Break' : 'Take Break'}
      </Button>
      <Button onClick={handleDayOut} className="bg-red-600 hover:bg-red-700">
        <LogOut className="w-4 h-4 mr-2" /> Day Out
      </Button>
    </div>
  );
};

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { notifications, updateNotification, updatePermission } = useData();
  const { toast } = useToast();

  const userNotifications = notifications.filter(n => n.recipientId === user.id && !n.read);

  const handleNotificationAction = (notification, action) => {
    if (notification.type === 'permission_request') {
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
      updatePermission({ id: notification.entityId, status: newStatus });
      
      updateNotification({ ...notification, read: true });

      toast({
        title: `Permission ${newStatus}`,
        description: `The request has been ${newStatus.toLowerCase()}.`,
      });
    }
  };

  const markAsRead = (notificationId) => {
    updateNotification({ id: notificationId, read: true });
  };

  return (
    <motion.header 
      className="glass-effect border-b border-white/10 px-6 py-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="hover:bg-white/10">
            <Menu className="w-5 h-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2 glass-effect rounded-lg px-4 py-2 min-w-[300px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees, projects, tasks..."
              className="bg-transparent border-none outline-none flex-1 text-sm placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AttendanceActions />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                <Bell className="w-5 h-5" />
                {userNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                    {userNotifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-effect border-white/10">
              <div className="p-2 font-semibold">Notifications</div>
              <DropdownMenuSeparator />
              {userNotifications.length > 0 ? (
                userNotifications.map(notification => (
                  <div key={notification.id} className="px-2 py-1.5 text-sm">
                    <p className="mb-2">{notification.message}</p>
                    {notification.type === 'permission_request' && notification.metadata.requesterId !== user.id && (
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" className="bg-green-500/80 hover:bg-green-500 h-7" onClick={() => handleNotificationAction(notification, 'approve')}><Check className="w-4 h-4 mr-1"/>Approve</Button>
                        <Button size="sm" className="bg-red-500/80 hover:bg-red-500 h-7" onClick={() => handleNotificationAction(notification, 'reject')}><X className="w-4 h-4 mr-1"/>Reject</Button>
                      </div>
                    )}
                     {notification.type !== 'permission_request' && (
                       <Button size="sm" variant="outline" className="h-7" onClick={() => markAsRead(notification.id)}>Mark as read</Button>
                     )}
                  </div>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-gray-400">No new notifications</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 h-auto">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-effect border-white/10">
              <DropdownMenuItem className="hover:bg-white/10">
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="hover:bg-white/10 text-red-400 focus:text-red-400 focus:bg-red-500/20">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;