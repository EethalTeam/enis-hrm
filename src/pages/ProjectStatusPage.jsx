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

const ProjectStatusForm = ({ open, setOpen, projectStatus,getProjectStatus }) => {
  const [formData, setFormData] = useState(
    projectStatus || { name: '',_id:''}
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData._id){
      updateProjectStatus(formData)
    }else{
      createProjectStatus(formData)
    }
    setOpen(false);
  };
    const createProjectStatus = async (data) => {
      try {
        let url = config.Api + "ProjectStatus/createProjectStatus";
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create Project Status');
        }
        const result = await response.json();
        getProjectStatus()
        return result;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    };
   const updateProjectStatus = async(data)=>{
 try {
      let url = config.Api + "ProjectStatus/updateProjectStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update ProjectStatus');
      }
   getProjectStatus()
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
          <DialogTitle>{projectStatus ? 'Edit Project Status' : 'Add New Project Status'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Project Status</Label>
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

const ProjectStatussPage = () => {
  const { projectStatuss, addProjectStatus, updateProjectStatus } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProjectStat, setSelectedProjectStat] = useState(null);
  const [ProjectStatus,setProjectStatus]= useState([])

  const handleAddNew = () => {
    setSelectedProjectStat(null);
    setIsFormOpen(true);
  };
  let api=false
useEffect(()=>{
  if(ProjectStatus.length === 0){
getProjectStatus()
api=true
  }
}),[ProjectStatus]
  const getProjectStatus = async () => {
    try {
      let url = config.Api + "ProjectStatus/getAllProjectStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to get Project Status');
      }
      const result = await response.json();
      setProjectStatus(result)
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const deleteProjectStatus = async(id)=>{
    try {
      let url = config.Api + "ProjectStatus/deleteProjectStatus";
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:id}),
      });

      if (!response.ok) {
        throw new Error('Failed to delete ProjectStatus');
      }

      const result = await response.json();
      getProjectStatus();
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  const handleEdit = (ProjectStatus) => {
    setSelectedProjectStat(ProjectStatus);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedProjectStat(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteProjectStatus(selectedProjectStat);
    toast({ title: "Project Status Deleted" });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Project Status - ENIS-HRMS</title>
        <meta name="description" content="Manage company project status." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <ProjectStatusForm open={isFormOpen} setOpen={setIsFormOpen} projectStatus={selectedProjectStat} getProjectStatus={getProjectStatus}/>}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Project Status?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Project Status</h1>
            <p className="text-gray-400">Manage your company's project status.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Project Status</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Project Status List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Project Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {(ProjectStatus || []).map(projectStat => (
                      <tr key={projectStat.id}>
                        <td>{projectStat.name}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(projectStat)}><Edit className="w-4 h-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(projectStat._id)}><Trash2 className="w-4 h-4" /></Button>
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

export default ProjectStatussPage;