import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Hourglass, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const PermissionForm = ({ open, setOpen, permission, onSave }) => {
  const { employees, roles } = useData();
  const { user } = useAuth();
  const [formData, setFormData] = useState(
    permission || { employeeId: user.id, date: '', hours: '', reason: '', status: 'Pending' }
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
    onSave({ ...formData, hours: parseFloat(formData.hours) });
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
          <Select name="employeeId" value={formData.employeeId} onValueChange={(v) => handleSelectChange('employeeId', v)} required disabled={!canSelectEmployee}>
            <SelectTrigger className="bg-white/5"><SelectValue placeholder="Select Employee" /></SelectTrigger>
            <SelectContent className="glass-effect">{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date</Label><Input type="date" name="date" value={formData.date} onChange={handleChange} required className="bg-white/5" /></div>
            <div><Label>Hours</Label><Input type="number" name="hours" value={formData.hours} onChange={handleChange} placeholder="e.g., 2" required className="bg-white/5" /></div>
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
  const { permissions, employees, addPermission, updatePermission, deletePermission } = useData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
    deletePermission(selectedPermission.id);
    toast({ title: "Permission Deleted" });
    setIsConfirmOpen(false);
  };

  const handleSave = (permissionData) => {
    if (selectedPermission) {
      updatePermission({ ...permissionData, id: selectedPermission.id });
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

  const userPermissions = canManage ? permissions : permissions.filter(p => p.employeeId === user.id);

  return (
    <>
      <Helmet>
        <title>Permissions - ENIS-HRMS</title>
        <meta name="description" content="Manage employee permissions for late coming or early leaving." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <PermissionForm open={isFormOpen} setOpen={setIsFormOpen} permission={selectedPermission} onSave={handleSave} />}
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
                      const employee = employees.find(e => e.id === permission.employeeId);
                      return (
                        <tr key={permission.id}>
                          <td>{employee?.name || 'Unknown'}</td>
                          <td>{permission.date}</td>
                          <td>{permission.hours}</td>
                          <td>{permission.reason}</td>
                          <td><span className={`status-badge ${permission.status === 'Approved' ? 'status-active' : permission.status === 'Pending' ? 'status-pending' : 'status-inactive'}`}>{permission.status}</span></td>
                          <td>
                            <div className="flex gap-2">
                              {canManage && permission.status === 'Pending' && (
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