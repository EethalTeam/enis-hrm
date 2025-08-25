
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserPlus, Search, Filter, MoreHorizontal, Phone, Mail, Edit, Trash2, Briefcase, DollarSign, Globe, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const LeadForm = ({ open, setOpen, lead, onSave }) => {
  const { employees } = useData();
  const [formData, setFormData] = useState(
    lead || { name: '', contact: '', email: '', phone: '', status: 'Cold', value: '', source: '', assignedTo: '', lastContact: new Date().toISOString().slice(0,10), nextFollowUp: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, value: parseFloat(formData.value) });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {lead ? 'Update the details for this lead.' : 'Enter the details for the new sales lead.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Acme Corp" required className="bg-white/5" /></div>
            <div><Label>Contact Person</Label><Input name="contact" value={formData.contact} onChange={handleChange} placeholder="e.g., John Doe" required className="bg-white/5" /></div>
            <div><Label>Email</Label><Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g., john@acme.com" required className="bg-white/5" /></div>
            <div><Label>Phone</Label><Input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., +1 555-1234" required className="bg-white/5" /></div>
            <div><Label>Status</Label><Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger className="bg-white/5"><SelectValue/></SelectTrigger><SelectContent className="glass-effect"><SelectItem value="Hot">Hot</SelectItem><SelectItem value="Warm">Warm</SelectItem><SelectItem value="Cold">Cold</SelectItem><SelectItem value="Qualified">Qualified</SelectItem><SelectItem value="Lost">Lost</SelectItem></SelectContent></Select></div>
            <div><Label>Lead Value ($)</Label><Input name="value" type="number" value={formData.value} onChange={handleChange} placeholder="e.g., 50000" required className="bg-white/5" /></div>
            <div><Label>Source</Label><Input name="source" value={formData.source} onChange={handleChange} placeholder="e.g., Website" required className="bg-white/5" /></div>
            <div><Label>Assigned To</Label><Select name="assignedTo" value={formData.assignedTo} onValueChange={(v) => handleSelectChange('assignedTo', v)}><SelectTrigger className="bg-white/5"><SelectValue placeholder="Select Employee"/></SelectTrigger><SelectContent className="glass-effect">{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Next Follow-up</Label><Input name="nextFollowUp" type="date" value={formData.nextFollowUp} onChange={handleChange} className="bg-white/5" /></div>
          </div>
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
  const { leads, employees, addLead, updateLead, deleteLead } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredLeads = useMemo(() => leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [leads, searchTerm, statusFilter]);

  const handleAddLead = () => {
    setSelectedLead(null);
    setIsFormOpen(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteLead(selectedLead.id);
    toast({ title: "Lead Deleted", description: `"${selectedLead.name}" has been deleted.` });
    setIsConfirmOpen(false);
    setSelectedLead(null);
  };

  const handleSaveLead = (leadData) => {
    if (selectedLead) {
      updateLead({ ...leadData, id: selectedLead.id });
      toast({ title: "Lead Updated", description: `"${leadData.name}" has been updated.` });
    } else {
      addLead(leadData);
      toast({ title: "Lead Added", description: `"${leadData.name}" has been created.` });
    }
  };

  const handleContactLead = (lead, method) => {
    toast({
      title: `Simulating ${method} Action`,
      description: `Contacting ${lead.contact} from ${lead.name} via ${method}.`,
    });
  };

  const getStatusColor = (status) => ({
    'Hot': 'text-red-400 bg-red-500/20 border-red-500/30',
    'Warm': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    'Cold': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    'Qualified': 'text-green-400 bg-green-500/20 border-green-500/30',
    'Lost': 'text-gray-500 bg-gray-500/20 border-gray-500/30',
  }[status] || 'text-gray-400 bg-gray-500/20 border-gray-500/30');

  return (
    <>
      <Helmet>
        <title>Lead Management - ENIS-HRMS</title>
        <meta name="description" content="Comprehensive lead management system with pipeline tracking, contact management, and sales analytics for business growth." />
      </Helmet>

      <AnimatePresence>
        {isFormOpen && <LeadForm open={isFormOpen} setOpen={setIsFormOpen} lead={selectedLead} onSave={handleSaveLead} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Lead: ${selectedLead?.name}`} description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Management</h1>
            <p className="text-gray-400">Track and manage sales leads from all channels.</p>
          </div>
          <Button onClick={handleAddLead} className="bg-gradient-to-r from-blue-500 to-purple-600"><UserPlus className="w-4 h-4 mr-2" />Add Lead</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 glass-effect" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] glass-effect"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                    <SelectItem value="Warm">Warm</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Total Leads</p><h3 className="text-3xl font-bold">{leads.length}</h3></CardContent></Card>
          <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Hot Leads</p><h3 className="text-3xl font-bold">{leads.filter(l => l.status === 'Hot').length}</h3></CardContent></Card>
          <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Qualified</p><h3 className="text-3xl font-bold">{leads.filter(l => l.status === 'Qualified').length}</h3></CardContent></Card>
          <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Pipeline Value</p><h3 className="text-3xl font-bold">${leads.reduce((s, l) => s + l.value, 0).toLocaleString()}</h3></CardContent></Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader><CardTitle className="text-white">Leads</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Lead</th><th>Contact</th><th>Value</th><th>Status</th><th>Assigned To</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => {
                      const assignee = employees.find(e => e.id === lead.assignedTo);
                      return (
                        <tr key={lead.id}>
                          <td><div className="font-medium text-white">{lead.name}</div><div className="text-xs text-gray-400">{lead.source}</div></td>
                          <td><div className="text-white">{lead.contact}</div><div className="text-xs text-gray-400">{lead.email}</div></td>
                          <td className="text-green-400">${lead.value.toLocaleString()}</td>
                          <td><span className={`status-badge ${getStatusColor(lead.status)}`}>{lead.status}</span></td>
                          <td>{assignee?.name || 'Unassigned'}</td>
                          <td>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleContactLead(lead, 'Email')}><Mail className="w-4 h-4"/></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleContactLead(lead, 'Call')}><Phone className="w-4 h-4"/></Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4"/></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-effect">
                                  <DropdownMenuItem onClick={() => handleEditLead(lead)}><Edit className="w-4 h-4 mr-2"/>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400" onClick={() => handleDeleteLead(lead)}><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
