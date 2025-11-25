import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/components/CustomComponents/apiRequest';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const CreateTicketDialog = ({ open, setOpen, priorities, onTicketCreated }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [employees, setEmployees] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch employees for the assignment dropdown
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await apiRequest('Employee/getAllEmployees', {
                    method: 'POST',
                    body: JSON.stringify({ _id: user._id, role: user.role })
                });
                if (Array.isArray(response)) {
                    setEmployees(response);
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch employees." });
            }
        };
        if (open) {
            fetchEmployees();
        }
    }, [open, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            toast({ variant: "destructive", title: "Validation Error", description: "Title and description are required." });
            return;
        }
        setIsSubmitting(true);
        try {
            const body = {
                title,
                description,
                priority,
                createdBy: user._id,
                assignedTo: assignedTo || null,
            };
            const response = await apiRequest('Ticket/create', {
                method: 'POST',
                body: JSON.stringify(body)
            });

            if (response.success) {
                toast({ title: "Success", description: "Ticket created successfully!" });
                onTicketCreated(); // This function will refresh the ticket list
                setOpen(false); // Close the dialog
                // Reset form
                setTitle('');
                setDescription('');
                setPriority('Medium');
                setAssignedTo('');
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
                    <DialogDescription className="text-gray-400">Fill in the details below to raise a new support ticket.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-effect" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="glass-effect" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="glass-effect"><SelectValue /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
                                    {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="assign" className="block text-sm font-medium text-gray-300 mb-1">Assign To (Optional)</label>
                            <Select value={assignedTo} onValueChange={setAssignedTo}>
                                <SelectTrigger className="glass-effect"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
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