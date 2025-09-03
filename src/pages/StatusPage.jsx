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

const StatusForm = ({ open, setOpen, status,getStatus }) => {
  const [formData, setFormData] = useState(
    status || { statusName: '',_id:''}
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateStatus(formData)
    }else{
      createStatus(formData)
    }
    setOpen(false);
  };
    const createStatus = async (data) => {
      try {
        let url = config.Api + "Status/createStatus";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Status');
        }
        const result = await response.json();
        getStatus()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateStatus = async(data)=>{
 try {
      let url = config.Api + "Status/updateStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update Status');
      }
   getStatus()
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
          <DialogTitle>{status ? 'Edit Status' : 'Add New Status'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="statusName">Status</Label>
            <Input id="statusName" name="statusName" value={formData.statusName} onChange={handleChange} required className="bg-white/5" />
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

const StatusPage = () => {
  const { statuss, addStatus, updateStatus } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedWorkLoc, setSelectedWorkLoc] = useState(null);
  const [Status,setStatus]= useState([])

  const handleAddNew = () => {
    setSelectedWorkLoc(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(Status.length === 0 && api ){
getStatus()
api=true
  }
}),[Status]
  const getStatus = async () => {
    try {
      let url = config.Api + "Status/getAllStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get Status');
      }
      const result = await response.json();
      setStatus(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteStatus = async(id)=>{
    try {
      let url = config.Api + "Status/deleteStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:id}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete Status');
      }

      const result = await response.json();
      getStatus();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (Status) => {
    setSelectedWorkLoc(Status);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedWorkLoc(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteStatus(selectedWorkLoc);
    toast({ title: "Status Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Statuss - ENIS-HRMS</title>
        <meta name="description" content="Manage company status." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <StatusForm open={isFormOpen} setOpen={setIsFormOpen} status={selectedWorkLoc} getStatus={getStatus}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Status?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Statuss</h1>
            <p className="text-gray-400">Manage your company's status.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Status</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Status List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(Status || []).map(workLoc => (
                      <tr key={workLoc.id}>
                        <td>{workLoc.statusName}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(workLoc)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(workLoc._id)}><Trash2 className="w-4 h-4" /></Button>
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

export default StatusPage;
