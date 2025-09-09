import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Calendar, Plus, Filter, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

const LeaveForm = ({ open, setOpen, leave, onSave, getAllLeaves }) => {
  const { employees } = useData();
  const [formData, setFormData] = useState(
    leave || {_id:'',employee:'', employeeId: '',leaveTypeId:'', leaveType: '', startDate: '', endDate: '', reason: '', RequestStatusId: '',RequestStatus:'',requestedToId:'',requestedTo:'' }
  );
    const [Data,SetData] = useState([])
  useEffect(()=>{
  if(leave){
  setFormData({
     _id: leave._id,
     employeeId: leave.employeeId._id,
     employee: leave.employeeId.name,
     leaveTypeId: leave.leaveTypeId._id,
     leaveType: leave.leaveTypeId.LeaveTypeName,
     RequestStatus: leave.RequestStatusId.StatusName,
     RequestStatusId: leave.RequestStatusId._id,
     startDate: leave.startDate.split('T')[0],
     endDate: leave.endDate.split('T')[0],
     requestedTo: leave.requestedTo.name,
     requestedToId: leave.requestedTo._id,
     totalDays: leave.totalDays,
     reason: leave.reason})
  }
  },[leave])

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

 const getLeaveTypeList = async () => {
      try {
         SetData([]); // clear Data once
        let url = config.Api + "LeaveType/getAllLeaveType/";
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
  const createLeave = async (data) => {
    try {
      let url = config.Api + "Leave/createLeave/";
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
      getAllLeaves()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
    const updateLeave = async (data) => {
    try {
      let url = config.Api + "Leave/updateLeave/";
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
      getAllLeaves()
      // setFilteredData(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    // onSave({ ...formData, totalDays, appliedOn: new Date().toISOString().slice(0, 10) });
     if (formData._id) {
          updateLeave({ ...formData, totalDays, appliedOn: new Date().toISOString().slice(0, 10) });
          toast({
            title: 'Leave Updated',
            description: "Leave has been updated successfully.",
          });
        } else {
          createLeave({ ...formData, totalDays, appliedOn: new Date().toISOString().slice(0, 10) });
          toast({
            title: 'Leave Added',
            description: `Leave Request has been added to the system.`,
          });
        }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{leave ? 'Edit Leave Request' : 'Apply for Leave'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                      <Select
                                       name="employee"
                                       value={formData.employeeId} // store only _id
                                       onOpenChange={async (open) => {
                                         if (open && (!Data || Data.length === 0)) {
                                           await getEmployeeList();
                                         }
                                       }}
                                       onValueChange={(id) => {
                                         if (!id) return;
                                         const dept = Data.find(d => d._id === id);
                                         if (dept) {
                                           handleSelectChange('employeeId', 'employee', dept._id, dept.name);
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
                     <Select
                                       name="leaveType"
                                       value={formData.leaveTypeId} // store only _id
                                       onOpenChange={async (open) => {
                                         if (open && (!Data || Data.length === 0)) {
                                           await getLeaveTypeList();
                                         }
                                       }}
                                       onValueChange={(id) => {
                                         if (!id) return;
                                         const dept = Data.find(d => d._id === id);
                                         if (dept) {
                                           handleSelectChange('leaveTypeId', 'leaveType', dept._id, dept.LeaveTypeName);
                                         }
                                       }}
                                       // required
                                     >
                                       <SelectTrigger className="glass-effect border-white/10">
                                         <SelectValue placeholder="Select Leave Type" >
                                           {formData.leaveType}
                                         </SelectValue>
                                       </SelectTrigger>
                                       <SelectContent className="glass-effect border-white/10 text-white">
                                         {(Data || []).map((dept) => (
                                           <SelectItem key={dept._id} value={dept._id} className="hover:bg-white/10">
                                             {dept.LeaveTypeName}
                                           </SelectItem>
                                         ))}
                                       </SelectContent>
                                     </Select>
                                      <Select
                                       name="requestedTo"
                                       value={formData.requestedToId} // store only _id
                                       onOpenChange={async (open) => {
                                         if (open && (!Data || Data.length === 0)) {
                                           await getEmployeeList();
                                         }
                                       }}
                                       onValueChange={(id) => {
                                         if (!id) return;
                                         const dept = Data.find(d => d._id === id);
                                         if (dept) {
                                           handleSelectChange('requestedToId', 'requestedTo', dept._id, dept.name);
                                         }
                                       }}
                                       // required
                                     >
                                       <SelectTrigger className="glass-effect border-white/10">
                                         <SelectValue placeholder="Request To" >
                                           {formData.requestedTo}
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
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Start Date</Label><Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100" /></div>
            <div><Label>End Date</Label><Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="bg-white/5 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100" /></div>
          </div>
          <Input name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason for leave" required className="bg-white/5" />
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const LeavesPage = () => {
  const { leaves, employees, addLeave, updateLeave, deleteLeave } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [Leaves,setLeaves] = useState([])
  const [Employees,setEmployees] = useState([])
  const [Status,setStatus]=useState([])

  const filteredRequests = Leaves.filter(request => {
    const employee = Employees.find(e => e._id === request.employeeId._id);
    const matchesSearch = (employee?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.leaveTypeId.LeaveTypeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.RequestStatusId.StatusName.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(()=>{
    getAllLeaves()
    getAllEmployees()
    getAllLeaveStatus()
  },[])

    const getAllLeaves = async () => {
      try {
        let url = config.Api + "Leave/getAllLeaves/";
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
        setLeaves(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
        const getAllEmployees = async () => {
      try {
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
        setEmployees(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
        const getAllLeaveStatus = async () => {
      try {
        let url = config.Api + "LeaveStatus/getAllLeaveStatus/";
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
        setStatus(result)
        // setState(result)
        // setFilteredData(result)
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
  const handleApplyLeave = () => {
    setSelectedLeave(null);
    setIsFormOpen(true);
  };

  const handleEditLeave = (leave) => {
    setSelectedLeave(leave);
    setIsFormOpen(true);
  };

  const handleDeleteLeave = (leave) => {
    setSelectedLeave(leave);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteLeave(selectedLeave.id);
    toast({ title: "Leave Request Deleted" });
    setIsConfirmOpen(false);
  };

  const handleSaveLeave = (leaveData) => {
    if (selectedLeave) {
      updateLeave({ ...leaveData, id: selectedLeave.id });
      toast({ title: "Leave Request Updated" });
    } else {
      addLeave(leaveData);
      toast({ title: "Leave Request Submitted" });
    }
  };

  const handleStatusChange = (leave, status) => {
    updateLeave({ ...leave, status });
    toast({ title: `Leave ${status}`, description: `Leave request for ${Employees.find(e => e._id === leave.employeeId)?.name} has been ${status.toLowerCase()}.` });
  };

  return (
    <>
      <Helmet>
        <title>Leave Management - ENIS-HRMS</title>
        <meta name="description" content="Manage employee leave requests, track leave balances, and streamline approval processes." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <LeaveForm open={isFormOpen} setOpen={setIsFormOpen} leave={selectedLeave} onSave={handleSaveLeave} getAllLeaves={getAllLeaves}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Leave Request?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Leave Management</h1>
            <p className="text-gray-400">Manage employee leave requests and approvals</p>
          </div>
          <Button onClick={handleApplyLeave} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Apply for Leave</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Input placeholder="Search by employee or type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="glass-effect" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] glass-effect"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader><CardTitle className="text-white">Leave Requests</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Employee</th><th>Leave Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredRequests.map(request => {
                      const employee = Employees.find(e => e._id === request.employeeId._id);
                      return (
                        <tr key={request.id}>
                          <td>{request.employeeId.name}</td>
                          <td>{request.leaveTypeId.LeaveTypeName}</td>
                          <td>{request.startDate.split('T')[0].split('-').reverse().join('-')} to {request.endDate.split('T')[0].split('-').reverse().join('-')}</td>
                          <td>{request.totalDays}</td>
                          <td>{request.reason}</td>
                          <td><span className={`status-badge ${request.RequestStatusId.StatusName === 'Approved' ? 'status-active' : request.RequestStatusId.StatusName === 'Pending' ? 'status-pending' : 'status-inactive'}`}>{request.RequestStatusId.StatusName}</span></td>
                          <td>
                            <div className="flex gap-2">
                              {request.status === 'Pending' && (
                                <>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400" onClick={() => handleStatusChange(request, 'Approved')}><CheckCircle className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleStatusChange(request, 'Rejected')}><XCircle className="w-4 h-4" /></Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditLeave(request)}><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDeleteLeave(request)}><Trash2 className="w-4 h-4" /></Button>
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

export default LeavesPage;
