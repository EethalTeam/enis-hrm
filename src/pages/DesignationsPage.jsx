import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const DesignationForm = ({ open, setOpen, designation, onSave }) => {
  const { departments } = useData();
  const [formData, setFormData] = useState(
    designation || { name: '', department: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, department: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{designation ? 'Edit Designation' : 'Add New Designation'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Designation Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-white/5" />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Select name="department" value={formData.department} onValueChange={handleSelectChange} required>
              <SelectTrigger className="bg-white/5"><SelectValue placeholder="Select Department" /></SelectTrigger>
              <SelectContent className="glass-effect">{departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
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

const DesignationsPage = () => {
  const { designations, addDesignation, updateDesignation, deleteDesignation } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState(null);

  const handleAddNew = () => {
    setSelectedDesig(null);
    setIsFormOpen(true);
  };

  const handleEdit = (desig) => {
    setSelectedDesig(desig);
    setIsFormOpen(true);
  };

  const handleDelete = (desig) => {
    setSelectedDesig(desig);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteDesignation(selectedDesig.id);
    toast({ title: "Designation Deleted" });
    setIsConfirmOpen(false);
  };

  const handleSave = (desigData) => {
    if (selectedDesig) {
      updateDesignation({ ...desigData, id: selectedDesig.id });
      toast({ title: "Designation Updated" });
    } else {
      addDesignation(desigData);
      toast({ title: "Designation Added" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Designations - ENIS-HRMS</title>
        <meta name="description" content="Manage company designations." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <DesignationForm open={isFormOpen} setOpen={setIsFormOpen} designation={selectedDesig} onSave={handleSave} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Designation?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Designations</h1>
            <p className="text-gray-400">Manage your company's designations.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Designation</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Designation List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Designation Name</th><th>Department</th><th>Actions</th></tr></thead>
                  <tbody>
                    {designations.map(desig => (
                      <tr key={desig.id}>
                        <td>{desig.name}</td>
                        <td>{desig.department}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(desig)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(desig)}><Trash2 className="w-4 h-4" /></Button>
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

export default DesignationsPage;
