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

const LeadStatusForm = ({ open, setOpen, leadStatus,getLeadStatus }) => {
  const [formData, setFormData] = useState(
    leadStatus || { statusName: '',_id:''}
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateLeadStatus(formData)
    }else{
      createLeadStatus(formData)
    }
    setOpen(false);
  };
    const createLeadStatus = async (data) => {
      try {
        let url = config.Api + "LeadStatus/createLeadStatus";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Lead Status');
        }
        const result = await response.json();
        getLeadStatus()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateLeadStatus = async(data)=>{
 try {
      let url = config.Api + "LeadStatus/updateLeadStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update LeadStatus');
      }
   getLeadStatus()
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
          <DialogTitle>{leadStatus ? 'Edit Lead Status' : 'Add New Lead Status'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="statusName">Lead Status</Label>
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

const LeadStatussPage = () => {
  const { leadStatuss, addLeadStatus, updateLeadStatus } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedLeadStat, setSelectedLeadStat] = useState(null);
  const [LeadStatus,setLeadStatus]= useState([])

  const handleAddNew = () => {
    setSelectedLeadStat(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(LeadStatus.length === 0 && !api){
getLeadStatus()
api=true
  }
}),[LeadStatus]
  const getLeadStatus = async () => {
    try {
      let url = config.Api + "LeadStatus/getAllLeadStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get Lead Status');
      }
      const result = await response.json();
      setLeadStatus(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteLeadStatus = async(id)=>{
    try {
      let url = config.Api + "LeadStatus/deleteLeadStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:id}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete LeadStatus');
      }

      const result = await response.json();
      getLeadStatus();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (LeadStatus) => {
    setSelectedLeadStat(LeadStatus);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedLeadStat(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteLeadStatus(selectedLeadStat);
    toast({ title: "Lead Status Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Lead Status - ENIS-HRMS</title>
        <meta name="description" content="Manage company lead status." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <LeadStatusForm open={isFormOpen} setOpen={setIsFormOpen} leadStatus={selectedLeadStat} getLeadStatus={getLeadStatus}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Lead Status?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Status</h1>
            <p className="text-gray-400">Manage your company's lead status.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Lead Status</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Lead Status List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Lead Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(LeadStatus || []).map(leadStat => (
                      <tr key={leadStat.id}>
                        <td>{leadStat.statusName}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(leadStat)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(leadStat._id)}><Trash2 className="w-4 h-4" /></Button>
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

export default LeadStatussPage;
