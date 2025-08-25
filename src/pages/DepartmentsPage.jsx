import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const DepartmentForm = ({ open, setOpen, department, onSave }) => {
  const [formData, setFormData] = useState(
    department || { name: '', head: '' }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          <DialogTitle>{department ? 'Edit Department' : 'Add New Department'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Department Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="bg-white/5" />
          </div>
          <div>
            <Label htmlFor="head">Department Head</Label>
            <Input id="head" name="head" value={formData.head} onChange={handleChange} required className="bg-white/5" />
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

const DepartmentsPage = () => {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useData();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const handleAddNew = () => {
    setSelectedDept(null);
    setIsFormOpen(true);
  };

  const handleEdit = (dept) => {
    setSelectedDept(dept);
    setIsFormOpen(true);
  };

  const handleDelete = (dept) => {
    setSelectedDept(dept);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteDepartment(selectedDept.id);
    toast({ title: "Department Deleted" });
    setIsConfirmOpen(false);
  };

  const handleSave = (deptData) => {
    if (selectedDept) {
      updateDepartment({ ...deptData, id: selectedDept.id });
      toast({ title: "Department Updated" });
    } else {
      addDepartment(deptData);
      toast({ title: "Department Added" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Departments - ENIS-HRMS</title>
        <meta name="description" content="Manage company departments." />
      </Helmet>
      <AnimatePresence>
        {isFormOpen && <DepartmentForm open={isFormOpen} setOpen={setIsFormOpen} department={selectedDept} onSave={handleSave} />}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} title="Delete Department?" description="This action cannot be undone." />}
      </AnimatePresence>

      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Departments</h1>
            <p className="text-gray-400">Manage your company's departments.</p>
          </div>
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600"><Plus className="w-4 h-4 mr-2" />Add Department</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Department List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Department Name</th><th>Department Head</th><th>Actions</th></tr></thead>
                  <tbody>
                    {departments.map(dept => (
                      <tr key={dept.id}>
                        <td>{dept.name}</td>
                        <td>{dept.head}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(dept)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400" onClick={() => handleDelete(dept)}><Trash2 className="w-4 h-4" /></Button>
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

export default DepartmentsPage;
