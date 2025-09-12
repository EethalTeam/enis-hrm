import React, { useState , useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/components/CustomComponents/config';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { apiRequest } from '@/components/CustomComponents/apiRequest'

const LeaveTypeForm = ({ open, setOpen, leaveType,getLeaveType }) => {
  const [formData, setFormData] = useState(
    leaveType || { LeaveTypeName: '',_id:''}
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateLeaveType(formData)
    }else{
      createLeaveType(formData)
    }
    setOpen(false);
  };
    const createLeaveType = async (data) => {
      try {
        const response = await apiRequest("LeaveType/createLeaveType", {
          method: 'POST',
          body: JSON.stringify(data),
        });

        getLeaveType()
        return response;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateLeaveType = async(data)=>{
 try {
      const response = await apiRequest("LeaveType/updateLeaveType", {
        method: 'POST',
        body: JSON.stringify(data),
      });
   getLeaveType()
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
   }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{leaveType ? 'Edit Leave Type' : 'Add New Leave Type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="LeaveTypeName">Leave Type</Label>
            <Input id="LeaveTypeName" name="LeaveTypeName" value={formData.LeaveTypeName} onChange={handleChange} required className="bg-white/5" />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const LeaveTypePage = () => {
  const { leaveType, addLeaveType, updateLeaveType } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTaskStat, setSelectedTaskStat] = useState(null);
  const [LeaveType,setLeaveType]= useState([])

  const handleAddNew = () => {
    setSelectedTaskStat(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(LeaveType.length === 0 && !api){
getLeaveType()
api=true
  }
}),[LeaveType]
  const getLeaveType = async () => {
    try {
      const response = await apiRequest("LeaveType/getAllLeaveType", {
        method: 'POST',
        body: JSON.stringify({}),
      });

      setLeaveType(response)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteLeaveType = async(id)=>{
    try {
      const response = await apiRequest("LeaveType/deleteLeaveType", {
        method: 'POST',
        body: JSON.stringify({_id:id}),
      });

      getLeaveType();
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (LeaveType) => {
    setSelectedTaskStat(LeaveType);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedTaskStat(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteLeaveType(selectedTaskStat);
    toast({ title: "Leave Type Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Leave Type - ENIS-HRMS</title>
        <meta name="description" content="Manage company leave type." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <LeaveTypeForm open={isFormOpen} setOpen={setIsFormOpen} leaveType={selectedTaskStat} getLeaveType={getLeaveType}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Leave Type?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Leave Type</h1>
            <p className="text-gray-400">Manage your company's leave type.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Leave Type</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Leave Type List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Leave Type</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(LeaveType || []).map(taskStat => (
                      <tr key={taskStat.id}>
                        <td>{taskStat.LeaveTypeName}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(taskStat)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(taskStat._id)}><Trash2 className="w-4 h-4" /></Button>
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

export default LeaveTypePage;