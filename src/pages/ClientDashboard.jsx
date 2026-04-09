import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  LayoutDashboard,
  Users,
  Target,
  ClipboardCheck,
  PhoneForwarded,
  CalendarCheck2,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/components/CustomComponents/apiRequest";
import { Link } from "react-router-dom";

// Metric card component
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

// Helper to get today in YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Admin dashboard cards for Tickets & Tasks
const TicketTaskCards = ({ tickets, tasks }) => {
  // Tickets summary
  const ticketsSummary = useMemo(() => {
    return {
      Opened: tickets.filter((t) => t.status === "Open").length,

      process: tickets.filter((t) => t.status === "In Progress").length,

      Resolved: tickets.filter((t) => t.status === "Resolved").length,

      closed: tickets.filter((t) => t.status === "closed").length,
    };
  }, [tickets]);

  // Tasks summary
  const tasksSummary = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.taskStatusId?.name === "To Do").length,

      inProcess: tasks.filter((t) => t.taskStatusId?.name === "In Progress")
        .length,

      completed: tasks.filter((t) => t.taskStatusId?.name === "Completed")
        .length,

      overdue: tasks.filter((t) => {
        if (!t.dueDate) return false;

        const due = new Date(t.dueDate);
        due.setHours(23, 59, 59, 999);

        return due < new Date() && t.taskStatusId?.name !== "Completed";
      }).length,
    };
  }, [tasks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <MetricCard
        title="Tickets Open"
        value={ticketsSummary.Opened}
        icon={CheckCircle}
        color="green"
      />
      <MetricCard
        title="Tickets In Progress"
        value={ticketsSummary.process}
        icon={Loader}
        color="orange"
      />
      <MetricCard
        title="Tickets Resolved"
        value={ticketsSummary.Resolved}
        icon={CheckCircle}
        color="blue"
      />
      <MetricCard
        title="Tickets Closed"
        value={ticketsSummary.closed}
        icon={UserX}
        color="gray"
      />

      <MetricCard
        title="Tasks Pending"
        value={tasksSummary.pending}
        icon={Loader}
        color="orange"
      />
      <MetricCard
        title="Tasks In Process"
        value={tasksSummary.inProcess}
        icon={Loader}
        color="purple"
      />
      <MetricCard
        title="Tasks Completed"
        value={tasksSummary.completed}
        icon={CheckCircle}
        color="green"
      />
      <MetricCard
        title="Tasks Overdue"
        value={tasksSummary.overdue}
        icon={AlertCircle}
        color="red"
      />
    </motion.div>
  );
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === "Super Admin" || user.role === "Admin";

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        const payload = {
          method: "POST",
          body: JSON.stringify({ clientId: user._id }),
        };
        const ticketPromise = apiRequest("Ticket/getAllTickets/", payload);
        const taskPromise = apiRequest("Client/getClientTasks", payload);

        const [ticketRes, taskRes] = await Promise.all([
          ticketPromise,
          taskPromise,
        ]);

        setAllTickets(ticketRes?.tickets || []);
        setAllTasks(taskRes?.tasks || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Dashboard - ENIS-HRMS</title>
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-3xl font-bold text-white flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-3 text-purple-400" />
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
        </motion.div>

        {loading ? (
          <div className="text-center text-gray-400 pt-10">
            Loading dashboard data...
          </div>
        ) : (
          <TicketTaskCards tickets={allTickets} tasks={allTasks} />
        )}
      </div>
    </>
  );
};

export default ClientDashboard;
