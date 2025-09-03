import React, { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Hourglass, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { config } from '@/components/CustomComponents/config';

const PermissionForm = ({ open, setOpen, permission, onSave, getAllPermissions }) => {
  const { employees, roles } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState(
    permission || {_id:'', employee:user.name,employeeId: user._id, permissionDate: '',fromTime:'',toTime:'', totalHours: 0, reason: '', RequestStatus: '',RequestStatusId:'',requestedTo:'',requestedToName:''  }
  );
    const [Data,SetData] = useState([])
  useEffect(()=>{
  if(permission){
  setFormData({
     _id: permission._id,
     employeeId: permission.employeeId._id,
     employee: permission.employeeId.name,
     permissionDate: permission.permissionDate.split('T')[0],
     RequestStatus: permission.RequestStatusId?.StatusName,
     RequestStatusId: permission.RequestStatusId?._id,
     fromTime: permission.fromTime,
     toTime: permission.toTime,
     requestedTo: permission.requestedTo._id,
     requestedToName: permission.requestedTo.name,
     totalHours: permission.totalHours || 0,
     reason: permission.reason})
  }
  },[permission])
  useEffect(()=>{
    let hours=calculateTotalHours(formData.fromTime,formData.toTime)
 setFormData(prev => ({ ...prev, totalHours: hours.toFixed(1) }));
  },[formData.fromTime,formData.toTime])
  function calculateTotalHours(fromTime, toTime) {
  if (!fromTime || !toTime) return 0;

  // Convert HH:MM (24h format) to Date objects
  const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
  const [toHours, toMinutes] = toTime.split(":").map(Number);

  const fromDate = new Date(0, 0, 0, fromHours, fromMinutes, 0);
  const toDate = new Date(0, 0, 0, toHours, toMinutes, 0);

  let diff = (toDate - fromDate) / (1000 * 60 * 60); // in hours

  // Handle case when toTime is past midnight (next day)
  if (diff < 0) {
    diff += 24;
  }

  return diff;
}


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
      const createPermission = async (data) => {
        try {
          let url = config.Api + "Permission/createPermission/";
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
          getAllPermissions()
          // setFilteredData(result)
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      }
        const updatePermission = async (data) => {
        try {
          let url = config.Api + "Permission/updatePermission/";
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
          getAllPermissions()
          // setFilteredData(result)
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      }

  const handleSubmit = (e) => {
    e.preventDefault();
    // onSave({ ...formData, totalHours: parseFloat(formData.totalHours) });
     if (formData._id) {
              updatePermission({ ...formData, totalHours: parseFloat(formData.totalHours) });
              toast({
                title: 'Permission Updated',
                description: "Permission has been updated successfully.",
              });
            } else {
              createPermission({ ...formData, totalHours: parseFloat(formData.totalHours) });
              toast({
                title: 'Permission Added',
                description: `Permission Request has been added to the system.`,
              });
            }
    setOpen(false);
  };

  const canSelectEmployee = user.role === 'Admin' || user.role === 'Super Admin';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{permission ? 'Edit Permission' : 'Request Permission'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <Select
                                                 name="employee"
                                                 value={formData.employeeId} // store only _id
                                                 disabled={!canSelectEmployee}
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
                                                                                      name="requestedToName"
                                                                                      value={formData.requestedTo} // store only _id
                                                                                      onOpenChange={async (open) => {
                                                                                        if (open && (!Data || Data.length === 0)) {
                                                                                          await getEmployeeList();
                                                                                        }
                                                                                      }}
                                                                                      onValueChange={(id) => {
                                                                                        if (!id) return;
                                                                                        const dept = Data.find(d => d._id === id);
                                                                                        if (dept) {
                                                                                          handleSelectChange('requestedTo', 'requestedToName', dept._id, dept.name);
                                                                                        }
                                                                                      }}
                                                                                      // required
                                                                                    >
                                                                                      <SelectTrigger className="glass-effect border-white/10">
                                                                                        <SelectValue placeholder="Request To" >
                                                                                          {formData.requestedToName}
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
            <div><Label>Date</Label><Input type="date" name="permissionDate" value={formData.permissionDate} onChange={handleChange} required className="bg-white/5" /></div>
            <div><Label>From Time</Label><Input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} required className="bg-white/5" /></div>
            <div><Label>To Time</Label><Input type="time" name="toTime" value={formData.toTime} onChange={handleChange} required className="bg-white/5" /></div>
            <div><Label>Total Hours</Label><Input type="number" name="totalHours" value={formData.totalHours} onChange={handleChange} placeholder="e.g., 2" required className="bg-white/5" disabled/></div>
          </div>
          <Input name="reason" value={formData.reason} onChange={handleChange} placeholder="Reason for permission" required className="bg-white/5" />
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PermissionsPage = () => {
  const { permissions, employees, addPermission, deletePermission } = useData();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [ Permissions,setPermissions]=useState([])

    useEffect(()=>{
      getAllPermissions()
    },[])
      const getAllPermissions = async () => {
        try {
          let url = config.Api + "Permission/getAllPermissions/";
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
          setPermissions(result)
          // setState(result)
          // setFilteredData(result)
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      }
  const handleAddNew = () => {
    setSelectedPermission(null);
    setIsFormOpen(true);
  };

  const handleEdit = (permission) => {
    setSelectedPermission(permission);
    setIsFormOpen(true);
  };

  const handleDelete = (permission) => {
    setSelectedPermission(permission);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deletePermission(selectedPermission._id);
    toast({ title: "Permission Deleted" });
    setIsConfirmOpen(false);
  };
const updatePermission = async (data) => {
        try {
          let url = config.Api + "Permission/updatePermissionStatus/";
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
          getAllPermissions()
          // setFilteredData(result)
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      }

  const handleSave = (permissionData) => {
    if (selectedPermission) {
      updatePermission({ ...permissionData, _id: selectedPermission._id });
      toast({ title: "Permission Updated" });
    } else {
      addPermission(permissionData);
      toast({ title: "Permission Request Submitted", description: "Admins have been notified." });
    }
  };

  const handleStatusChange = (permission, status) => {
    updatePermission({ ...permission, status });
    toast({ title: `Permission ${status}` });
  };

  const canManage = user.role === 'Admin' || user.role === 'Super Admin';
  const userPermissions = canManage ? Permissions : Permissions.filter(p => p.employeeId._id === user._id);

  return (
    <>
      <Helmet>
        <title>Permissions - ENIS-HRMS</title>
        <meta name="description" content="Manage employee permissions for late coming or early leaving." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <PermissionForm open={isFormOpen} setOpen={setIsFormOpen} permission={selectedPermission} onSave={handleSave} getAllPermissions={getAllPermissions} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Permission?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Permissions</h1>
            <p className="text-gray-400">Manage employee permissions for late coming or early leaving.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Request Permission</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Permission Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Employee</th><th>Date</th><th>Hours</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {userPermissions.map(permission => {
                      return (
                        <tr key={permission._id}>
                          <td>{permission.employeeId.name || 'Unknown'}</td>
                          <td>{permission.permissionDate.split('T')[0].split('-').reverse().join('-')}</td>
                          <td>{permission.totalHours}</td>
                          <td>{permission.reason}</td>
                          <td><span className={`status-badge ${permission.RequestStatusId?.StatusName === 'Approved' ? 'status-active' : permission.RequestStatusId?.StatusName === 'Pending' ? 'status-pending' : 'status-inactive'}`}>{permission.RequestStatusId?.StatusName}</span></td>
                          <td>
                            <div className="flex gap-2">
                              {canManage && permission.RequestStatusId?.StatusName === 'Pending' && (
                                <>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400" onClick={() => handleStatusChange(permission, 'Approved')}><CheckCircle className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleStatusChange(permission, 'Rejected')}><XCircle className="w-4 h-4" /></Button>
                                </>
                              )}
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(permission)}><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(permission)}><Trash2 className="w-4 h-4" /></Button>
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

export default PermissionsPage;