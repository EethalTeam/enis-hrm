import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserPlus, Search, MoreHorizontal, Phone, Mail, Edit, Trash2, History ,FileText} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { config } from '@/components/CustomComponents/config'; // Assuming config is used by handleFileChange
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest';

// =================== HELPER FUNCTION ===================
const parseNoteContent = (noteString) => {
    if (!noteString || typeof noteString !== 'string') return '';
    return noteString.split(' - [Status:')[0].trim();
};

// =======================================================
// ===== COMPONENT: Notes History Dialog
// =======================================================
const NotesHistoryDialog = ({ open, setOpen, notes }) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect border-white/10 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Notes History</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        A complete log of all notes for this lead.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-4">
                    {notes && notes.length > 0 ? (
                        [...notes].reverse().map((note, index) => {
                            const parts = note.split(' - ');
                            const content = parts[0] || '';
                            const status = parts[1] || '';
                            const timestamp = parts[2] || '';

                            return (
                                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                    <p className="text-white mb-2">{content}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span className="bg-gray-500/20 px-2 py-1 rounded">{status.replace(/\[|\]/g, '')}</span>
                                        <span>{timestamp.replace(/\[|\]/g, '')}</span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-400 text-center py-8">No notes history found for this lead.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// =======================================================
// ===== COMPONENT: Lead Form (Rebuilt for HR Schema)
// =======================================================
const LeadForm = ({ open, setOpen, lead, getAllLeads, leadStatuses, employees }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});

    // Helper to format dates for input[type="date"]
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    useEffect(() => {
        if (lead) {
            // EDITING an existing lead
            const lastNote = lead.notes && lead.notes.length > 0 ? lead.notes[lead.notes.length - 1] : '';
            const lastNoteContent = parseNoteContent(lastNote);
            setFormData({
                _id: lead._id,
                leadName: lead.leadName || '',
                leadCode: lead.leadCode || '',
                leadPhoneNumber: lead.leadPhoneNumber || '',
                leadDate: formatDateForInput(lead.leadDate),
                experience: lead.experience || '',
                currentCTC: lead.currentCTC || '',
                expectedCTC: lead.expectedCTC || '',
                appliedTo: lead.appliedTo || '',
                currentRole: lead.currentRole || '',
                leadFeedback: lead.leadFeedback || '',
                interViewDate: formatDateForInput(lead.interViewDate),
                leadLocation: lead.leadLocation || '',
                leadComments: lead.leadComments || '',
                statusId: lead.statusId?._id || '',
                assignedTo: lead.assignedTo?._id || '',
                nextFollowUp: formatDateForInput(lead.nextFollowUp),
                notes: '', // Always empty for adding a *new* note
                currentNotes: lastNoteContent, // Display the last note
            });
        } else {
            // CREATING a new lead
            setFormData({
                leadName: '',
                leadCode: '',
                leadPhoneNumber: '',
                leadDate: new Date().toISOString().split('T')[0],
                experience: '',
                currentCTC: '',
                expectedCTC: '',
                appliedTo: '',
                currentRole: '',
                leadFeedback: '',
                interViewDate: '',
                leadLocation: '',
                leadComments: '',
                statusId: '',
                assignedTo: user._id, // Default to current user
                nextFollowUp: '',
                notes: '',
            });
        }
    }, [lead, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData };
        
        try {
            if (payload._id) {
                // UPDATE LEAD
                await apiRequest("Lead/updateLead/", { method: 'POST', body: JSON.stringify(payload) });
                toast({ title: 'Lead Updated', description: "Lead has been updated successfully." });
            } else {
                // CREATE LEAD
                await apiRequest("Lead/createLead/", { method: 'POST', body: JSON.stringify(payload) });
                toast({ title: 'Lead Added', description: `${payload.leadName} has been added.` });
            }
            getAllLeads(); // Refresh the list
            setOpen(false); // Close the dialog
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({ variant: "destructive", title: 'Error', description: error.message || "Failed to save lead." });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect border-white/10 text-white max-w-4xl" style={{ overflowY: 'auto', height: '90vh', scrollbarWidth: 'none' }}>
                <DialogHeader>
                    <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                    <DialogDescription className="text-gray-400">{lead ? 'Update the candidate details.' : 'Enter the details for the new candidate.'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    
                    {/* --- Candidate Details --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label>Lead Name *</Label><Input name="leadName" value={formData.leadName || ''} onChange={handleChange} required className="bg-white/5" /></div>
                        <div><Label>Lead Phone *</Label><Input name="leadPhoneNumber" value={formData.leadPhoneNumber || ''} onChange={handleChange} required className="bg-white/5" /></div>
                        <div><Label>Lead Date *</Label><Input name="leadDate" type="date" value={formData.leadDate || ''} onChange={handleChange} required className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert" /></div>
                    </div>

                    {/* --- Role & Experience Details --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label>Applied For</Label><Input name="appliedTo" value={formData.appliedTo || ''} onChange={handleChange} className="bg-white/5" /></div>
                        <div><Label>Current Role</Label><Input name="currentRole" value={formData.currentRole || ''} onChange={handleChange} className="bg-white/5" /></div>
                        <div><Label>Experience</Label><Input name="experience" value={formData.experience || ''} onChange={handleChange} className="bg-white/5" /></div>
                    </div>

                    {/* --- CTC Details --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label>Current CTC</Label><Input name="currentCTC" value={formData.currentCTC || ''} onChange={handleChange} className="bg-white/5" /></div>
                        <div><Label>Expected CTC</Label><Input name="expectedCTC" value={formData.expectedCTC || ''} onChange={handleChange} className="bg-white/5" /></div>
                        <div><Label>Location</Label><Input name="leadLocation" value={formData.leadLocation || ''} onChange={handleChange} className="bg-white/5" /></div>
                    </div>

                    {/* --- Status & Follow-up --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Status *</Label>
                            <Select value={formData.statusId || ''} onValueChange={(value) => handleSelectChange('statusId', value)} required>
                                <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
                                    {leadStatuses.map((status) => (
                                        <SelectItem key={status._id} value={status._id} className="hover:bg-white/10">{status.statusName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Recruiter (Assigned To)</Label>
                            <Select value={formData.assignedTo || ''} onValueChange={(value) => handleSelectChange('assignedTo', value)}>
                                <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Employee" /></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
                                    {employees.map((emp) => (
                                        <SelectItem key={emp._id} value={emp._id} className="hover:bg-white/10">{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label>Lead Code</Label><Input name="leadCode" value={formData.leadCode || ''} onChange={handleChange} className="bg-white/5" /></div>
                    </div>

                    {/* --- Interview & Feedback --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div><Label>Interview Date</Label><Input name="interViewDate" type="date" value={formData.interViewDate || ''} onChange={handleChange} className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert" /></div>
                         <div><Label>Next Follow-up</Label><Input name="nextFollowUp" type="date" value={formData.nextFollowUp || ''} onChange={handleChange} className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert" /></div>
                    </div>

                    <div><Label>Feedback</Label><Input name="leadFeedback" value={formData.leadFeedback || ''} onChange={handleChange} placeholder="e.g., Interested, Not Answering" className="bg-white/5" /></div>
                    <div><Label>Comments</Label><Input name="leadComments" value={formData.leadComments || ''} onChange={handleChange} placeholder="Add comments..." className="bg-white/5" /></div>

                    <hr className="border-white/10 my-4" />

                    {/* --- Notes --- */}
                    {lead && (
                        <div><Label>Current Notes</Label><Input value={formData.currentNotes || ''} className="bg-black/20" disabled/></div>
                    )}
                    <div><Label>{lead ? 'Add New Note' : 'Add Note'}</Label><Input name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Add a new note..." className="bg-white/5" /></div>
                    
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" className="border-white/10">Cancel</Button></DialogClose>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Lead</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// =======================================================
// ===== MAIN PAGE: LeadsPage
// =======================================================
const LeadsPage = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [leadStatuses, setLeadStatuses] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedLeadNotes, setSelectedLeadNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // UPDATED: Search logic for new schema
    const filteredLeads = useMemo(() => leads.filter(lead => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            (lead.leadName && lead.leadName.toLowerCase().includes(term)) ||
            (lead.leadCode && lead.leadCode.toLowerCase().includes(term)) ||
            (lead.leadPhoneNumber && lead.leadPhoneNumber.toLowerCase().includes(term));
            
        const matchesStatus = statusFilter === 'all' || lead.statusId._id === statusFilter;
        return matchesSearch && matchesStatus;
    }), [leads, searchTerm, statusFilter]);

    // Fetch all necessary data on load
    useEffect(() => {
        getAllLeads();
        getLeadStatuses();
        getEmployees();
    }, []);

    const getAllLeads = async () => {
        try {
            const response = await apiRequest("Lead/getAllLeads/", { method: 'POST', body: JSON.stringify({ _id: user._id, role: user.role }), });
            setLeads(response.leads || []);
        } catch (error) { console.error('Error fetching leads:', error); }
    }

    const getLeadStatuses = async () => {
         try { 
            const response = await apiRequest("LeadStatus/getAllLeadStatus/", { method: 'POST', body: JSON.stringify({}), }); 
            setLeadStatuses(response || []);
        } catch (error) { console.error('Error fetching statuses:', error); }
    }
    
    const getEmployees = async () => {
         try { 
            const response = await apiRequest("Employee/getAllEmployees/", { method: 'POST', body: JSON.stringify({}), }); 
            setEmployees(response || []);
        } catch (error) { console.error('Error fetching employees:', error); }
    }

    const handleViewHistory = (lead) => {
        setSelectedLeadNotes(lead.notes);
        setIsHistoryOpen(true);
    };
    
    const handleAddLead = () => { setSelectedLead(null); setIsFormOpen(true); };
    const handleEditLead = (lead) => { setSelectedLead(lead); setIsFormOpen(true); };
    const handleDeleteLead = (lead) => { setSelectedLead(lead); setIsConfirmOpen(true); };
    
    const confirmDelete = async () => {
        try {
            await apiRequest("Lead/deleteLead/", { method: 'POST', body: JSON.stringify({ _id: selectedLead._id }) });
            toast({ title: "Lead Deleted", description: `"${selectedLead.leadName}" has been deleted.` });
            setIsConfirmOpen(false);
            setSelectedLead(null);
            getAllLeads();
        } catch (error) {
            console.error('Error deleting lead:', error);
            toast({ variant: "destructive", title: 'Error', description: "Failed to delete lead." });
        }
    };
    
    const handleContactLead = () => { toast({ title: "Simulating Action", description: "This feature is not yet enabled" }); };
    
    // UPDATED: handleFileChange to use apiRequest and handle errors
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        setLoading(true);
    
        const excelData = new FormData();
        excelData.append('file', file);
    
        try {
            // Use your apiRequest wrapper
            // NOTE: Make sure your apiRequest can handle FormData and doesn't
            // automatically set Content-Type to application/json
            const response = await apiRequest("api/importLeadsExcel/", { 
                method: 'POST', 
                body: excelData 
            });
    
            if (response && (response.leads || response.message === "File received. Leads are being imported in the background.")) {
                toast({
                    title: 'Import Started',
                    description: response.message || `${response.leads.length} leads were imported.`
                });
                getAllLeads(); // Refresh the leads list
            } else {
                toast({
                    variant: "destructive",
                    title: 'Import Failed',
                    description: response.message || 'An unknown error occurred.'
                });
            }
        } catch (error) {
            console.error('Import Error:', error);
            toast({
                variant: "destructive",
                title: 'Import Error',
                description: error.message || 'A network error occurred. Please check the console.'
            });
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = null; // reset file input
            }
        }
    };

    const handleImportClick = () => { fileInputRef.current.click(); };

    return (
        <>
            <Helmet><title>Lead Management - ENIS-HRMS</title></Helmet>
            
            <AnimatePresence>
                {isFormOpen && <LeadForm 
                    open={isFormOpen} 
                    setOpen={setIsFormOpen} 
                    lead={selectedLead} 
                    getAllLeads={getAllLeads}
                    leadStatuses={leadStatuses}
                    employees={employees} 
                />}
            </AnimatePresence>
            
            <AnimatePresence>
                {isHistoryOpen && <NotesHistoryDialog open={isHistoryOpen} setOpen={setIsHistoryOpen} notes={selectedLeadNotes} />}
            </AnimatePresence>

            <AnimatePresence>
                {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Lead: ${selectedLead?.leadName}`} description="This action cannot be undone." />}
            </AnimatePresence>

            <div className="space-y-8">
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                    <div><h1 className="text-3xl font-bold text-white">Lead Management (HR)</h1><p className="text-gray-400">Track and manage candidates.</p></div>
                    <div className="flex gap-4">
                        <Button onClick={handleImportClick} className="bg-gradient-to-r from-green-500 to-green-600">
                            <FileText className="w-4 h-4 mr-2" />
                            {loading ? 'Importing...' : 'Import Leads'}
                        </Button>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <Button onClick={handleAddLead} className="bg-gradient-to-r from-blue-500 to-purple-600"><UserPlus className="w-4 h-4 mr-2" />Add Lead</Button>
                    </div>
                </motion.div>
                
                {/* --- UPDATED FILTER --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="glass-effect border-white/10">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search by name, code, or phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 glass-effect" /></div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] glass-effect"><SelectValue placeholder="All Status" /></SelectTrigger>
                                    <SelectContent className="glass-effect border-white/10 text-white">
                                        <SelectItem value="all">All Status</SelectItem>
                                        {leadStatuses.map((status) => (
                                            <SelectItem key={status._id} value={status._id}>{status.statusName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* --- UPDATED TABLE --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="glass-effect border-white/10">
                        <CardHeader><CardTitle className="text-white">Candidates</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead><tr><th>Candidate</th><th>Contact</th><th>Feedback</th><th>Recruiter</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredLeads.map(lead => (
                                            <tr key={lead._id}>
                                                <td><div className="font-medium text-white">{lead.leadName}</div><div className="text-xs text-gray-400">{lead.leadCode}</div></td>
                                                <td><div className="text-white">{lead.leadPhoneNumber}</div><div className="text-xs text-gray-400">{lead.leadLocation}</div></td>
                                                <td><span className={`status-badge`}>{lead.leadFeedback || 'N/A'}</span></td>
                                                <td>{lead?.assignedTo?.name || 'Unassigned'}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-cyan-400" onClick={() => handleViewHistory(lead)}><History className="w-4 h-4" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleContactLead}><Mail className="w-4 h-4" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleContactLead}><Phone className="w-4 h-4" /></Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="glass-effect">
                                                                <DropdownMenuItem onClick={() => handleEditLead(lead)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-400" onClick={() => handleDeleteLead(lead)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
};

export default LeadsPage;