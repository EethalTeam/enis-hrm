import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Check,
  X,
  LogIn,
  Coffee,
  Mail,
  Camera,
  User,
  BadgeInfo,
  Phone,
  Briefcase,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import socket from "@/socket/Socket";
import { config } from "@/components/CustomComponents/config";
import { apiRequest } from "@/components/CustomComponents/apiRequest";

const AttendanceActions = ({ startIdleTimeout }) => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  // const [attendanceStatus, setAttendanceStatus] = useState({ status: 'out', break: false });
  const { attendanceStatus, setAttendanceStatus } = useData();
  const [elapsed, setElapsed] = useState(
    localStorage.getItem("attendanceElapsed") || "00:00:00",
  );
  const intervalRef = useRef(null);
  // let isRefreshing = false;

  // document.addEventListener('keydown', (event) => {
  //   if (event.key === 'F5' ||
  //       (event.ctrlKey && event.key === 'r') ||
  //       (event.metaKey && event.key === 'r')) {
  //     isRefreshing = true;
  //   }
  // });

  // window.addEventListener('load', () => {
  //   const entries = performance.getEntriesByType('navigation');
  //   const navigationType = entries.length > 0 ? entries[0].type : performance.navigation.type;
  //   if(navigationType !== 'reload'){
  //     socket.emit('tabClosing', { employeeId: user._id });
  //     localStorage.removeItem('hrms_user');
  //     localStorage.removeItem('attendanceElapsed')
  //     localStorage.setItem('hrms_attendance_status',{ status: 'out', break: false })
  //   }
  // });
  useEffect(() => {
    if (attendanceStatus.status === "in") {
      const cleanup = startIdleTimeout(handleDayOut);
      return () => {
        cleanup();
      };
    }
  }, [attendanceStatus]);
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
    const [hh, mm, ss] = timeStr.split(":").map(Number);
    return hh * 3600 + mm * 60 + ss;
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    if (attendanceStatus.status === "in" && !attendanceStatus.break) {
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
        body: JSON.stringify({ employeeId: user._id }),
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
        body: JSON.stringify({
          employeeId: user._id,
          workedHours: timeToDecimalHours(elapsed),
        }),
      });
      const data = res;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const breakStart = async () => {
    try {
      const res = await apiRequest("Attendance/breakStart/", {
        method: "POST",
        body: JSON.stringify({ employeeId: user._id }),
      });
      const data = res;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const breakEnd = async () => {
    try {
      const res = await apiRequest("Attendance/breakEnd/", {
        method: "POST",
        body: JSON.stringify({ employeeId: user._id }),
      });
      const data = res;
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleDayIn = () => {
    DayIn();
    setAttendanceStatus({ status: "in", break: false });
    toast({
      title: "Day In",
      description: "You've successfully clocked in for the day.",
    });
    setElapsed("00:00:00");
    localStorage.setItem("attendanceElapsed", "00:00:00");
  };

  const handleDayOut = () => {
    if (attendanceStatus.break) {
      breakEnd();
    }
    DayOut();
    setAttendanceStatus({ status: "out", break: false });
    toast({
      title: "Day Out",
      description: "You've successfully clocked out. Have a great day!",
    });
    setElapsed("00:00:00");
    localStorage.removeItem("attendanceElapsed");
  };
  const handleBreak = () => {
    attendanceStatus.break ? breakEnd() : breakStart();
    setAttendanceStatus((prev) => ({ ...prev, break: !prev.break }));
    toast({
      title: attendanceStatus.break ? "Back to Work" : "Break Time",
      description: attendanceStatus.break
        ? "Your break is over."
        : "Enjoy your break!",
    });
  };

  if (attendanceStatus.status === "out") {
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
          className={`border-white/10 ${attendanceStatus.break ? "bg-yellow-500/20 text-yellow-400" : "hover:bg-white/10"}`}
        >
          {attendanceStatus.break ? (
            <Briefcase className="w-4 h-4 mr-2" />
          ) : (
            <Coffee className="w-4 h-4 mr-2" />
          )}
          {attendanceStatus.break ? "End Break" : "Take Break"}
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
  const fileInputRef = useRef(null);
  const userNotifications = notifications.filter(
    (n) => n.toEmployeeId === user._id && n.status === "unseen",
  );
  // useEffect(() => {
  //   if (!user?._id) return;

  //   const heartbeatInterval = setInterval(() => {
  //     if (socket.connected) {
  //       socket.emit("heartbeat", { employeeId: user._id });
  //     }
  //   }, 15000);

  //   return () => clearInterval(heartbeatInterval);
  // }, [user?._id]);

  function startIdleTimeout(triggerFn, timeout = 240 * 60 * 1000) {
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
      window.addEventListener(event, resetTimer, { passive: true }),
    );

    // Initialize the timer
    resetTimer();

    // Cleanup function (if needed)
    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }
  // ---------------- Fetch function ----------------
  const fetchNotifications = async () => {
    try {
      const res = await apiRequest("Notifications/getNotifications", {
        method: "POST",
        body: JSON.stringify({ employeeId: user._id }),
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
  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const employeeId = employeeData?._id || user?._id;

      const formData = new FormData();
      formData.append("_id", employeeId);
      formData.append("avatar", file);

      const res = await apiRequest("Employee/uploadAvatar", {
        method: "POST",
        body: formData,
      });

      const updatedEmployee = res?.employee;

      setEmployeeData((prev) => ({
        ...(prev || {}),
        ...updatedEmployee,
      }));

      const storedUser = JSON.parse(localStorage.getItem("hrms_user") || "{}");
      localStorage.setItem(
        "hrms_user",
        JSON.stringify({
          ...storedUser,
          avatar: updatedEmployee?.avatar || storedUser?.avatar,
        }),
      );

      e.target.value = "";
    } catch (error) {
      console.error("Avatar upload failed:", error);
    }
  };
  const markAsRead = async (notificationId) => {
    try {
      const res = await apiRequest("Notifications/markAsSeen/", {
        method: "POST",
        body: JSON.stringify({ notificationId }),
      });

      if (res) {
        // Re-fetch updated notifications
        fetchNotifications();
        toast({
          title: "Marked as read",
          description: "Notification marked as seen.",
        });
      } else {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error marking notification:", err);
      toast({
        title: "Error",
        description: "Failed to mark notification as seen.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await apiRequest("Notifications/markAllAsSeen/", {
        method: "POST",
        body: JSON.stringify({ employeeId: user._id }),
      });

      if (res) {
        // Re-fetch updated notifications
        fetchNotifications();
        toast({
          title: "Notifications updated",
          description: "Older notifications marked as seen.",
        });
      }
    } catch (err) {
      console.error("Error marking all notifications as seen:", err);
      toast({
        title: "Error",
        description: "Failed to mark notifications as seen.",
        variant: "destructive",
      });
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
        toast({
          title: `Request ${action}d`,
          description: `The request has been ${action}d.`,
        });
      } else {
        toast({
          title: "Error",
          description: res.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error updating notification:", err);
      toast({
        title: "Error",
        description: "Failed to update notification.",
        variant: "destructive",
      });
    }
  };

  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const isClient = employeeData?.ClientCode;

  const handleUserClick = async () => {
    try {
      // get employees
      const empRes = await apiRequest("Employee/getAllActiveEmployees", {
        method: "POST",
        body: JSON.stringify({}),
      });

      // get clients
      const clientRes = await apiRequest("Client/getAllClients", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const employees = Array.isArray(empRes) ? empRes : [];
      const clients = Array.isArray(clientRes) ? clientRes : [];

      // search employee
      let fullUserData = employees.find(
        (emp) => String(emp?._id) === String(user?._id),
      );

      // if not employee check client
      if (!fullUserData) {
        fullUserData = clients.find(
          (client) => String(client?._id) === String(user?._id),
        );
      }

      if (!fullUserData) {
        console.error("Logged-in user not found", {
          userId: user?._id,
        });
        return;
      }

      setEmployeeData(fullUserData);
      setIsProfileOpen(true);
    } catch (error) {
      console.error("handleUserClick error:", error);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-white/10"
          >
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
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
          />
          {user.role !== "Client" && (
            <AttendanceActions startIdleTimeout={startIdleTimeout} />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-white/10"
              >
                <Bell className="w-5 h-5" />
                {userNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                    {userNotifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 glass-effect border-white/10"
              style={{
                overflowY: "auto",
                height: "300px",
                scrollbarWidth: "none",
              }}
            >
              <div className="p-2 font-semibold flex items-center justify-between">
                Notifications
                {/* Disabled for now — uncomment to re-enable bulk "Mark all as seen". */}
                {userNotifications && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs font-normal text-gray-300 hover:text-white"
                    onClick={markAllAsRead}
                  >
                    Mark all as seen
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              {userNotifications.length > 0 ? (
                userNotifications.map((notification) => {
                  const isRequestType =
                    notification.type === "permission-request" ||
                    notification.type === "leave-request";
                  const canAct =
                    isRequestType &&
                    notification.fromEmployeeId !== user._id &&
                    notification.status !== "approved" &&
                    notification.status !== "rejected" &&
                    (user.role === "Admin" || user.role === "Super Admin");

                  return (
                    <div key={notification._id} className="px-2 py-1.5 text-sm">
                      <p className="mb-2">{notification.message}</p>
                      <div className="flex gap-2 mt-1">
                        {canAct && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-500/80 hover:bg-green-500 h-7"
                              onClick={() =>
                                handleNotificationAction(
                                  notification,
                                  "approve",
                                )
                              }
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500/80 hover:bg-red-500 h-7"
                              onClick={() =>
                                handleNotificationAction(notification, "reject")
                              }
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {!canAct && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => markAsRead(notification._id)}
                          >
                            Mark as seen
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="px-2 py-4 text-center text-sm text-gray-400">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 hover:bg-white/10 px-3 py-2 h-auto w-auto"
              >
                {user.avatar ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} className="object-cover" />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="w-8 h-8">
                    {" "}
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user.name || user.UserName}
                  </p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 glass-effect border-white/10"
            >
              <DropdownMenuItem
                className="hover:bg-white/10"
                onClick={handleUserClick}
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="hover:bg-white/10 text-red-400 focus:text-red-400 focus:bg-red-500/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="max-w-2xl w-full rounded-2xl p-0 overflow-hidden border border-white/10 bg-[#1e2f6d] text-white shadow-2xl">
              {/* Top Section */}
              <div className="px-6 py-6 bg-[#243878] border-b border-white/10">
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className="relative">
                    {employeeData?.avatar ? (
                      <img
                        src={employeeData.avatar}
                        alt="avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/15 text-white flex items-center justify-center text-3xl font-bold border-4 border-white/20 shadow-lg">
                        {isClient
                          ? employeeData?.UserName?.[0]?.toUpperCase()
                          : employeeData?.name
                              ?.split(" ")
                              ?.map((n) => n[0])
                              ?.join("")
                              ?.toUpperCase()}
                      </div>
                    )}
                    {!isClient && (
                      <>
                        {/* Upload Avatar */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg border-2 border-white"
                        >
                          <Camera className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Name & Role */}
                  <div className="flex-1 pt-2">
                    <h2 className="text-2xl font-bold tracking-wide">
                      {isClient
                        ? employeeData?.UserName
                        : employeeData?.name || "-"}
                    </h2>

                    <p className="text-sm text-white/80 mt-1">
                      {isClient
                        ? employeeData?.RoleId?.RoleName
                        : employeeData?.roleName || "Employee"}
                    </p>

                    <p className="text-sm text-white/70 mt-1">
                      {isClient ? "Client Code:" : "Employee Code:"}{" "}
                      {isClient
                        ? employeeData?.ClientCode
                        : employeeData?.employeeCode ||
                          employeeData?.code ||
                          "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#2b428b]">
                {/* Name */}
                <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                  <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </p>
                  <p className="text-base font-semibold">
                    {isClient
                      ? employeeData?.UserName
                      : employeeData?.name || "-"}
                  </p>
                </div>

                {/* Code */}
                <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                  <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                    <BadgeInfo className="w-4 h-4" />
                    {isClient ? "Client Code" : "Employee Code"}
                  </p>
                  <p className="text-base font-semibold">
                    {isClient
                      ? employeeData?.ClientCode
                      : employeeData?.employeeCode || employeeData?.code || "-"}
                  </p>
                </div>

                {/* Email */}
                <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                  <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="text-base font-semibold break-all">
                    {isClient
                      ? employeeData?.UserName
                      : employeeData?.email || "-"}
                  </p>
                </div>

                {/* Phone (Employees only) */}
                {!isClient && (
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                    <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </p>
                    <p className="text-base font-semibold">
                      {employeeData?.phoneNumber || "-"}
                    </p>
                  </div>
                )}

                {/* Role */}
                <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                  <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Role
                  </p>
                  <p className="text-base font-semibold">
                    {isClient
                      ? employeeData?.RoleId?.RoleName
                      : employeeData?.roleName || "-"}
                  </p>
                </div>

                {/* Status */}
                {!isClient && (
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4">
                    <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Status
                    </p>
                    <p className="text-base font-semibold">
                      {employeeData?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                )}

                {/* Address (Employees only) */}
                {!isClient && (
                  <div className="rounded-xl bg-white/10 border border-white/10 p-4 md:col-span-2">
                    <p className="text-xs text-white/70 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </p>
                    <p className="text-base font-semibold">
                      {employeeData?.address || "-"}
                    </p>
                  </div>
                )}
              </div>

              {/* Client Projects */}
              {isClient && (
                <div className="p-6 border-t border-white/10 bg-[#2b428b]">
                  <h3 className="text-lg font-semibold mb-4">Projects</h3>

                  {employeeData?.projects?.length > 0 ? (
                    <div className="space-y-3">
                      {employeeData.projects.map((project) => (
                        <div
                          key={project._id}
                          className="p-3 rounded-lg bg-white/10 border border-white/10"
                        >
                          {project.projectName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/70">
                      No projects assigned
                    </p>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
