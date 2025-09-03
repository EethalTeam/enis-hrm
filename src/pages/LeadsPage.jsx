
import React, { useState, useMemo, useEffect,useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { UserPlus, Search, Filter, MoreHorizontal, Phone, Mail, Edit, Trash2, Briefcase, DollarSign, Globe, Users, FileText } from 'lucide-react';
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
import { config } from '@/components/CustomComponents/config';
import { useAuth } from '@/contexts/AuthContext';

const LeadForm = ({ open, setOpen, lead, onSave ,getAllLeads}) => {
     const { user } = useAuth();
  const { employees } = useData();
  const [formData, setFormData] = useState(
    lead || {_id:'', companyName: '', contactPerson: '', contactEmail: '', contactPhone: '', status: '',statusId:'', estimatedValue: '', source: '', employee:'',assignedTo:'', lastContact: new Date().toISOString().slice(0,10), nextFollowUp: '' }
  );
  const [Data,SetData] = useState([])
useEffect(()=>{
if(lead){
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
   nextFollowUp: lead.nextFollowUp.split('T')[0] })
}
},[lead])
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSelectChange = (id, name, key, value) => {
  if (key && name) {
    setFormData(prev => ({
      ...prev,
      [id]: key,    
      [name]: value 
    }));
    SetData([]); // clear Data once
  }
};

  const getEmployeeList = async () => {
      try {
         SetData([]); // clear Data once
        let url = config.Api + "Employee/getAllEmployees/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        SetData(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }

 const getLeadStatusList = async () => {
      try {
         SetData([]); // clear Data once
        let url = config.Api + "LeadStatus/getAllLeadStatus/";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
  
        if (!response.ok) {
          throw new Error('Failed to get State');
        }
  
        const result = await response.json();
        SetData(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
  const createLead = async (data) => {
    try {
      let url = config.Api + "Lead/createLead/";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get State');
      }

      SetData([])
      getAllLeads()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
    const updateLead = async (data) => {
    try {
      let url = config.Api + "Lead/updateLead/";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get State');
      }

      SetData([])
      getAllLeads()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    // onSave({ ...formData, estimatedValue: parseFloat(formData.estimatedValue) });
    // createLead({ ...formData, estimatedValue: parseFloat(formData.estimatedValue) })
    if (formData._id) {
      updateLead({ ...formData, estimatedValue: parseFloat(formData.estimatedValue) ,_id:formData._id});
      toast({
        title: 'Lead Updated',
        description: "Lead has been updated successfully.",
      });
    } else {
      createLead({ ...formData, estimatedValue: parseFloat(formData.estimatedValue) });
      toast({
        title: 'Lead Added',
        description: `${formData.name} has been added to the system.`,
      });
    }
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
            <div><Label>Company Name</Label><Input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g., Acme Corp" required className="bg-white/5" /></div>
            <div><Label>Contact Person</Label><Input name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="e.g., John Doe" required className="bg-white/5" /></div>
            <div><Label>Email</Label><Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} placeholder="e.g., john@acme.com" required className="bg-white/5" /></div>
            <div><Label>Phone</Label><Input name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="e.g., +1 555-1234" required className="bg-white/5" /></div>
            <div><Label>Status</Label>
            <Select
                              name="status"
                              value={formData.statusId} // store only _id
                              onOpenChange={async (open) => {
                                if (open && (!Data || Data.length === 0)) {
                                  await getLeadStatusList();
                                }
                              }}
                              onValueChange={(id) => {
                                if (!id) return;
                                const dept = Data.find(d => d._id === id);
                                if (dept) {
                                  handleSelectChange('statusId', 'status', dept._id, dept.statusName);
                                }
                              }}
                              // required
                            >
                              <SelectTrigger className="glass-effect border-white/10">
                                <SelectValue placeholder="Select Status" >
                                  {formData.status}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="glass-effect border-white/10 text-white">
                                {(Data || []).map((dept) => (
                                  <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                                    {dept.statusName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
            </div>
            <div><Label>Lead Value ($)</Label><Input name="estimatedValue" type="number" value={formData.estimatedValue} onChange={handleChange} placeholder="e.g., 50000" required className="bg-white/5" /></div>
            <div><Label>Source</Label><Input name="source" value={formData.source} onChange={handleChange} placeholder="e.g., Website" required className="bg-white/5" /></div>
            <div><Label>Assigned To</Label>
             <Select
                              name="employee"
                              value={formData.assignedTo} // store only _id
                              onOpenChange={async (open) => {
                                if (open && (!Data || Data.length === 0)) {
                                  await getEmployeeList();
                                }
                              }}
                              onValueChange={(id) => {
                                if (!id) return;
                                const dept = Data.find(d => d._id === id);
                                if (dept) {
                                  handleSelectChange('assignedTo', 'employee', dept._id, dept.name);
                                }
                              }}
                              // required
                            >
                              <SelectTrigger className="glass-effect border-white/10">
                                <SelectValue placeholder="Select Employee" >
                                  {formData.employee}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="glass-effect border-white/10 text-white">
                                {(Data || []).map((dept) => (
                                  <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
            </div>
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
  const {user}=useAuth()
  const { deleteLead } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads,setLeads] = useState([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
 const fileInputRef = useRef(null);
  const filteredLeads = useMemo(() => leads.filter(lead => {
    const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [leads, searchTerm, statusFilter]);
  const [loading, setLoading] = useState(false);

const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);

    const excelData = new FormData();
    excelData.append('file', file);

    try {
        let url = config.Api + "importLeadsExcel/";
      const response = await fetch(url, {
        method: 'POST',
        body: excelData,
      });

      const data = await response.json();
      if (res.ok) {
        alert('Leads imported successfully');
      } else {
        alert('Failed to import leads: ' + data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error importing leads');
    } finally {
      setLoading(false);
      e.target.value = null; // reset file input
    }
  };

  
  const handleImportClick = () => {
    fileInputRef.current.click(); // trigger hidden input
  };
  const handleAddLead = () => {
    setSelectedLead(null);
    setIsFormOpen(true);
  };
  useEffect(()=>{
    getAllLeads()
  },[])
  const getAllLeads = async () => {
    try {
      let url = config.Api + "Lead/getAllLeads/";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:user._id,role:user.role}),
      });

      if (!response.ok) {
        throw new Error('Failed to get State');
      }

      const result = await response.json();
      setLeads(result.leads)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteLead(selectedLead._id);
    toast({ title: "Lead Deleted", description: `"${selectedLead.companyName}" has been deleted.` });
    setIsConfirmOpen(false);
    setSelectedLead(null);
  };

  const handleSaveLead = (leadData) => {
    if (selectedLead) {
      updateLead({ ...leadData, id: selectedLead.id });
      toast({ title: "Lead Updated", description: `"${leadData.companyName}" has been updated.` });
    } else {
      createLead(leadData);
      toast({ title: "Lead Added", description: `"${leadData.companyName}" has been created.` });
    }
  };

  const handleContactLead = (lead, method) => {
    toast({
      title: `Simulating ${method} Action`,
      // description: `Contacting ${lead.contactPerson} from ${lead.companyName} via ${method}.`,
      description: "This feature is not yet enabled",
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
        <meta name="description" content="Comprehensive lead management system with pipeline tracking, contactPerson management, and sales analytics for business growth." />
      </Helmet>

      <AnimatePresence>
        {isFormOpen && <LeadForm open={isFormOpen} setOpen={setIsFormOpen} lead={selectedLead} onSave={handleSaveLead} getAllLeads={getAllLeads}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title={`Delete Lead: ${selectedLead?.companyName}`} description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Management</h1>
            <p className="text-gray-400">Track and manage sales leads from all channels.</p>
          </div>
<div>
      <Button onClick={handleImportClick} className="bg-gradient-to-r from-red-500 to-white-600">
        <FileText className="w-4 h-4 mr-2" />
        {loading ? 'Importing...' : 'Import Leads'}
      </Button>
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // hide input
      />
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
          <Card className="metric-card"><CardContent className="p-6"><p className="text-gray-400">Pipeline Value</p><h3 className="text-3xl font-bold">${leads.reduce((s, l) => s + l.estimatedValue, 0).toLocaleString()}</h3></CardContent></Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader><CardTitle className="text-white">Leads</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>Lead</th><th>Contact</th>
                    {/* <th>Value</th> */}
                    <th>Status</th><th>Assigned To</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => {
                      return (
                        <tr key={lead.id}>
                          <td><div className="font-medium text-white">{lead.companyName}</div><div className="text-xs text-gray-400">{lead.source}</div></td>
                          <td><div className="text-white">{lead.contactPerson}</div><div className="text-xs text-gray-400">{lead.contactEmail}</div></td>
                          {/* <td className="text-green-400">${lead.estimatedValue.toLocaleString()}</td> */}
                          <td><span className={`status-badge ${getStatusColor(lead.status)}`}>{lead.statusId.statusName}</span></td>
                          <td>{lead?.assignedTo?.name || 'Unassigned'}</td>
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
