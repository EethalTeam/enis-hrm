import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Ticket, Plus, Search, UserPlus, MoreVertical, Edit, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';
import TicketStats from '@/components/tickets/TicketStats';
import { apiRequest } from '@/components/CustomComponents/apiRequest';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

// ===================================================================================
// ## SUB-COMPONENT: Create Ticket Dialog
// ===================================================================================
const CreateTicketDialog = ({ open, setOpen, priorities, employees, onTicketCreated }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            toast({ variant: "destructive", title: "Validation Error", description: "Title and description are required." });
            return;
        }
        setIsSubmitting(true);
        try {
            const body = { title, description, priority, createdBy: user._id, assignedTo: assignedTo || null };
            const response = await apiRequest('Ticket/createTicket', { method: 'POST', body: JSON.stringify(body) });

            if (response.success) {
                toast({ title: "Success", description: "Ticket created successfully!" });
                onTicketCreated();
                setOpen(false);
                setTitle(''); setDescription(''); setPriority('Medium'); setAssignedTo('');
            } else {
                 toast({ variant: "destructive", title: "Error", description: response.message || "Failed to create ticket." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to create ticket." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription className="text-gray-400">Fill in the details to raise a new support ticket.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="glass-effect" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="glass-effect" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="glass-effect"><SelectValue /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
                                    {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger className="glass-effect"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white max-h-[200px] overflow-y-auto">
                                    <SelectItem value="">Unassigned</SelectItem>
                                    {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-purple-600">
                            {isSubmitting ? 'Submitting...' : 'Create Ticket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ===================================================================================
// ## NEW SUB-COMPONENT: Edit Ticket Dialog
// ===================================================================================
const EditTicketDialog = ({ open, setOpen, ticket, priorities, onTicketUpdated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (ticket) {
            setTitle(ticket.title);
            setDescription(ticket.description);
            setPriority(ticket.priority);
        }
    }, [ticket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = { ticketId: ticket._id, title, description, priority };
            const response = await apiRequest('Ticket/updateTicket', { method: 'POST', body: JSON.stringify(body) });

            if (response.success) {
                toast({ title: "Success", description: "Ticket updated successfully." });
                onTicketUpdated();
                setOpen(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: response.message || "Failed to update ticket." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update ticket." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Edit Ticket: {ticket?.ticketId}</DialogTitle>
                    <DialogDescription className="text-gray-400">Update the ticket details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="glass-effect" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="glass-effect" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                        <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="glass-effect"><SelectValue /></SelectTrigger>
                            <SelectContent className="glass-effect border-white/10 text-white">
                                {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-purple-600">
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ===================================================================================
// ## NEW SUB-COMPONENT: Update Status Dialog
// ===================================================================================
const UpdateStatusDialog = ({ open, setOpen, ticket, statuses, onTicketUpdated }) => {
    const [newStatus, setNewStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (ticket) setNewStatus(ticket.status);
    }, [ticket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = { ticketId: ticket._id, status: newStatus };
            const response = await apiRequest('Ticket/updateTicketStatus', { method: 'POST', body: JSON.stringify(body) });

            if (response.success) {
                toast({ title: "Success", description: response.message });
                onTicketUpdated();
                setOpen(false);
            } else {
                 toast({ variant: "destructive", title: "Error", description: response.message || "Failed to update status." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update status." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Update Status for {ticket?.ticketId}</DialogTitle>
                </DialogHeader>
                 <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">New Status</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger className="glass-effect"><SelectValue /></SelectTrigger>
                            <SelectContent className="glass-effect border-white/10 text-white">
                                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-purple-600">
                            {isSubmitting ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ===================================================================================
// ## SUB-COMPONENT: Assign Ticket Dialog
// ===================================================================================
const AssignTicketDialog = ({ open, setOpen, ticket, employees, onTicketAssigned }) => {
    const [assignedTo, setAssignedTo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (ticket) setAssignedTo(ticket.assignedTo?._id || '');
    }, [ticket]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const body = { ticketId: ticket._id, employeeId: assignedTo };
            const response = await apiRequest('Ticket/assignTicket', { method: 'POST', body: JSON.stringify(body) });

            if (response.success) {
                toast({ title: "Success", description: response.message });
                onTicketAssigned();
                setOpen(false);
            } else {
                toast({ variant: "destructive", title: "Error", description: response.message || "Failed to assign ticket." });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to assign ticket." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Assign Ticket</DialogTitle>
                    <DialogDescription className="text-gray-400">Assign ticket <span className="font-bold text-white">{ticket?.ticketId}</span> to an employee.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
                        <Select value={assignedTo} onValueChange={setAssignedTo}>
                            <SelectTrigger className="glass-effect"><SelectValue placeholder="Select an employee" /></SelectTrigger>
                            <SelectContent className="glass-effect border-white/10 text-white max-h-[200px] overflow-y-auto">
                                <SelectItem value="">Unassigned</SelectItem>
                                {employees.map(emp => <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-purple-600">
                            {isSubmitting ? 'Assigning...' : 'Assign Ticket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ===================================================================================
// ## MAIN COMPONENT: TicketsPage
// ===================================================================================
const TicketsPage = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    
    // State for all dialogs
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

    const [selectedTicket, setSelectedTicket] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch initial options and employees
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const optionsRes = await apiRequest('Ticket/getTicketOptions', { method: 'POST' });
                if (optionsRes.success) {
                    setStatuses(optionsRes.statuses || []);
                    setPriorities(optionsRes.priorities || []);
                }
                const employeesRes = await apiRequest('Employee/getAllEmployees', { method: 'POST', body: JSON.stringify({ _id: user._id, role: user.role }) });
                if (Array.isArray(employeesRes)) {
                    setEmployees(employeesRes);
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load initial data." });
            }
        };
        fetchInitialData();
    }, [user]);
    
    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const body = { search: debouncedSearchTerm, status: statusFilter, priority: priorityFilter };
            const response = await apiRequest('Ticket/getAllTickets', { method: 'POST', body: JSON.stringify(body) });
            if (response.success) setTickets(response.tickets || []);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not fetch tickets." });
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, statusFilter, priorityFilter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await apiRequest('Ticket/getTicketStats', { method: 'POST' });
            if (response.success) {
                const { total, open, inProgress, resolved } = response.stats;
                setStats([
                    { title: 'Total Tickets', value: total, color: 'from-blue-500 to-cyan-500', icon: Ticket },
                    { title: 'Open Tickets', value: open, color: 'from-red-500 to-pink-500', icon: Ticket },
                    { title: 'In Progress', value: inProgress, color: 'from-yellow-500 to-orange-500', icon: Ticket },
                    { title: 'Resolved', value: resolved, color: 'from-green-500 to-emerald-500', icon: Ticket }
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [tickets, fetchStats]);

    // HANDLERS
    const handleDataUpdate = () => {
        fetchTickets();
        fetchStats();
    };

    const handleOpenDialog = (dialogSetter, ticket) => {
        setSelectedTicket(ticket);
        dialogSetter(true);
    };

    // Helper Functions
    const getStatusColor = (status) => {
        switch (status) {
          case 'Open': return 'text-red-400 bg-red-500/20 border-red-500/30';
          case 'In Progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
          case 'Resolved': return 'text-green-400 bg-green-500/20 border-green-500/30';
          case 'Closed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
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

    return (
        <>
            <Helmet><title>Ticket Management - ENIS-HRMS</title></Helmet>

            <CreateTicketDialog open={isCreateDialogOpen} setOpen={setIsCreateDialogOpen} priorities={priorities} employees={employees} onTicketCreated={handleDataUpdate} />
            <AssignTicketDialog open={isAssignDialogOpen} setOpen={setIsAssignDialogOpen} ticket={selectedTicket} employees={employees} onTicketAssigned={handleDataUpdate} />
            <EditTicketDialog open={isEditDialogOpen} setOpen={setIsEditDialogOpen} ticket={selectedTicket} priorities={priorities} onTicketUpdated={handleDataUpdate} />
            <UpdateStatusDialog open={isStatusDialogOpen} setOpen={setIsStatusDialogOpen} ticket={selectedTicket} statuses={statuses} onTicketUpdated={handleDataUpdate} />

            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Ticket Management</h1>
                        <p className="text-gray-400">Track and resolve support tickets</p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" /> Create Ticket
                    </Button>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <TicketStats stats={stats} />
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass-effect border-white/10">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input placeholder="Search by ID, title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 glass-effect border-white/10 text-white" />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="glass-effect w-full sm:w-48"><SelectValue /></SelectTrigger>
                                    <SelectContent className="glass-effect border-white/10 text-white">
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                    <SelectTrigger className="glass-effect w-full sm:w-48"><SelectValue /></SelectTrigger>
                                    <SelectContent className="glass-effect border-white/10 text-white">
                                         <SelectItem value="all">All Priorities</SelectItem>
                                        {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="glass-effect border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Support Tickets</CardTitle>
                            <CardDescription className="text-gray-400">{isLoading ? 'Loading...' : `${tickets.length} tickets found`}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-400">Loading Tickets...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Ticket ID</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Assigned To</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Priority</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map((ticket) => (
                                                <tr key={ticket._id} className="border-b border-white/10 hover:bg-white/5">
                                                    <td className="py-4 px-4 font-mono text-blue-400">{ticket.ticketId}</td>
                                                    <td className="py-4 px-4 text-white font-medium">{ticket.title}</td>
                                                    <td className="py-4 px-4 text-gray-300">{ticket.assignedTo?.name || <span className="text-gray-500">Unassigned</span>}</td>
                                                    <td className="py-4 px-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>{ticket.status}</span></td>
                                                    <td className="py-4 px-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span></td>
                                                    <td className="py-4 px-4 text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="glass-effect border-white/10 text-white">
                                                                <DropdownMenuItem onClick={() => handleOpenDialog(setIsAssignDialogOpen, ticket)}><UserPlus className="mr-2 h-4 w-4" /> Assign</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleOpenDialog(setIsEditDialogOpen, ticket)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleOpenDialog(setIsStatusDialogOpen, ticket)}><CheckSquare className="mr-2 h-4 w-4" /> Change Status</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))}
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

export default TicketsPage;