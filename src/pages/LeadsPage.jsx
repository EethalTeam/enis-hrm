import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserPlus, Search, MoreHorizontal, Phone, Mail, Edit, Trash2, History } from 'lucide-react'; // Added History icon
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/components/CustomComponents/apiRequest';

// =================== HELPER FUNCTION ===================
// Extracts only the note content, removing the status and timestamp
const parseNoteContent = (noteString) => {
    if (!noteString || typeof noteString !== 'string') return '';
    return noteString.split(' - [Status:')[0].trim();
};

// ===== NEW COMPONENT: Notes History Dialog =====
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
                            // Split the note into its parts for better formatting
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

const LeadForm = ({ open, setOpen, lead, getAllLeads }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [Data, SetData] = useState([]);

    useEffect(() => {
        if (lead) {
            const lastNote = lead.notes && lead.notes.length > 0 ? lead.notes[lead.notes.length - 1] : '';
            const lastNoteContent = parseNoteContent(lastNote);
            setFormData({
                _id: lead._id,
                companyName: lead.companyName,
                contactPerson: lead.contactPerson,
                contactEmail: lead.contactEmail,
                contactPhone: lead.contactPhone,
                status: lead.statusId.statusName,
                statusId: lead.statusId._id,
                estimatedValue: lead.estimatedValue,
                source: lead.source,
                employee: lead.assignedTo.name,
                assignedTo: lead.assignedTo._id,
                lastContact: new Date().toISOString().slice(0, 10),
                nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.split('T')[0] : '',
                notes: '',
                currentNotes:lastNoteContent,
            });
        } else {
            setFormData({ companyName: '', contactPerson: '', contactEmail: '', contactPhone: '', statusId: '', estimatedValue: '', source: '', assignedTo: '', lastContact: new Date().toISOString().slice(0, 10), nextFollowUp: '', notes: '' });
        }
    }, [lead]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (id, name, key, value) => {
        if (key && name) { setFormData(prev => ({ ...prev, [id]: key, [name]: value })); SetData([]); }
    };
    const getEmployeeList = async () => {
        try { SetData([]); const response = await apiRequest("Employee/getAllEmployees/", { method: 'POST', body: JSON.stringify({}), }); SetData(response) } catch (error) { console.error('Error:', error); }
    }
    const getLeadStatusList = async () => {
        try { SetData([]); const response = await apiRequest("LeadStatus/getAllLeadStatus/", { method: 'POST', body: JSON.stringify({}), }); SetData(response) } catch (error) { console.error('Error:', error); }
    }
    const createLead = async (data) => {
        try { await apiRequest("Lead/createLead/", { method: 'POST', body: JSON.stringify(data), }); SetData([]); getAllLeads() } catch (error) { console.error('Error:', error); }
    }
    const updateLead = async (data) => {
        try { await apiRequest("Lead/updateLead/", { method: 'POST', body: JSON.stringify(data), }); SetData([]); getAllLeads() } catch (error) { console.error('Error:', error); }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, estimatedValue: parseFloat(formData.estimatedValue) };
        if (formData._id) {
            updateLead(payload);
            toast({ title: 'Lead Updated', description: "Lead has been updated successfully." });
        } else {
            createLead(payload);
            toast({ title: 'Lead Added', description: `${formData.companyName} has been added.` });
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="glass-effect border-white/10 text-white max-w-2xl" style={{ overflowY: 'auto', height: '90vh', scrollbarWidth: 'none' }}>
                <DialogHeader>
                    <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                    <DialogDescription className="text-gray-400">{lead ? 'Update the details for this lead.' : 'Enter the details for the new sales lead.'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div><Label>Company Name</Label><Input name="companyName" value={formData.companyName || ''} onChange={handleChange} required className="bg-white/5" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Contact Person</Label><Input name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} required className="bg-white/5" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} /></div>
                        <div><Label>Email</Label><Input name="contactEmail" type="email" value={formData.contactEmail || ''} onChange={handleChange} required className="bg-white/5" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} /></div>
                        <div><Label>Phone</Label><Input name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} required className="bg-white/5" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} /></div>
                        <div>
                            <Label>Status</Label>
                            <Select value={formData.statusId || ''} onOpenChange={async(open) => { if (open) await getLeadStatusList(); }} onValueChange={(id) => { if (!id) return; const dept = Data.find(d => d._id === id); if (dept) { handleSelectChange('statusId', 'status', dept._id, dept.statusName); } }}>
                                <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Status">{formData.status}</SelectValue></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
                                    {/* FIX: Removed the invalid <_components.Suspense> wrapper */}
                                    {(Data || []).map((dept) => (
                                        <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">{dept.statusName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label>Lead Value (₹)</Label><Input name="estimatedValue" type="number" value={formData.estimatedValue || ''} onChange={handleChange} required className="bg-white/5" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} /></div>
                        <div><Label>Source</Label><Input name="source" value={formData.source || ''} onChange={handleChange} required className="bg-white/5" disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} /></div>
                        <div>
                            <Label>Assigned To</Label>
                            <Select name="employee" value={formData.assignedTo || ''} onOpenChange={async(open) => { if (open) await getEmployeeList(); }} disabled={(user.role !== 'Super Admin' && user.role !== 'Admin')} onValueChange={(id) => { if (!id) return; const dept = Data.find(d => d._id === id); if (dept) { handleSelectChange('assignedTo', 'employee', dept._id, dept.name); } }}>
                                <SelectTrigger className="glass-effect border-white/10"><SelectValue placeholder="Select Employee">{formData.employee}</SelectValue></SelectTrigger>
                                <SelectContent className="glass-effect border-white/10 text-white">
                                    {/* FIX: Removed the invalid <_components.Suspense> wrapper */}
                                    {(Data || []).map((dept) => (
                                        <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div><Label>Next Follow-up</Label><Input name="nextFollowUp" type="date" value={formData.nextFollowUp || ''} onChange={handleChange} className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert" /></div>
                    </div>
                    <div><Label>Current Notes</Label><Input name="notes" value={formData.currentNotes || ''} onChange={handleChange} placeholder="Add a new note..." className="bg-white/5" disabled/></div>
                        <div><Label>Add New Note</Label><Input name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Add a new note..." className="bg-white/5" /></div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline" className="border-white/10">Cancel</Button></DialogClose>
                        <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save Lead</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const LeadsPage = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    
    // ===== NEW STATE for history dialog =====
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedLeadNotes, setSelectedLeadNotes] = useState([]);
    
    // ... (other state variables are unchanged)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const filteredLeads = useMemo(() => leads.filter(lead => {
        const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || lead.statusId.statusName.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }), [leads, searchTerm, statusFilter]);

    useEffect(() => { getAllLeads() }, []);

    const getAllLeads = async () => {
        try {
            const response = await apiRequest("Lead/getAllLeads/", { method: 'POST', body: JSON.stringify({ _id: user._id, role: user.role }), });
            setLeads(response.leads || []);
        } catch (error) { console.error('Error:', error); }
    }

    // ===== NEW FUNCTION to handle history view =====
    const handleViewHistory = (lead) => {
        setSelectedLeadNotes(lead.notes);
        setIsHistoryOpen(true);
    };
    
    // ... (rest of the functions are unchanged)
    const handleAddLead = () => { setSelectedLead(null); setIsFormOpen(true); };
    const handleEditLead = (lead) => { setSelectedLead(lead); setIsFormOpen(true); };
    const handleDeleteLead = (lead) => { setSelectedLead(lead); setIsConfirmOpen(true); };
    const confirmDelete = () => {
        apiRequest("Lead/deleteLead/", { method: 'POST', body: JSON.stringify({ _id: selectedLead._id }) });
        toast({ title: "Lead Deleted", description: `"${selectedLead.companyName}" has been deleted.` });
        setIsConfirmOpen(false);
        setSelectedLead(null);
        getAllLeads();
    };
    const handleContactLead = () => { toast({ title: "Simulating Action", description: "This feature is not yet enabled" }); };
    const handleImportClick = () => { fileInputRef.current.click(); };
    const handleFileChange = async(e)=>{ /* ... */};

    return (
        <>
            <Helmet><title>Lead Management - ENIS-HRMS</title></Helmet>
            
            <AnimatePresence>
                {isFormOpen && <LeadForm open={isFormOpen} setOpen={setIsFormOpen} lead={selectedLead} getAllLeads={getAllLeads} />}
            </AnimatePresence>
            
            {/* ===== NEW DIALOG for history view ===== */}
            <AnimatePresence>
                {isHistoryOpen && <NotesHistoryDialog open={isHistoryOpen} setOpen={setIsHistoryOpen} notes={selectedLeadNotes} />}
            </AnimatePresence>

            <AnimatePresence>
                {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Lead: ${selectedLead?.companyName}`} description="This action cannot be undone." />}
            </AnimatePresence>

            <div className="space-y-8">
                 {/* ... (Header and filter sections are unchanged) ... */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
                    <div><h1 className="text-3xl font-bold text-white">Lead Management</h1><p className="text-gray-400">Track and manage sales leads.</p></div>
                    <Button onClick={handleAddLead} className="bg-gradient-to-r from-blue-500 to-purple-600"><UserPlus className="w-4 h-4 mr-2" />Add Lead</Button>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="glass-effect border-white/10">
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 glass-effect" /></div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px] glass-effect"><SelectValue /></SelectTrigger><SelectContent className="glass-effect"><SelectItem value="all">All Status</SelectItem><SelectItem value="Hot">Hot</SelectItem><SelectItem value="Warm">Warm</SelectItem><SelectItem value="Cold">Cold</SelectItem><SelectItem value="Qualified">Qualified</SelectItem><SelectItem value="Lost">Lost</SelectItem></SelectContent></Select>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* --- Main Report Table (MODIFIED) --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="glass-effect border-white/10">
                        <CardHeader><CardTitle className="text-white">Leads</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="data-table">
                                    <thead><tr><th>Lead</th><th>Contact</th><th>Status</th><th>Assigned To</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filteredLeads.map(lead => (
                                            <tr key={lead._id}>
                                                <td><div className="font-medium text-white">{lead.companyName}</div><div className="text-xs text-gray-400">{lead.source}</div></td>
                                                <td><div className="text-white">{lead.contactPerson}</div><div className="text-xs text-gray-400">{lead.contactEmail}</div></td>
                                                <td><span className={`status-badge`}>{lead.statusId.statusName}</span></td>
                                                <td>{lead?.assignedTo?.name || 'Unassigned'}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        {/* ===== NEW HISTORY BUTTON ===== */}
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