import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Ticket, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import TicketStats from '@/components/tickets/TicketStats';
import TicketList from '@/components/tickets/TicketList';

const TicketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const tickets = [
    {
      id: 'TKT-001',
      title: 'Login Issues with HRMS Portal',
      description: 'Unable to access the HRMS portal after password reset',
      category: 'Login Issue',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Karthi',
      createdBy: 'Madhan Kumar',
      createdAt: '2024-02-20T10:30:00Z',
      updatedAt: '2024-02-20T14:15:00Z',
      dueDate: '2024-02-22T17:00:00Z'
    }
  ];

  const ticketStats = [
    { title: 'Total Tickets', value: tickets.length, color: 'from-blue-500 to-cyan-500', icon: Ticket },
    { title: 'Open Tickets', value: tickets.filter(t => t.status === 'Open').length, color: 'from-red-500 to-pink-500', icon: Ticket },
    { title: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, color: 'from-yellow-500 to-orange-500', icon: Ticket },
    { title: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length, color: 'from-green-500 to-emerald-500', icon: Ticket }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || ticket.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTicket = () => toast({ title: "🚧 Feature Coming Soon!" });
  const handleEditTicket = () => toast({ title: "🚧 Feature Coming Soon!" });
  const handleAssignTicket = () => toast({ title: "🚧 Feature Coming Soon!" });
  const handleUpdateStatus = () => toast({ title: "🚧 Feature Coming Soon!" });
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'In Progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Resolved': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'Low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Login Issue': return '💻';
      case 'Payroll': return '💰';
      case 'Facilities': return '🏢';
      case 'HR': return '👥';
      default: return '🎫';
    }
  };

  return (
    <>
      <Helmet>
        <title>Ticket Management - ENIS-HRMS</title>
        <meta name="description" content="Comprehensive ticket management system with issue tracking, priority management, and automated workflows for efficient support." />
      </Helmet>

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Ticket Management</h1>
            <p className="text-gray-400">Track and resolve support tickets</p>
          </div>
          <Button onClick={handleCreateTicket} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <TicketStats stats={ticketStats} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-effect border-white/10 text-white placeholder-gray-400"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 glass-effect border border-white/10 rounded-md text-white bg-transparent"
                >
                  <option value="all" className="bg-slate-800">All Status</option>
                  <option value="open" className="bg-slate-800">Open</option>
                  <option value="in progress" className="bg-slate-800">In Progress</option>
                  <option value="resolved" className="bg-slate-800">Resolved</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 glass-effect border border-white/10 rounded-md text-white bg-transparent"
                >
                  <option value="all" className="bg-slate-800">All Priority</option>
                  <option value="high" className="bg-slate-800">High</option>
                  <option value="medium" className="bg-slate-800">Medium</option>
                  <option value="low" className="bg-slate-800">Low</option>
                </select>
                <Button variant="outline" className="border-white/10 hover:bg-white/10">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Support Tickets</CardTitle>
              <CardDescription className="text-gray-400">
                {filteredTickets.length} of {tickets.length} tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TicketList 
                tickets={filteredTickets}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
                getCategoryIcon={getCategoryIcon}
                handleEditTicket={handleEditTicket}
                handleAssignTicket={handleAssignTicket}
                handleUpdateStatus={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default TicketsPage;