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

const WorkLocationForm = ({ open, setOpen, workLocation,getWorkLocation }) => {
  const [formData, setFormData] = useState(
    workLocation || { locationName: '',_id:''}
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateWorkLocation(formData)
    }else{
      createWorkLocation(formData)
    }
    setOpen(false);
  };
    const createWorkLocation = async (data) => {
      try {
        let url = config.Api + "WorkLocation/createWorkLocation";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Work Location');
        }
        const result = await response.json();
        getWorkLocation()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateWorkLocation = async(data)=>{
 try {
      let url = config.Api + "WorkLocation/updateWorkLocation";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update WorkLocation');
      }
   getWorkLocation()
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
          <DialogTitle>{workLocation ? 'Edit Work Location' : 'Add New Work Location'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="locationName">Work Location</Label>
            <Input id="locationName" name="locationName" value={formData.locationName} onChange={handleChange} required className="bg-white/5" />
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

const WorkLocationsPage = () => {
  const { workLocations, addWorkLocation, updateWorkLocation } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedWorkLoc, setSelectedWorkLoc] = useState(null);
  const [WorkLocation,setWorkLocation]= useState([])

  const handleAddNew = () => {
    setSelectedWorkLoc(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(WorkLocation.length === 0 && !api){
getWorkLocation()
api=true
  }
}),[WorkLocation]
  const getWorkLocation = async () => {
    try {
      let url = config.Api + "WorkLocation/getAllWorkLocation";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get Work Location');
      }
      const result = await response.json();
      setWorkLocation(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteWorkLocation = async(id)=>{
    try {
      let url = config.Api + "WorkLocation/deleteWorkLocation";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:id}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete WorkLocation');
      }

      const result = await response.json();
      getWorkLocation();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (WorkLocation) => {
    setSelectedWorkLoc(WorkLocation);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedWorkLoc(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteWorkLocation(selectedWorkLoc);
    toast({ title: "Work Location Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Work Locations - ENIS-HRMS</title>
        <meta name="description" content="Manage company work locations." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <WorkLocationForm open={isFormOpen} setOpen={setIsFormOpen} workLocation={selectedWorkLoc} getWorkLocation={getWorkLocation}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Work Location?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Work Locations</h1>
            <p className="text-gray-400">Manage your company's work locations.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Work Location</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Work Location List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Work Location</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(WorkLocation || []).map(workLoc => (
                      <tr key={workLoc.id}>
                        <td>{workLoc.locationName}</td>
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

export default WorkLocationsPage;
