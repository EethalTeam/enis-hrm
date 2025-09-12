import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, LogOut, User, Check, X, LogIn, Coffee, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import socket from '@/socket/Socket';
import { config } from '@/components/CustomComponents/config';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const AttendanceActions = ({startIdleTimeout}) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  // const [attendanceStatus, setAttendanceStatus] = useState({ status: 'out', break: false });
    const { attendanceStatus, setAttendanceStatus } = useData();
  const [elapsed, setElapsed] = useState(localStorage.getItem('attendanceElapsed') || "00:00:00");
  const intervalRef = useRef(null);

// let isRefreshing = false;

// document.addEventListener('keydown', (event) => {
//   if (event.key === 'F5' || 
//       (event.ctrlKey && event.key === 'r') || 
//       (event.metaKey && event.key === 'r')) {
//     isRefreshing = true;
//   }
// });

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
useEffect(()=>{
  if (attendanceStatus.status === "in") {
    const cleanup = startIdleTimeout(handleDayOut);
    return () => {
      cleanup(); 
    };
  }
},[attendanceStatus])
// let wasVisible = true;
// document.addEventListener('visibilitychange', () => {
//   if (document.visibilityState === 'visible') {
//     wasVisible = true;
//   } else {
//     wasVisible = false;
//   }
// });

// let socketWasConnected = false;
// socket.on('connect', () => {
//   if (socketWasConnected) {
//     isRefreshing = true;
//   }
//   socketWasConnected = true;
// });

// window.addEventListener('beforeunload', (event) => {
//   isUnloading = true;
// });

  const parseTime = (timeStr) => {
    const [hh, mm, ss] = timeStr.split(':').map(Number);
    return hh * 3600 + mm * 60 + ss;
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    if (attendanceStatus.status === 'in' && !attendanceStatus.break) {
      // Get last saved time from localStorage
      const lastTime = localStorage.getItem("attendanceElapsed") || "00:00:00";
      let totalSeconds = parseTime(lastTime);

      intervalRef.current = setInterval(() => {
        totalSeconds += 1;
        setElapsed(formatTime(totalSeconds));

        // Save to localStorage every minute
        if (totalSeconds % 1 === 0) {
          localStorage.setItem("attendanceElapsed", formatTime(totalSeconds));
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [attendanceStatus.status, attendanceStatus.break]);


  const DayIn = async () => {
  try {
     const res = await apiRequest("Attendance/dayIn/", {
      method: "POST",
      body: JSON.stringify({ employeeId: user._id })
    });
    const data = res;
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  }
};
function timeToDecimalHours(timeStr) {
  const [hh, mm, ss] = timeStr.split(":").map(Number);

  const totalSeconds = hh * 3600 + mm * 60 + ss;
  const hours = totalSeconds / 3600;

  return parseFloat(hours.toFixed(2)); // e.g., 0.02
}

  const DayOut = async () => {
  try {
     const res = await apiRequest("Attendance/dayOut/", {
      method: "POST",
      body: JSON.stringify({ employeeId: user._id ,workedHours:timeToDecimalHours(elapsed)})
    });
    const data = res;
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  }
};

  const handleDayIn = () => {
    DayIn()
    setAttendanceStatus({ status: 'in', break: false });
    toast({ title: "Day In", description: "You've successfully clocked in for the day." });
    setElapsed("00:00:00");
    localStorage.setItem("attendanceElapsed", "00:00:00");
  };

  const handleDayOut = () => {
    DayOut()
    setAttendanceStatus({ status: 'out', break: false });
    toast({ title: "Day Out", description: "You've successfully clocked out. Have a great day!" });
    setElapsed("00:00:00");
    localStorage.removeItem("attendanceElapsed");
  };
  const handleBreak = () => {
    setAttendanceStatus(prev => ({ ...prev, break: !prev.break }));
    toast({
      title: attendanceStatus.break ? "Back to Work" : "Break Time",
      description: attendanceStatus.break ? "Your break is over." : "Enjoy your break!"
    });
  };

  if (attendanceStatus.status === 'out') {
    return (
      <Button onClick={handleDayIn} className="bg-green-600 hover:bg-green-700">
        <LogIn className="w-4 h-4 mr-2" /> Day In
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <div className="text-sm text-gray-300 ml-4">
          <strong>Elapsed Time:</strong> {elapsed}
        </div>
        <Button
          onClick={handleBreak}
          variant="outline"
          className={`border-white/10 ${attendanceStatus.break ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-white/10'}`}
        >
          {attendanceStatus.break ? <Briefcase className="w-4 h-4 mr-2" /> : <Coffee className="w-4 h-4 mr-2" />}
          {attendanceStatus.break ? 'End Break' : 'Take Break'}
        </Button>
        <Button onClick={handleDayOut} className="bg-red-600 hover:bg-red-700">
          <LogOut className="w-4 h-4 mr-2" /> Day Out
        </Button>
      </div>
    </div>
  );
};

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState([]);

    const userNotifications = notifications.filter(n => n.toEmployeeId === user._id && n.status === 'unseen');
  //    useEffect(() => {
  //   if (!user?._id) return;

  //   // Join employee room
  //   socket.emit("joinRoom", { employeeId: user._id });

  //   // Send heartbeat every 15 seconds
  //   const heartbeatInterval = setInterval(() => {
  //     socket.emit("heartbeat", { employeeId: user._id });
  //   }, 15000); // 15s

  //   // Handle tab close
  //   const handleTabClose = () => {
  //     socket.emit("tabClosed", { employeeId: user._id });
  //   };
  //   window.addEventListener("beforeunload", handleTabClose);

  //   // Optional: handle forced logout from server
  //   socket.on("forceLogout", ({ message }) => {
  //     alert(message); // or call logout function from AuthContext
  //     // logout(); <-- if you want to auto logout in frontend too
  //   });

  //   return () => {
  //     clearInterval(heartbeatInterval);
  //     window.removeEventListener("beforeunload", handleTabClose);
  //     socket.off("forceLogout");
  //   };
  // }, [user?._id]);
// useEffect(() => {
//   // Join the employee room
//   socket.emit("joinRoom", { employeeId: user._id });

//   // Listen to server event for new notifications
//   socket.on("receiveNotification", () => {
//     // Whenever a new notification is triggered, fetch all notifications again
//     fetchNotifications();
//   });

//   // Cleanup on unmount
//   return () => {
//     socket.off("receiveNotification");
//   };
// }, [user._id]);
function startIdleTimeout(triggerFn, timeout = 10 * 60 * 1000) {
  let idleTimer;

  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      triggerFn(); // call your function
    }, timeout);
  };

  // Events that reset the idle timer
  const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

  events.forEach((event) =>
    window.addEventListener(event, resetTimer, { passive: true })
  );

  // Initialize the timer
  resetTimer();

  // Cleanup function (if needed)
  return () => {
    clearTimeout(idleTimer);
    events.forEach((event) =>
      window.removeEventListener(event, resetTimer)
    );
  };
}
// ---------------- Fetch function ----------------
const fetchNotifications = async () => {
  try {
     const res = await apiRequest("Notifications/getNotifications", {
      method: "POST",
      body: JSON.stringify({ employeeId: user._id })
    });
    const data = res;
    if (data?.data) setNotifications(data.data);
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  }
};

// Call once on mount
useEffect(() => {
  fetchNotifications();
}, [user._id]);

const markAsRead = async (notificationId) => {
  try {
    const res = await apiRequest("Notifications/markAsSeen/", {
      method: "POST",
      body: JSON.stringify({ notificationId }),
    });
    
    if (res) {
      // Re-fetch updated notifications
      fetchNotifications();
      toast({ title: "Marked as read", description: "Notification marked as seen." });
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" });
    }
  } catch (err) {
    console.error("Error marking notification:", err);
    toast({ title: "Error", description: "Failed to mark notification as seen.", variant: "destructive" });
  }
};

const handleNotificationAction = async (notification, action) => {
  try {
    const res = await apiRequest("Notifications/updateNotificationStatus", {
      method: "POST",
      body: JSON.stringify({ notificationId: notification._id, action }),
    });

    if (res) {
      // Re-fetch updated notifications
      fetchNotifications();
      toast({ title: `Request ${action}d`, description: `The request has been ${action}d.` });
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" });
    }
  } catch (err) {
    console.error("Error updating notification:", err);
    toast({ title: "Error", description: "Failed to update notification.", variant: "destructive" });
  }
};


  return (
    <motion.header
      className="glass-effect border-b border-white/10 px-4 py-4"
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
          {/* Attendance Actions with Timer */}
          <AttendanceActions startIdleTimeout={startIdleTimeout}/>

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
            <DropdownMenuContent align="end" className="w-80 glass-effect border-white/10" style={{ overflowY: 'auto', height: '300px', scrollbarWidth: 'none' }}>
              <div className="p-2 font-semibold">Notifications</div>
              <DropdownMenuSeparator />
              {userNotifications.length > 0 ? (
                userNotifications.map(notification => (
                  <div key={notification._id} className="px-2 py-1.5 text-sm">
                    <p className="mb-2">{notification.message}</p>
                    {(notification.type === 'permission_request' || notification.type === 'leave-request') && notification.fromEmployeeId !== user._id && notification.status !=='approved' && notification.status !=='rejected' && (
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" className="bg-green-500/80 hover:bg-green-500 h-7" onClick={() => handleNotificationAction(notification, 'approve')}><Check className="w-4 h-4 mr-1"/>Approve</Button>
                        <Button size="sm" className="bg-red-500/80 hover:bg-red-500 h-7" onClick={() => handleNotificationAction(notification, 'reject')}><X className="w-4 h-4 mr-1"/>Reject</Button>
                      </div>
                    )}
                     {(notification.type !== 'permission-request' && notification.type !== 'leave-request') && (
                       <Button size="sm" variant="outline" className="h-7" onClick={() => markAsRead(notification._id)}>Mark as read</Button>
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
              <Button variant="ghost" className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 h-auto w-auto">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
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
