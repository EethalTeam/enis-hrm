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

const TaskPriorityForm = ({ open, setOpen, taskPriority,getTaskPriority }) => {
  const [formData, setFormData] = useState(
    taskPriority || { name: '',_id:''}
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateTaskPriority(formData)
    }else{
      createTaskPriority(formData)
    }
    setOpen(false);
  };
    const createTaskPriority = async (data) => {
      try {
        let url = config.Api + "TaskPriority/createTaskPriority";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Task Status');
        }
        const result = await response.json();
        getTaskPriority()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateTaskPriority = async(data)=>{
 try {
      let url = config.Api + "TaskPriority/updateTaskPriority";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update TaskPriority');
      }
   getTaskPriority()
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
   }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{taskPriority ? 'Edit Task Status' : 'Add New Task Status'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Task Status</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-white/5" />
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

const TaskPriorityPage = () => {
  const { taskPriority, addTaskPriority, updateTaskPriority } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTaskStat, setSelectedTaskStat] = useState(null);
  const [TaskPriority,setTaskPriority]= useState([])

  const handleAddNew = () => {
    setSelectedTaskStat(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(TaskPriority.length === 0 && api){
getTaskPriority()
api=true
  }
}),[TaskPriority]
  const getTaskPriority = async () => {
    try {
      let url = config.Api + "TaskPriority/getAllTaskPriority";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get Task Status');
      }
      const result = await response.json();
      setTaskPriority(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteTaskPriority = async(id)=>{
    try {
      let url = config.Api + "TaskPriority/deleteTaskPriority";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:id}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete TaskPriority');
      }

      const result = await response.json();
      getTaskPriority();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (TaskPriority) => {
    setSelectedTaskStat(TaskPriority);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedTaskStat(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteTaskPriority(selectedTaskStat);
    toast({ title: "Task Status Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Task Status - ENIS-HRMS</title>
        <meta name="description" content="Manage company task status." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <TaskPriorityForm open={isFormOpen} setOpen={setIsFormOpen} taskPriority={selectedTaskStat} getTaskPriority={getTaskPriority}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Task Status?" description="This action cannot be undone." />}
      </AnimatePresence>

\
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Task Status</h1>
            <p className="text-gray-400">Manage your company's task status.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Task Status</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Task Status List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Task Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(TaskPriority || []).map(taskStat => (
                      <tr key={taskStat.id}>
                        <td>{taskStat.name}</td>
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

export default TaskPriorityPage;